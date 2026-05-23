import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/prisma/client";

const validateCouponSchema = z.object({
  code: z.string().min(1, "Código do cupom é obrigatório").toUpperCase(),
  subtotal: z.number().min(0, "Subtotal deve ser maior que 0"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar request
    const validatedData = validateCouponSchema.parse(body);

    // Buscar cupom no banco de dados
    const coupon = await prisma.coupon.findUnique({
      where: { code: validatedData.code },
    });

    if (!coupon) {
      return NextResponse.json(
        { message: "Cupom não encontrado" },
        { status: 404 },
      );
    }

    // Verificar se cupom está ativo
    if (!coupon.active) {
      return NextResponse.json(
        { message: "Este cupom não está mais disponível" },
        { status: 400 },
      );
    }

    // Verificar validade
    const now = new Date();

    if (coupon.valid_from && coupon.valid_from > now) {
      return NextResponse.json(
        { message: "Este cupom ainda não está ativo" },
        { status: 400 },
      );
    }

    if (coupon.valid_until && coupon.valid_until < now) {
      return NextResponse.json(
        { message: "Este cupom expirou" },
        { status: 400 },
      );
    }

    // Verificar limite de uso
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return NextResponse.json(
        { message: "Este cupom atingiu o limite de usos" },
        { status: 400 },
      );
    }

    // Verificar valor mínimo do pedido
    if (
      coupon.min_order_value &&
      validatedData.subtotal < coupon.min_order_value
    ) {
      return NextResponse.json(
        {
          message: `Valor mínimo de ${new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(coupon.min_order_value)} é requerido`,
        },
        { status: 400 },
      );
    }

    // Retornar cupom válido
    return NextResponse.json({
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      min_order_value: coupon.min_order_value,
      created_at: coupon.createdAt,
    });
  } catch (error) {
    console.error("Validate coupon error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Dados inválidos",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        message: "Erro ao validar cupom",
      },
      { status: 500 },
    );
  }
}
