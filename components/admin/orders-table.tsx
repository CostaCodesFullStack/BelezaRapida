"use client";

import Link from "next/link";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { OrderStatus } from "@prisma/client";

interface Order {
  id: string;
  customerName: string;
  createdAt: Date | string;
  total: number;
  status: OrderStatus;
  items: any[];
}

interface OrdersTableProps {
  orders: Order[];
  statusLabels: Record<OrderStatus, string>;
  statusVariants: Record<
    OrderStatus,
    "default" | "secondary" | "destructive" | "outline"
  >;
}

export function OrdersTable({
  orders,
  statusLabels,
  statusVariants,
}: OrdersTableProps) {
  const columns = [
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
      render: (value: Date | string) =>
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
      render: (_: any, row: Order) => (
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/pedidos/${row.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      ),
    },
  ];

  return <DataTable columns={columns} data={orders} loading={false} />;
}
