// 'use server';

// import { FormState, reconcileAccountFormSchema, updateReconciliationFormSchema } from '@/types/forms';
// import { createClient } from '@/utils/supabase/server';
// import { revalidatePath } from 'next/cache';

// export async function reconcileAccount(prevState: FormState, formData: FormData): Promise<FormState> {
//   const rawFormData = Object.fromEntries(formData.entries());
//   const validationResult = reconcileAccountFormSchema.safeParse(rawFormData);

//   if (!validationResult.success) {
//     return {
//       success: false,
//       message: 'Erro ao validar os dados',
//       errors: validationResult.error.flatten().fieldErrors,
//     };
//   }

//   try {
//     const supabase = await createClient();
//     const balance = parseFloat(validationResult.data.balance.replace(',', '.'));

//     const { error } = await supabase.from('account_reconciliations').insert({
//       account_id: validationResult.data.account_id,
//       balance: balance,
//       reconciliation_date: validationResult.data.date,
//       notes: validationResult.data.notes || null,
//     });

//     if (error) throw error;

//     revalidatePath(`/accounts/${validationResult.data.account_id}`);

//     return {
//       success: true,
//       message: 'Reconciliação adicionada com sucesso',
//     };
//   } catch (error) {
//     return {
//       success: false,
//       message: 'Erro ao adicionar a reconciliação',
//       errors: {
//         server: [error instanceof Error ? error.message : 'Erro desconhecido'],
//       },
//     };
//   }
// }

// export async function updateReconciliation(prevState: FormState, formData: FormData): Promise<FormState> {
//   const rawFormData = Object.fromEntries(formData.entries());
//   const validationResult = updateReconciliationFormSchema.safeParse(rawFormData);

//   if (!validationResult.success) {
//     return {
//       success: false,
//       message: 'Erro ao validar os dados',
//       errors: validationResult.error.flatten().fieldErrors,
//     };
//   }

//   try {
//     const supabase = await createClient();
//     const balance = parseFloat(validationResult.data.balance.replace(',', '.'));

//     const { error } = await supabase
//       .from('account_reconciliations')
//       .update({
//         balance: balance,
//         reconciliation_date: validationResult.data.date,
//         notes: validationResult.data.notes || null,
//       })
//       .eq('id', validationResult.data.id);

//     if (error) throw error;

//     revalidatePath(`/accounts/${validationResult.data.account_id}`);

//     return {
//       success: true,
//       message: 'Reconciliação atualizada com sucesso',
//     };
//   } catch (error) {
//     return {
//       success: false,
//       message: 'Erro ao atualizar a reconciliação',
//       errors: {
//         server: [error instanceof Error ? error.message : 'Erro desconhecido'],
//       },
//     };
//   }
// }

// export async function deleteReconciliation(id: string, accountId: string): Promise<FormState> {
//   try {
//     const supabase = await createClient();

//     const { error } = await supabase.from('account_reconciliations').delete().eq('id', id);

//     if (error) throw error;

//     revalidatePath(`/accounts/${accountId}`);

//     return {
//       success: true,
//       message: 'Reconciliação excluída com sucesso',
//     };
//   } catch (error) {
//     return {
//       success: false,
//       message: 'Erro ao excluir a reconciliação',
//       errors: {
//         server: [error instanceof Error ? error.message : 'Erro desconhecido'],
//       },
//     };
//   }
// }
