"use client";

import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";

interface Coupon {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  usage_count: number;
  usage_limit: number | null;
  valid_until: Date | string | null;
  active: boolean;
}

interface CouponsTableProps {
  coupons: Coupon[];
}

export function CouponsTable({ coupons }: CouponsTableProps) {
  const columns = [
    {
      key: "code",
      label: "Código",
      render: (value: string) => (
        <span className="font-mono font-bold">{value}</span>
      ),
    },
    {
      key: "type",
      label: "Tipo",
      render: (value: string) =>
        value === "PERCENTAGE" ? "Porcentagem" : "Valor Fixo",
    },
    {
      key: "value",
      label: "Valor",
      render: (value: number, row: Coupon) =>
        row.type === "PERCENTAGE" ? `${value}%` : `R$ ${value.toFixed(2)}`,
    },
    {
      key: "usage_count",
      label: "Usos",
      render: (value: number, row: Coupon) =>
        `${value} / ${row.usage_limit || "∞"}`,
    },
    {
      key: "valid_until",
      label: "Validade",
      render: (value: Date | string | null) =>
        value ? new Date(value).toLocaleDateString("pt-BR") : "Sem expiração",
    },
    {
      key: "active",
      label: "Status",
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
  ];

  return <DataTable columns={columns} data={coupons} loading={false} />;
}
