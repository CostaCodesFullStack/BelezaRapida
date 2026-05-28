import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OrdersTable } from "@/components/admin/orders-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/prisma/client";
import { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const statusLabels: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Pendente",
  PAID: "Pago",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

const statusVariants: Record<
  OrderStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING_PAYMENT: "secondary",
  PAID: "default",
  SHIPPED: "default",
  DELIVERED: "default",
  CANCELLED: "destructive",
  REFUNDED: "destructive",
};

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pedidos</h1>
        <p className="text-muted-foreground">Gerenciar pedidos dos clientes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <OrdersTable
            orders={orders}
            statusLabels={statusLabels}
            statusVariants={statusVariants}
          />
        </CardContent>
      </Card>
    </div>
  );
}
