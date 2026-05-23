import { Suspense } from "react";
import { Metadata } from "next";
import { StatsCard } from "@/components/admin/stats-card";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCharts } from "@/components/admin/dashboard-charts";
import { DollarSign, ShoppingCart, Package, TrendingUp } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/prisma/client";

export const metadata: Metadata = {
  title: "Dashboard | Admin",
  description: "Painel de controle do administrador",
};

export default async function AdminDashboard() {
  const [
    totalOrders,
    pendingOrders,
    totalProducts,
    totalCustomers,
    paidOrdersResult,
    recentOrders
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING_PAYMENT" } }),
    prisma.product.count(),
    prisma.profile.count({ where: { role: "CUSTOMER" } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: "PAID" },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const stats = {
    totalOrders,
    totalRevenue: paidOrdersResult._sum.total || 0,
    totalProducts,
    pendingOrders,
    totalCustomers,
  };

  const salesData: any[] = []; // Placeholder

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Bem-vindo ao painel de administração
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Receita Total"
          value={`R$ ${(stats.totalRevenue || 0).toFixed(2)}`}
          description="Total de vendas"
          icon={DollarSign}
          trend={{
            value: 12,
            label: "vs mês anterior",
            positive: true,
          }}
        />
        <StatsCard
          title="Pedidos"
          value={stats.totalOrders || 0}
          description="Total de pedidos"
          icon={ShoppingCart}
        />
        <StatsCard
          title="Pedidos Pendentes"
          value={stats.pendingOrders || 0}
          description="Aguardando processamento"
          icon={TrendingUp}
        />
        <StatsCard
          title="Produtos"
          value={stats.totalProducts || 0}
          description="Catálogo ativo"
          icon={Package}
        />
      </div>

      {/* Charts */}
      <DashboardCharts
        salesData={salesData}
        ordersData={[
          { status: "Pagos", count: stats.totalOrders || 0 },
          { status: "Pendentes", count: stats.pendingOrders || 0 },
          { status: "Enviados", count: 0 },
          { status: "Entregues", count: 0 },
        ]}
      />

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pedidos Recentes</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/pedidos">Ver todos</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              {
                key: "id",
                label: "ID Pedido",
                render: (value) => value?.slice(0, 8) || "-",
              },
              {
                key: "customerName",
                label: "Cliente",
              },
              {
                key: "total",
                label: "Total",
                render: (value) => `R$ ${value?.toFixed(2) || "0.00"}`,
              },
              {
                key: "status",
                label: "Status",
                render: (value) => (
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
                render: (value) =>
                  new Date(value).toLocaleDateString("pt-BR", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }),
              },
            ]}
            data={recentOrders.slice(0, 5)}
          />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Button asChild className="h-auto flex-col gap-2 py-4">
          <Link href="/admin/produtos/novo">
            <Package className="h-5 w-5" />
            Novo Produto
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-auto flex-col gap-2 py-4"
        >
          <Link href="/admin/cupons">
            <TrendingUp className="h-5 w-5" />
            Gerenciar Cupons
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-auto flex-col gap-2 py-4"
        >
          <Link href="/admin/pedidos">
            <ShoppingCart className="h-5 w-5" />
            Ver Pedidos
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-auto flex-col gap-2 py-4"
        >
          <Link href="/admin/avaliacoes">Moderar Avaliações</Link>
        </Button>
      </div>
    </div>
  );
}
