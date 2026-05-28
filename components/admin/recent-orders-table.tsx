"use client";

import { DataTable } from "@/components/admin/data-table";

interface Order {
  id: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: Date | string;
}

interface RecentOrdersTableProps {
  orders: Order[];
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  const columns = [
    {
      key: "id",
      label: "ID Pedido",
      render: (value: string) => value?.slice(0, 8) || "-",
    },
    {
      key: "customerName",
      label: "Cliente",
    },
    {
      key: "total",
      label: "Total",
      render: (value: number) => `R$ ${value?.toFixed(2) || "0.00"}`,
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value === "PAID" && "Pago"}
          {value === "PENDING_PAYMENT" && "Pendente"}
          {value === "SHIPPED" && "Enviado"}
          {value === "DELIVERED" && "Entregue"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Data",
      render: (value: Date | string) =>
        new Date(value).toLocaleDateString("pt-BR", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
  ];

  return <DataTable columns={columns} data={orders} />;
}
