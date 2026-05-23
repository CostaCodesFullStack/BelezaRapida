import { prisma } from "@/prisma/client";
import { DataTable } from "@/components/admin/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewCouponDialog } from "./new-coupon-dialog";

export const dynamic = "force-dynamic";

export default async function CouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cupons</h1>
          <p className="text-muted-foreground">
            Gerenciar cupons de desconto
          </p>
        </div>
        <NewCouponDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Cupons</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              {
                key: "code",
                label: "Código",
                render: (value: string) => <span className="font-mono font-bold">{value}</span>,
              },
              {
                key: "type",
                label: "Tipo",
                render: (value: string) => value === "PERCENTAGE" ? "Porcentagem" : "Valor Fixo",
              },
              {
                key: "value",
                label: "Valor",
                render: (value: number, row) => row.type === "PERCENTAGE" ? `${value}%` : `R$ ${value.toFixed(2)}`,
              },
              {
                key: "usage_count",
                label: "Usos",
                render: (value: number, row) => `${value} / ${row.usage_limit || "∞"}`,
              },
              {
                key: "valid_until",
                label: "Validade",
                render: (value: Date | null) => value ? new Date(value).toLocaleDateString("pt-BR") : "Sem expiração",
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
            ]}
            data={coupons}
            loading={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
