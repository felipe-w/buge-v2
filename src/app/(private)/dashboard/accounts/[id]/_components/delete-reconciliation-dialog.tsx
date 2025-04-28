// "use client";

// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { Button } from "@/components/ui/button";
// import { FormState } from "@/types/forms";
// import { Tables } from "@/types/supabase";
// import { UTCDate } from "@date-fns/utc";
// import { format } from "date-fns";
// import { ptBR } from "date-fns/locale";
// import { AlertCircle, Loader2 } from "lucide-react";
// import { useState } from "react";
// import { toast } from "sonner";
// import { deleteReconciliation } from "../actions";

// interface DeleteReconciliationDialogProps {
//   reconciliation: Tables<"account_reconciliations">;
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
// }

// export function DeleteReconciliationDialog({ reconciliation, open, onOpenChange }: DeleteReconciliationDialogProps) {
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [state, setState] = useState<FormState>({
//     success: true,
//     message: "",
//   });

//   const handleDelete = async () => {
//     setIsDeleting(true);
//     try {
//       const result = await deleteReconciliation(reconciliation.id, reconciliation.account_id);

//       if (result.success) {
//         toast.success(result.message);
//         onOpenChange(false);
//       } else {
//         setState(result);
//       }
//     } catch (error: unknown) {
//       setState({
//         success: false,
//         message: "Erro ao excluir a reconciliação",
//         errors: {
//           server: ["Erro desconhecido ao processar a solicitação."],
//         },
//       });
//       console.error("Error deleting reconciliation:", error);
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   return (
//     <AlertDialog open={open} onOpenChange={onOpenChange}>
//       {/* <AlertDialogTrigger asChild>
//         <Button variant="ghost" size="icon" className="h-8 w-8 p-0 bg-card">
//           <Trash2 className="h-4 w-4 text-destructive" />
//           <span className="sr-only">Excluir Reconciliação</span>
//         </Button>
//       </AlertDialogTrigger> */}
//       <AlertDialogContent>
//         <AlertDialogHeader>
//           <AlertDialogTitle>Excluir Reconciliação</AlertDialogTitle>
//           <div>
//             <p className="text-muted-foreground text-sm">
//               Você tem certeza que deseja excluir esta reconciliação de{" "}
//               {format(new UTCDate(reconciliation.reconciliation_date), "dd/MM/yyyy", { locale: ptBR })}?
//             </p>
//             <div className="bg-muted mt-4 rounded-md p-3">
//               <div className="text-sm font-medium">
//                 Saldo reconciliado:{" "}
//                 {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(reconciliation.balance)}
//               </div>
//               {reconciliation.notes && <div className="text-muted-foreground mt-2 text-sm">{reconciliation.notes}</div>}
//             </div>
//           </div>
//         </AlertDialogHeader>

//         {!state.success && state.errors && (
//           <Alert variant="destructive">
//             <AlertCircle className="h-4 w-4" />
//             <AlertTitle>Erro</AlertTitle>
//             <AlertDescription>
//               {state.errors.server ? state.errors.server[0] : "Ocorreu um erro ao excluir a transação."}
//             </AlertDescription>
//           </Alert>
//         )}

//         <AlertDialogFooter>
//           <AlertDialogCancel asChild>
//             <Button variant="outline" disabled={isDeleting}>
//               Cancelar
//             </Button>
//           </AlertDialogCancel>
//           <AlertDialogAction asChild>
//             <Button type="submit" variant="destructive" disabled={isDeleting} onClick={handleDelete}>
//               {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Excluir"}
//             </Button>
//           </AlertDialogAction>
//         </AlertDialogFooter>
//       </AlertDialogContent>
//     </AlertDialog>
//   );
// }
