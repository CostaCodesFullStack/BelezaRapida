import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
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

const statusVariants: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
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
        <p className="text-muted-foreground">
          Gerenciar pedidos dos clientes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              {
                key: "id",
                label: "ID Pedido",
                render: (value: string) => value.slice(-8).toUpperCase(),
              },
              {
                key: "customerName",
                label: "Cliente",
              },
              {
                key: "createdAt",
                label: "Data",
                render: (value: Date) =>
                  new Date(value).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
              },
              {
                key: "total",
                label: "Total",
                render: (value: number) => `R$ ${value.toFixed(2)}`,
              },
              {
                key: "status",
                label: "Status",
                render: (value: OrderStatus) => (
                  <Badge variant={statusVariants[value] || "default"}>
                    {statusLabels[value] || value}
                  </Badge>
                ),
              },
              {
                key: "actions",
                label: "Ações",
                render: (_, row) => (
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/pedidos/${row.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                ),
              },
            ]}
            data={orders}
            loading={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
