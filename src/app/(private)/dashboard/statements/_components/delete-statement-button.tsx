"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteStatementAction } from "@/server/actions/statements-actions";

import { Button } from "@/components/ui/button";
import { Loader2Icon, Trash2Icon } from "lucide-react";

export default function DeleteStatementButton({ statementId }: { statementId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm("Tem certeza que deseja excluir este extrato?")) {
      setIsDeleting(true);
      try {
        const result = await deleteStatementAction({ id: statementId });
        if (result.success) {
          toast.success(result.message);
          router.refresh();
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.error("Error deleting statement:", error);
        toast.error("Erro ao excluir extrato");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Button variant="destructive" size="icon" disabled={isDeleting} onClick={handleDelete}>
      {isDeleting ? <Loader2Icon size={16} className=" animate-spin" /> : <Trash2Icon size={16} className="" />}
    </Button>
  );
}
