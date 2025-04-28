// "use server";

// export async function deleteAccount(prevState: FormState, formData: FormData): Promise<FormState> {
//   const rawFormData = Object.fromEntries(formData.entries());

//   const validationResult = deleteAccountFormSchema.safeParse(rawFormData);

//   if (!validationResult.success) {
//     return {
//       success: false,
//       message: "Erro ao validar os dados",
//       errors: validationResult.error.flatten().fieldErrors,
//     };
//   }

//   try {
//     const supabase = await createClient();
//     const { id, deleteOption, transferTo } = validationResult.data;

//     // Check if account exists
//     const { data: account, error: accountError } = await supabase
//       .from("accounts")
//       .select("id, name")
//       .eq("id", id)
//       .single();

//     if (accountError || !account) {
//       return {
//         success: false,
//         message: "Conta não encontrada",
//         errors: {
//           id: ["Conta não encontrada ou já foi removida"],
//         },
//       };
//     }

//     // Handle data transfer to another account
//     if (deleteOption === "transfer" && transferTo) {
//       // Verify target account exists
//       const { data: targetAccount, error: targetError } = await supabase
//         .from("accounts")
//         .select("id, name")
//         .eq("id", transferTo)
//         .single();

//       if (targetError || !targetAccount) {
//         return {
//           success: false,
//           message: "Conta de destino não encontrada",
//           errors: {
//             transferTo: ["Conta de destino não encontrada ou já foi removida"],
//           },
//         };
//       }

//       // Transfer transactions
//       const { error: transactionsError } = await supabase
//         .from("transactions")
//         .update({ account_id: transferTo })
//         .eq("account_id", id);

//       if (transactionsError) {
//         return {
//           success: false,
//           message: "Erro ao transferir as transações",
//           errors: {
//             server: [transactionsError.message || "Erro desconhecido"],
//           },
//         };
//       }

//       // Note: Reconciliations can't be transferred as they're account-specific
//       // They'll be deleted with the account through CASCADE
//     } else if (deleteOption === "cascade") {
//       // For cascade delete, we need to properly handle all transactions
//       // First, get all transactions for this account
//       const { data: accountTransactions, error: accTxError } = await supabase
//         .from("transactions")
//         .select("id")
//         .eq("account_id", id);

//       if (accTxError) {
//         return {
//           success: false,
//           message: "Erro ao buscar transações da conta",
//           errors: {
//             server: [accTxError.message || "Erro desconhecido"],
//           },
//         };
//       }

//       // Delete each transaction using the deleteTransaction function
//       // This ensures proper handling of linked transactions and transfers
//       for (const transaction of accountTransactions || []) {
//         const result = await deleteTransaction(transaction.id);
//         if (!result.success) {
//           console.error(`Erro ao deletar transação ${transaction.id}: ${result.message}`);
//           // Continue with other transactions even if one fails
//         }
//       }
//     }

//     // Delete the account (with CASCADE for reconciliations and other dependent records)
//     const { error: deleteError } = await supabase.from("accounts").delete().eq("id", id);

//     if (deleteError) {
//       return {
//         success: false,
//         message: "Erro ao deletar a conta",
//         errors: {
//           server: [deleteError.message || "Erro desconhecido"],
//         },
//       };
//     }

//     return {
//       success: true,
//       message:
//         deleteOption === "transfer"
//           ? "Conta excluída e transações transferidas com sucesso"
//           : "Conta excluída com sucesso",
//     };
//   } catch (error) {
//     return {
//       success: false,
//       message: "Erro ao deletar a conta",
//       errors: {
//         server: [error instanceof Error ? error.message : "Erro desconhecido"],
//       },
//     };
//   }
// }
