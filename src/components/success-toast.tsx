"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface SuccessToastProps {
  success: boolean;
  message?: string;
}

export default function SuccessToast({ success, message }: SuccessToastProps) {
  // Use a ref to track if the toast has been shown
  const toastShownRef = useRef(false);

  useEffect(() => {
    // Only show the toast if it hasn't been shown yet
    if (success && !toastShownRef.current) {
      toast.success(message || "Operação realizada com sucesso");
      // Mark the toast as shown
      toastShownRef.current = true;
    }
  }, [success, message]);

  return null;
}
