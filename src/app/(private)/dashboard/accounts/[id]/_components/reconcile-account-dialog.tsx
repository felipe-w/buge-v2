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
//   DialogTrigger,
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
// import { AlertCircle, CalendarIcon, Loader2, Scale } from "lucide-react";
// import Form from "next/form";
// import { useActionState, useEffect, useState } from "react";
// import { toast } from "sonner";
// import { reconcileAccount } from "../actions";
// type ReconcileAccountDialogProps = {
//   account: Tables<"accounts">;
// };

// export default function ReconcileAccountDialog({ account }: ReconcileAccountDialogProps) {
//   const [open, setOpen] = useState(false);
//   const [selectedDate, setSelectedDate] = useState<Date>(new UTCDate());
//   const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
//   const [state, formAction, isPending] = useActionState(reconcileAccount, { success: false, message: "" });

//   useEffect(() => {
//     if (state.success) {
//       toast.success(state.message);
//       setOpen(false);
//     }
//   }, [state]);

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button size="sm" variant="secondary">
//           <Scale className="h-4 w-4" />
//           Reconciliar
//         </Button>
//       </DialogTrigger>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Nova Reconciliação</DialogTitle>
//           <DialogDescription>Registre um saldo de reconciliação para a conta {account.name}.</DialogDescription>
//         </DialogHeader>
//         <Form action={formAction} id="add-reconciliation-form">
//           <input type="hidden" name="account_id" value={account.id} />
//           <div className="space-y-6">
//             {state.errors && (
//               <Alert variant="destructive">
//                 <AlertCircle className="h-4 w-4" />
//                 <AlertTitle>Erro</AlertTitle>
//                 <AlertDescription>
//                   {state.errors.server?.[0] || "Verifique os dados e tente novamente"}
//                 </AlertDescription>
//               </Alert>
//             )}

//             <div className="flex flex-col gap-1.5">
//               <Label htmlFor="balance">Saldo Reconciliado</Label>
//               <Input id="balance" name="balance" type="number" placeholder="0,00" required disabled={isPending} />
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
//           <Button type="submit" variant="secondary" form="add-reconciliation-form" disabled={isPending}>
//             {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }
