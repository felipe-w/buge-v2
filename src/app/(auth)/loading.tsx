import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center">
      <Loader2 size={24} className="animate-spin" />
    </div>
  );
}
