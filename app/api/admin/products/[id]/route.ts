import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

// GET - Buscar um produto
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Produto não encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { message: "Erro ao buscar produto" },
      { status: 500 },
    );
  }
}

// PUT - Atualizar produto
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const product = await prisma.product.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { message: "Erro ao atualizar produto" },
      { status: 500 },
    );
  }
}

// DELETE - Deletar produto
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { message: "Erro ao deletar produto" },
      { status: 500 },
    );
  }
}
