// "use client";

// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Textarea } from "@/components/ui/textarea";
// import { cn } from "@/lib/utils";
// import { Tables } from "@/types/supabase";
// import { UTCDate } from "@date-fns/utc";
// import { format } from "date-fns";
// import { ptBR } from "date-fns/locale";
// import { AlertCircle, CalendarIcon, Loader2 } from "lucide-react";
// import Form from "next/form";
// import { useActionState, useEffect, useState } from "react";
// import { toast } from "sonner";
// import { updateReconciliation } from "../actions";

// interface EditReconciliationDialogProps {
//   reconciliation: Tables<"account_reconciliations">;
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
// }

// export function EditReconciliationDialog({ reconciliation, open, onOpenChange }: EditReconciliationDialogProps) {
//   const [selectedDate, setSelectedDate] = useState<Date>(new UTCDate(reconciliation.reconciliation_date));
//   const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
//   const [state, formAction, isPending] = useActionState(updateReconciliation, { success: false, message: "" });

//   // Handle success
//   useEffect(() => {
//     if (state.success) {
//       toast.success(state.message);
//       onOpenChange(false);
//     }
//   }, [state, onOpenChange]);

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       {/* <DialogTrigger asChild>
//         <Button variant="ghost" size="icon" className="h-8 w-8 p-0 bg-card">
//           <Edit2 className="h-4 w-4 text-muted-foreground" />
//         </Button>
//       </DialogTrigger> */}
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Editar Reconciliação</DialogTitle>
//           <DialogDescription>Modifique os detalhes da reconciliação para a conta.</DialogDescription>
//         </DialogHeader>
//         <Form id="edit-reconciliation-form" action={formAction}>
//           <div className="space-y-6">
//             <input type="hidden" name="id" value={reconciliation.id} />
//             <input type="hidden" name="account_id" value={reconciliation.account_id} />
//             {state.errors?.server && (
//               <Alert variant="destructive">
//                 <AlertCircle className="h-4 w-4" />
//                 <AlertTitle>Erro</AlertTitle>
//                 <AlertDescription>{state.errors.server[0]}</AlertDescription>
//               </Alert>
//             )}

//             <div className="flex flex-col gap-1.5">
//               <Label htmlFor="balance">Saldo Reconciliado</Label>
//               <Input
//                 id="balance"
//                 name="balance"
//                 type="number"
//                 defaultValue={reconciliation.balance}
//                 placeholder="0,00"
//                 required
//                 disabled={isPending}
//               />
//               {state.errors?.balance && <p className="text-destructive text-xs">{state.errors.balance.join(", ")}</p>}
//             </div>

//             <div className="flex flex-col gap-1.5">
//               <Label htmlFor="date">Data da Reconciliação</Label>
//               <input type="hidden" name="date" value={selectedDate.toISOString()} />
//               <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
//                 <PopoverTrigger asChild>
//                   <Button
//                     variant="outline"
//                     className={cn(
//                       "bg-background border-input w-full justify-start text-left font-normal",
//                       !selectedDate && "text-muted-foreground",
//                     )}
//                     disabled={isPending}
//                   >
//                     <CalendarIcon className="mr-2 h-4 w-4" />
//                     {selectedDate ? format(selectedDate, "PP", { locale: ptBR }) : <span>Selecione uma data</span>}
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-auto p-0">
//                   <Calendar
//                     mode="single"
//                     selected={selectedDate}
//                     onSelect={(date) => {
//                       setSelectedDate(date || new UTCDate());
//                       setIsDatePopoverOpen(false);
//                     }}
//                     locale={ptBR}
//                   />
//                 </PopoverContent>
//               </Popover>
//               {state.errors?.date && <p className="text-destructive text-xs">{state.errors.date.join(", ")}</p>}
//             </div>

//             <div className="flex flex-col gap-1.5">
//               <Label htmlFor="notes">Notas (opcional)</Label>
//               <Textarea
//                 id="notes"
//                 name="notes"
//                 defaultValue={reconciliation.notes || ""}
//                 placeholder="Observações sobre esta reconciliação..."
//                 rows={3}
//                 disabled={isPending}
//               />
//               {state.errors?.notes && <p className="text-destructive text-xs">{state.errors.notes.join(", ")}</p>}
//             </div>
//           </div>
//         </Form>

//         <DialogFooter>
//           <DialogClose asChild>
//             <Button variant="outline" disabled={isPending}>
//               Cancelar
//             </Button>
//           </DialogClose>
//           <Button type="submit" variant="secondary" form="edit-reconciliation-form" disabled={isPending}>
//             {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }
