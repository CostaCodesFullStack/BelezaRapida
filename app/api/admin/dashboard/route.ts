import { NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function GET() {
  try {
    // Dados de hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Total de pedidos
    const totalOrders = await prisma.order.count();

    // Total de receita
    const totalRevenueData = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        status: "PAID",
      },
    });
    const totalRevenue = totalRevenueData._sum.total || 0;

    // Pedidos pendentes
    const pendingOrders = await prisma.order.count({
      where: {
        status: "PENDING_PAYMENT",
      },
    });

    // Total de produtos
    const totalProducts = await prisma.product.count({
      where: {
        is_active: true,
      },
    });

    // Últimos 5 pedidos
    const recentOrders = await prisma.order.findMany({
      select: {
        id: true,
        customerName: true,
        total: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    // Dados de vendas (últimos 7 dias)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const salesByDate = await prisma.order.groupBy({
      by: ["createdAt"],
      _sum: {
        total: true,
      },
      _count: {
        id: true,
      },
      where: {
        createdAt: {
          gte: last7Days,
        },
        status: "PAID",
      },
    });

    // Formatar dados para gráfico
    const salesData = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);

      const dayData = salesByDate.find(
        (item) =>
          new Date(item.createdAt).toDateString() === date.toDateString(),
      );

      return {
        date: date.toLocaleDateString("pt-BR", {
          month: "short",
          day: "numeric",
        }),
        amount: dayData?._sum.total || 0,
        orders: dayData?._count.id || 0,
      };
    });

    return NextResponse.json({
      stats: {
        totalOrders,
        totalRevenue,
        pendingOrders,
        totalProducts,
      },
      recentOrders,
      salesData,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      {
        message: "Erro ao buscar dados do dashboard",
      },
      { status: 500 },
    );
  }
}
