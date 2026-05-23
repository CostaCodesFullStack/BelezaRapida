"use client";

import { useTransition } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { toggleReviewStatusAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";

export function ReviewActionButtons({ reviewId, currentStatus }: { reviewId: string; currentStatus: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (approved: boolean) => {
    startTransition(async () => {
      const result = await toggleReviewStatusAction(reviewId, approved);
      if (result.success) {
        toast.success(approved ? "Avaliação aprovada" : "Avaliação rejeitada");
      } else {
        toast.error(result.error || "Erro ao atualizar");
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button 
        size="sm" 
        variant={currentStatus ? "default" : "outline"} 
        className="gap-1"
        onClick={() => handleToggle(true)}
        disabled={isPending || currentStatus === true}
      >
        <Check className="h-4 w-4" /> Aprovar
      </Button>
      <Button 
        size="sm" 
        variant={currentStatus === false ? "destructive" : "outline"} 
        className="gap-1"
        onClick={() => handleToggle(false)}
        disabled={isPending || currentStatus === false}
      >
        <X className="h-4 w-4" /> Rejeitar
      </Button>
    </div>
  );
}
