"use client";

import { useState, useTransition } from "react";
import { OrderStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateOrderStatusAction } from "@/actions/admin";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderStatusFormProps {
  orderId: string;
  initialStatus: OrderStatus;
  initialTrackingCode?: string | null;
}

const statusLabels: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Pendente",
  PAID: "Pago",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

export function OrderStatusForm({ orderId, initialStatus, initialTrackingCode }: OrderStatusFormProps) {
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [trackingCode, setTrackingCode] = useState(initialTrackingCode || "");
  const [isPending, startTransition] = useTransition();

  const handleUpdate = () => {
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, status, trackingCode);
      if (result.success) {
        toast.success("Pedido atualizado com sucesso!");
      } else {
        toast.error(result.error || "Erro ao atualizar pedido");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Status do Pedido</Label>
        <Select value={status} onValueChange={(val) => setStatus(val as OrderStatus)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(statusLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Código de Rastreio</Label>
        <Input 
          placeholder="Ex: BR123456789" 
          value={trackingCode} 
          onChange={(e) => setTrackingCode(e.target.value)} 
        />
      </div>

      <Button onClick={handleUpdate} disabled={isPending} className="w-full">
        {isPending ? "Atualizando..." : "Atualizar Pedido"}
      </Button>
    </div>
  );
}
