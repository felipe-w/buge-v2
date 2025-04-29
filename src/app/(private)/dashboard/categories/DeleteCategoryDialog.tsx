// 'use client';

// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// import { Button } from '@/components/ui/button';
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Label } from '@/components/ui/label';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Tables } from '@/types/supabase';
// import { AlertCircle, Loader2 } from 'lucide-react';
// import Form from 'next/form';
// import { useActionState, useEffect, useState } from 'react';
// import { toast } from 'sonner';
// import { deleteCategory } from './actions';

// export default function DeleteCategoryDialog({
//   category,
//   categoriesData,
//   open,
//   onOpenChange,
// }: {
//   category: Tables<'categories'> | null;
//   categoriesData: Tables<'categories'>[];
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
// }) {
//   const [state, formAction, isPending] = useActionState(deleteCategory, { success: false, message: '' });
//   const [action, setAction] = useState<'transfer' | 'cascade'>('transfer');

//   useEffect(() => {
//     if (state.success) {
//       toast.success(state.message);
//       onOpenChange(false);
//     }
//   }, [state, onOpenChange]);

//   if (!category || !open) return null;

//   const isTopLevel = category.parent_id === null;
//   const hasSubcategories = categoriesData.some((child) => child.parent_id === category.id);

//   // For subcategories, get other subcategories of the same type as transfer targets
//   const transferOptions = !isTopLevel
//     ? categoriesData.filter((cat) => {
//         if (cat.type !== category.type) return false;
//         if (cat.id === category.id) return false;
//         if (cat.parent_id === null) return false; // Only subcategories
//         return true;
//       })
//     : [];

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Excluir Categoria</DialogTitle>
//           <DialogDescription>
//             {isTopLevel && hasSubcategories
//               ? 'Não é possível excluir esta categoria pois ela possui subcategorias.'
//               : `Tem certeza que deseja excluir a categoria "${category.name}"?`}
//           </DialogDescription>
//         </DialogHeader>

//         {isTopLevel && hasSubcategories ? (
//           <div className="space-y-6">
//             <Alert>
//               <AlertCircle className="h-4 w-4" />
//               <AlertTitle>Ação não permitida</AlertTitle>
//               <AlertDescription>
//                 Para excluir esta categoria principal, primeiro remova todas as suas subcategorias.
//               </AlertDescription>
//             </Alert>

//             <div className="flex justify-end">
//               <Button type="button" onClick={() => onOpenChange(false)}>
//                 Entendi
//               </Button>
//             </div>
//           </div>
//         ) : isTopLevel ? (
//           // Simple deletion for top-level categories without subcategories
//           <Form action={formAction}>
//             <input type="hidden" name="id" value={category.id} />
//             <input type="hidden" name="action" value="cascade" />

//             <div className="space-y-6">
//               {state.errors && (
//                 <Alert variant="destructive">
//                   <AlertCircle className="h-4 w-4" />
//                   <AlertTitle>Erro</AlertTitle>
//                   <AlertDescription>
//                     {state.errors.server ? state.errors.server[0] : 'Ocorreu um erro ao excluir a categoria.'}
//                   </AlertDescription>
//                 </Alert>
//               )}

//               <Alert>
//                 <AlertCircle className="h-4 w-4" />
//                 <AlertTitle>Confirmação</AlertTitle>
//                 <AlertDescription>
//                   Você está prestes a excluir uma categoria principal. <br /> Esta ação não pode ser desfeita.
//                 </AlertDescription>
//               </Alert>

//               <div className="flex justify-end space-x-2 pt-4">
//                 <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
//                   Cancelar
//                 </Button>
//                 <Button type="submit" variant="destructive" disabled={isPending}>
//                   {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
//                   {isPending ? 'Excluindo...' : 'Excluir'}
//                 </Button>
//               </div>
//             </div>
//           </Form>
//         ) : (
//           // Transfer or cascade options for subcategories
//           <Form action={formAction}>
//             <input type="hidden" name="id" value={category.id} />
//             <div className="space-y-6">
//               {state.errors && (
//                 <Alert variant="destructive">
//                   <AlertCircle className="h-4 w-4" />
//                   <AlertTitle>Erro</AlertTitle>
//                   <AlertDescription>
//                     {state.errors.server ? state.errors.server[0] : 'Ocorreu um erro ao excluir a categoria.'}
//                   </AlertDescription>
//                 </Alert>
//               )}

//               <Alert>
//                 <AlertCircle className="h-4 w-4" />
//                 <AlertTitle>Atenção</AlertTitle>
//                 <AlertDescription>
//                   Esta ação pode afetar transações e orçamentos relacionados a esta categoria. Escolha como deseja
//                   proceder:
//                 </AlertDescription>
//               </Alert>

//               <RadioGroup
//                 defaultValue={transferOptions.length > 0 ? 'transfer' : 'cascade'}
//                 name="action"
//                 onValueChange={(value) => setAction(value as 'transfer' | 'cascade')}
//                 className="space-y-3"
//               >
//                 <div className="flex items-start space-x-2">
//                   <RadioGroupItem value="transfer" id="transfer" disabled={transferOptions.length === 0} />
//                   <div className="grid gap-1.5 leading-none">
//                     <Label htmlFor="transfer" className="font-medium">
//                       Transferir dados
//                     </Label>
//                     <p className="text-sm text-muted-foreground">
//                       Mover todas as transações e orçamentos para outra subcategoria
//                     </p>
//                   </div>
//                 </div>

//                 {action === 'transfer' && transferOptions.length > 0 && (
//                   <div className="ml-6">
//                     <Select name="targetCategoryId" defaultValue={transferOptions[0]?.id} disabled={isPending}>
//                       <SelectTrigger id="targetCategoryId">
//                         <SelectValue placeholder="Selecione uma subcategoria" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {transferOptions.map((transferCat) => {
//                           const parentName = categoriesData.find((c) => c.id === transferCat.parent_id)?.name;
//                           return (
//                             <SelectItem key={transferCat.id} value={transferCat.id}>
//                               {transferCat.name} {parentName ? `(em ${parentName})` : ''}
//                             </SelectItem>
//                           );
//                         })}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 )}

//                 {action === 'transfer' && transferOptions.length === 0 && (
//                   <Alert variant="destructive">
//                     <AlertCircle className="h-4 w-4" />
//                     <AlertTitle>Erro</AlertTitle>
//                     <AlertDescription>
//                       Não há subcategorias disponíveis para transferência. <br />
//                       Crie outra subcategoria do mesmo tipo primeiro.
//                     </AlertDescription>
//                   </Alert>
//                 )}

//                 <div className="flex items-start space-x-2">
//                   <RadioGroupItem value="cascade" id="cascade" />
//                   <div className="grid gap-1.5 leading-none">
//                     <Label htmlFor="cascade" className="font-medium">
//                       Excluir tudo
//                     </Label>
//                     <p className="text-sm text-muted-foreground">
//                       Excluir esta subcategoria e todos os dados relacionados
//                     </p>
//                   </div>
//                 </div>
//               </RadioGroup>

//               <div className="flex justify-end space-x-2 pt-4">
//                 <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
//                   Cancelar
//                 </Button>
//                 <Button
//                   type="submit"
//                   variant="destructive"
//                   disabled={isPending || (action === 'transfer' && transferOptions.length === 0)}
//                 >
//                   {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
//                   {isPending ? 'Excluindo...' : 'Excluir'}
//                 </Button>
//               </div>
//             </div>
//           </Form>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }
