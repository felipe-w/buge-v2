// "use server";

// import { deleteCategoryFormSchema, FormState } from "@/types/forms";
// import { createClient } from "@/utils/supabase/server";
// import { revalidatePath } from "next/cache";
// import { deleteTransaction } from "../transactions/actions";

// export async function deleteCategory(prevState: FormState, formData: FormData): Promise<FormState> {
//   const rawFormData = Object.fromEntries(formData.entries());
//   const validationResult = deleteCategoryFormSchema.safeParse(rawFormData);

//   if (!validationResult.success) {
//     return {
//       success: false,
//       message: "Erro ao validar os dados",
//       errors: validationResult.error.flatten().fieldErrors,
//     };
//   }

//   try {
//     const supabase = await createClient();
//     const { id, action, targetCategoryId } = validationResult.data;

//     const { data: category, error: categoryError } = await supabase
//       .from("categories")
//       .select("id, name, type, parent_id")
//       .eq("id", id)
//       .single();

//     if (categoryError || !category) {
//       return {
//         success: false,
//         message: "Categoria não encontrada",
//         errors: {
//           id: ["Categoria não encontrada ou já foi removida"],
//         },
//       };
//     }

//     const isTopLevel = category.parent_id === null;

//     // Check if the category has subcategories (for top-level categories)
//     if (isTopLevel) {
//       const { data: subcategories, error: subcategoriesError } = await supabase
//         .from("categories")
//         .select("id")
//         .eq("parent_id", id);

//       if (subcategoriesError) throw subcategoriesError;

//       if (subcategories && subcategories.length > 0) {
//         return {
//           success: false,
//           message: "Categoria possui subcategorias",
//           errors: {
//             server: [
//               "Não é possível excluir uma categoria que possui subcategorias. Remova as subcategorias primeiro.",
//             ],
//           },
//         };
//       }

//       // Top-level categories don't have transactions directly associated with them
//       // Just delete the category
//       const { error: deleteError } = await supabase.from("categories").delete().eq("id", id);
//       if (deleteError) throw deleteError;

//       revalidatePath("/setup/categories");
//       return {
//         success: true,
//         message: "Categoria excluída com sucesso",
//       };
//     }

//     // Handle subcategory deletion
//     else {
//       if (action === "transfer" && targetCategoryId) {
//         const { data: targetCategory, error: targetError } = await supabase
//           .from("categories")
//           .select("id, type, parent_id")
//           .eq("id", targetCategoryId)
//           .single();

//         if (targetError || !targetCategory) {
//           return {
//             success: false,
//             message: "Categoria de destino não encontrada",
//             errors: {
//               targetCategoryId: ["Categoria de destino não encontrada ou já foi removida"],
//             },
//           };
//         }

//         if (targetCategory.type !== category.type) {
//           return {
//             success: false,
//             message: "Tipos de categoria incompatíveis",
//             errors: {
//               targetCategoryId: [
//                 "A categoria de destino deve ser do mesmo tipo (receita ou despesa) que a categoria sendo excluída",
//               ],
//             },
//           };
//         }

//         if (targetCategory.parent_id === null) {
//           return {
//             success: false,
//             message: "Categoria de destino inválida",
//             errors: {
//               targetCategoryId: ["A categoria de destino deve ser uma subcategoria, não uma categoria principal"],
//             },
//           };
//         }

//         // Transfer transactions
//         const { error: transactionsError } = await supabase
//           .from("transactions")
//           .update({ category_id: targetCategoryId })
//           .eq("category_id", id);

//         if (transactionsError) throw transactionsError;

//         // Transfer budget items - handle potential conflicts
//         const { data: budgetItems } = await supabase.from("budget_items").select("*").eq("category_id", id);

//         if (budgetItems && budgetItems.length > 0) {
//           for (const item of budgetItems) {
//             // Check if there's already a budget item for the target category in this budget
//             const { data: existingItem } = await supabase
//               .from("budget_items")
//               .select("*")
//               .eq("budget_id", item.budget_id)
//               .eq("category_id", targetCategoryId)
//               .single();

//             if (existingItem) {
//               // If exists, update the amount (add them together)
//               await supabase
//                 .from("budget_items")
//                 .update({ amount: existingItem.amount + item.amount })
//                 .eq("id", existingItem.id);

//               // Delete the original item
//               await supabase.from("budget_items").delete().eq("id", item.id);
//             } else {
//               // If doesn't exist, just update the category_id
//               await supabase.from("budget_items").update({ category_id: targetCategoryId }).eq("id", item.id);
//             }
//           }
//         }

//         // Similar logic for tracking_items
//         const { data: trackingItems } = await supabase.from("tracking_items").select("*").eq("category_id", id);

//         if (trackingItems && trackingItems.length > 0) {
//           for (const item of trackingItems) {
//             const { data: existingItem } = await supabase
//               .from("tracking_items")
//               .select("*")
//               .eq("tracking_id", item.tracking_id)
//               .eq("category_id", targetCategoryId)
//               .single();

//             if (existingItem) {
//               await supabase
//                 .from("tracking_items")
//                 .update({ amount: existingItem.amount + item.amount })
//                 .eq("id", existingItem.id);

//               await supabase.from("tracking_items").delete().eq("id", item.id);
//             } else {
//               await supabase.from("tracking_items").update({ category_id: targetCategoryId }).eq("id", item.id);
//             }
//           }
//         }
//       } else if (action === "cascade") {
//         // For cascade delete, we need to properly handle all transactions
//         const { data: categoryTransactions, error: txError } = await supabase
//           .from("transactions")
//           .select("id")
//           .eq("category_id", id);

//         if (txError) {
//           return {
//             success: false,
//             message: "Erro ao buscar transações da categoria",
//             errors: {
//               server: [txError.message || "Erro desconhecido"],
//             },
//           };
//         }

//         // Delete each transaction using the deleteTransaction function
//         for (const transaction of categoryTransactions || []) {
//           const result = await deleteTransaction(transaction.id);
//           if (!result.success) {
//             console.error(`Erro ao deletar transação ${transaction.id}: ${result.message}`);
//             // Continue with other transactions even if one fails
//           }
//         }
//       }

//       // Finally, delete the category
//       const { error: deleteError } = await supabase.from("categories").delete().eq("id", id);

//       if (deleteError) throw deleteError;

//       revalidatePath("/setup/categories");
//       return {
//         success: true,
//         message:
//           action === "transfer"
//             ? "Categoria excluída e dados transferidos com sucesso"
//             : "Categoria excluída com sucesso",
//       };
//     }
//   } catch (error) {
//     return {
//       success: false,
//       message: "Erro ao excluir categoria",
//       errors: {
//         server: [error instanceof Error ? error.message : "Erro desconhecido"],
//       },
//     };
//   }
// }
