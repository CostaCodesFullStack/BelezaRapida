import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const coupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      return NextResponse.json(
        { message: "Cupom não encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(coupon);
  } catch (error) {
    return NextResponse.json(
      { message: "Erro ao buscar cupom" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const coupon = await prisma.coupon.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(coupon);
  } catch (error) {
    console.error("Update coupon error:", error);
    return NextResponse.json(
      { message: "Erro ao atualizar cupom" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    await prisma.coupon.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete coupon error:", error);
    return NextResponse.json(
      { message: "Erro ao deletar cupom" },
      { status: 500 },
    );
  }
}
