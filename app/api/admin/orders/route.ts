import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 20;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      select: {
        id: true,
        customerName: true,
        customerEmail: true,
        total: true,
        status: true,
        createdAt: true,
        paidAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { message: "Erro ao buscar pedidos" },
      { status: 500 },
    );
  }
}
