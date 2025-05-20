import "server-only";

import fs from "fs";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { generateObject, LanguageModelV1 } from "ai";
import { z } from "zod";

import { StatementWithAllJoins } from "@/lib/db/types";
import { ExtractedTransactionSchema } from "@/lib/validations";

import { getGroupCategories } from "../data/categories";
import { addStatementTransactions, getStatement, updateStatement } from "../data/statements";

export async function processStatement({ id }: { id: string }) {
  try {
    // 0. retrieve statement data from db
    const statement = await getStatement({ id });

    // 1. extraction phase
    console.log("Extracting transactions from statement");
    await updateStatement(statement.id, { status: "extracting" });
    const extractedTransactions = await extractTransactionsWithAI({ statement });
    if (extractedTransactions.length === 0) throw new Error("Não foi possível extrair transações");
    await updateStatement(statement.id, { aiResponse: extractedTransactions, status: "categorizing" });

    // 2. categorization phase
    console.log("Categorizing transactions");
    const categories = await formatHierarchicalCategories({ groupId: statement.account.groupId });
    const transactions = JSON.stringify(extractedTransactions, null, 2);
    const categorizedTransactions = await categorizeTransactionsWithAI({ categories, transactions });
    if (categorizedTransactions.length === 0) throw new Error("Não foi possível categorizar transações");
    await updateStatement(statement.id, { categorizationResponse: categorizedTransactions });

    // 3. save categorized transactions to db
    console.log("saving transactions to statement_transactions table");
    await addStatementTransactions(statement.id, categorizedTransactions);
    await updateStatement(statement.id, { status: "validating" });
    console.log("background steps finalized!");
  } catch (error) {
    console.error(error);
    await updateStatement(id, {
      error: error instanceof Error ? error.message : "Unknown error",
      status: "failed",
    });
  }
}

async function withRetries<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 180000, // 3 minutes
  maxDelay: number = 720000, // 12 minutes
): Promise<T> {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      attempts++;
      if (attempts >= maxRetries) {
        console.error(`AI call failed after ${maxRetries} attempts:`, error);
        throw error;
      }
      // Exponential backoff with jitter
      let delay = initialDelay * Math.pow(2, attempts - 1);
      delay = Math.min(delay, maxDelay); // Cap the delay
      const jitter = delay * 0.2 * (Math.random() - 0.5); // Add jitter (±10% of delay)
      const totalDelay = Math.max(0, delay + jitter); // Ensure delay is not negative

      console.log(
        `AI call attempt ${attempts} failed. Retrying in ${totalDelay.toFixed(0)}ms... Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      await new Promise((resolve) => setTimeout(resolve, totalDelay));
    }
  }
  // This line should ideally not be reached if maxRetries > 0
  throw new Error("Retry logic failed unexpectedly after all attempts.");
}

function getAIModel(modelName: string) {
  const models: { [key: string]: LanguageModelV1 } = {
    claude: anthropic("claude-3-7-sonnet-20250219"),
    geminiPro: google("gemini-2.5-pro-preview-05-06"),
    geminiFlash: google("gemini-2.5-flash-preview-04-17"),
  };

  return models[modelName] || models.geminiPro;
}

async function extractTransactionsWithAI({
  statement,
  aiModel,
}: {
  statement: StatementWithAllJoins;
  aiModel?: LanguageModelV1;
}) {
  const prompt = statement.statementType === "credit_card" ? PROMPT_CREDIT_CARD : PROMPT_BANK_STATEMENT;

  return withRetries(async () => {
    const result = await generateObject({
      model: aiModel || getAIModel("geminiPro"),
      schema: z.array(ExtractedTransactionSchema),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "file", mimeType: "application/pdf", data: statement.fileUrl! },
          ],
        },
      ],
    });
    return result.object;
  });
}

async function categorizeTransactionsWithAI({
  categories,
  transactions,
  aiModel,
}: {
  categories: string;
  transactions: string;
  aiModel?: LanguageModelV1;
}) {
  const FINAL_PROMPT = `
  ${PROMPT_CATEGORIZATION}

  Here are the categories json:
  ${categories}

  Here are the transactions json:
  ${transactions}
  `;

  fs.writeFileSync("final_prompt.txt", FINAL_PROMPT);

  return withRetries(async () => {
    const result = await generateObject({
      model: aiModel || getAIModel("geminiFlash"),
      schema: z.array(ExtractedTransactionSchema),
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: FINAL_PROMPT }],
        },
      ],
    });
    return result.object;
  });
}

async function formatHierarchicalCategories({ groupId }: { groupId: string }) {
  const categories = await getGroupCategories({ groupId });
  const jsonData = categories.map((category) => {
    if (category.children && category.children.length > 0) {
      return {
        name: category.name,
        type: category.type,
        children: category.children.map((child) => ({ id: child.id, name: child.name })),
      };
    }
    return {
      id: category.id,
      name: category.name,
      type: category.type,
    };
  });

  return JSON.stringify(jsonData, null, 2);
}
const PROMPT_CREDIT_CARD = `
I am attaching a credit card statement as PDF. Extract ALL transactions and return them as a structured JSON array of objects.

Each transaction object should include:
- "date" (YYYY-MM-DD format)
- "title" (merchant/establishment name)
- "description" (additional info like cardholder name and card digits, e.g. "JOHN DOE 1234")
- "categoryName" (if available, otherwise null)
- "amount" (as a string with decimal point - negative for purchases, e.g. "-10.50")

Critical requirements:
1. Include regular purchases, international charges, AND separate line items for any IOF taxes.
2. For IOF entries, use the transaction date of the associated international purchase, list "IOF Tax" as the title.
3. Determine the correct date, month and year from the document context.
4. Disconsider any transaction that makes reference to the payment of a previous month, but include reimbursements, credits or other adjustments.
5. For negative amounts in the statement (marked with '-'), ensure they're represented correctly.
6. VERIFY: Sum all transaction amounts and confirm it matches the statement total. If not, re-check the data.
7. Given this is a credit card bill, positive values are purchases and negative values are reimbursements. I need you to return the signs reversed so we can clearly identify expenses and incomes.
8. Leave "categoryId" empty for now.
Return the data as a valid JSON array of objects. Do not include any explanatory text before or after the JSON.
`;

const PROMPT_BANK_STATEMENT = `
I am sharing with you a bank statement as PDF. Extract ALL transactions and return them as a structured JSON array of objects.

Each transaction object should include:
- "date" (YYYY-MM-DD format)
- "title" (description of the transaction)
- "description" (additional details if available, otherwise null)
- "categoryName" (if available, otherwise null)
- "amount" (as a string with decimal point, e.g. "10.50" for deposits, "-10.50" for withdrawals)

Critical requirements:
1. Do not include lines that are not transactions (like balance information).
2. Determine the correct date, month and year from the document context.
3. Make withdrawals/payments negative and deposits/credits positive.
4. Leave "categoryId" empty for now.

Return the data as a valid JSON array of objects. Do not include any explanatory text before or after the JSON.
`;

const PROMPT_CATEGORIZATION = `
I have attached two json:

- A list of categories with their parent-child relationships and UUIDs (JSON).
- A list of transactions extracted from a PDF bank statement (JSON).

The transactions have categories suggested by the bank, but these are imprecise and do not match the categories I shared, which I want to use instead.

Please perform the following task:

1. Read the categories JSON to understand the category structure, their associated UUIDs and names. There are parent-child categories and standalone categories.
2. Parent categories are identified by the 'children' property. They don't have uuid, but their children do, so you must use one the children's name and uuid instead. Standalone categories just use their own uuid.
3. Categories are either income or expense. The transactions in the JSON are identified as either income or expense by the 'amount' field. (positive or negative)
4. Review each transaction in the JSON and determine the best-fitting category based on the establishment name and other relevant fields.
5. Add a categoryId field to the transactions with the UUID of the most appropriate category from the categories JSON I shared. Also replace the categoryName field with the name of the category.
6. If no suitable category can be determined, don't add a categoryId field and leave the categoryName as it is.

Return the updated transactions as a valid JSON array of objects with the same structure as the input transactions, but with updated 'categoryId' and 'categoryName' values.
Each transaction should have 'date', 'title', 'description', 'categoryId', 'categoryName' and 'amount' fields.
Do not return any explanatory text before or after the JSON.
`;
