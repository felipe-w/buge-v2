import "server-only";

import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

import { StatementWithAllJoins } from "@/lib/db/types";
import { ExtractedTransactionSchema } from "@/lib/validations";

import { getGroupCategories } from "../data/categories";
import { getStatement, updateStatement } from "../data/statements";

export async function processStatement({ id }: { id: string }) {
  try {
    // 1. retrieve statement data and categories from db
    const statement = await getStatement({ id });
    const categories = await formatHierarchicalCategories({ groupId: statement.account.groupId });

    // Combined extraction and categorization step
    console.log("Extracting and categorizing transactions from statement");
    await updateStatement(statement.id, { status: "extracting" });
    const categorizedTransactions = await extractAndCategorizeTransactionsWithAI({ statement, categories });
    if (categorizedTransactions.length === 0) throw new Error("Não foi possível extrair e categorizar transações");

    // Transactions ready to be validated and imported
    await updateStatement(statement.id, { aiResponse: categorizedTransactions, status: "validating" });
    console.log("Transactions extracted and categorized successfully");
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

async function extractAndCategorizeTransactionsWithAI({
  statement,
  categories,
}: {
  statement: StatementWithAllJoins;
  categories: string;
}) {
  // Select the base prompt based on statement type
  const basePrompt = statement.statementType === "credit_card" ? PROMPT_CREDIT_CARD : PROMPT_BANK_STATEMENT;

  // Create the combined prompt with categories information
  const FINAL_PROMPT = `
  ${basePrompt}

  Additionally, I want you to categorize each transaction using the following categories:
  ${categories}

  ${PROMPT_CATEGORIZATION_INSTRUCTIONS}
  `;

  return withRetries(async () => {
    const result = await generateObject({
      model: google("gemini-2.5-pro-preview-05-06"),
      schema: z.array(ExtractedTransactionSchema),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: FINAL_PROMPT },
            { type: "file", mimeType: "application/pdf", data: statement.fileUrl! },
          ],
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

const PROMPT_CATEGORIZATION_INSTRUCTIONS = `
For each transaction, assign a category based on these rules:

1. Parent categories are identified by the 'children' property. They don't have uuid, but their children do, so you must use one of the children's name and uuid.
2. Standalone categories just use their own uuid.
3. Match transaction type (income/expense based on amount sign) with the category type.
4. For each transaction, determine the best-fitting category based on title and description.
5. Fill the "categoryId" field with the UUID of the chosen category and the "categoryName" field with the category name.
6. If no suitable category can be determined, leave categoryId as null or empty.
`;
