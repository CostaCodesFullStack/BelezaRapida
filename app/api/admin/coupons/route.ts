import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";
import { z } from "zod";

const couponSchema = z.object({
  code: z.string().min(3).toUpperCase(),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().positive(),
  min_order_value: z.number().optional(),
  usage_limit: z.number().int().optional(),
  max_uses_per_user: z.number().int().optional(),
  active: z.boolean().optional(),
  valid_from: z.string().datetime().optional(),
  valid_until: z.string().datetime().optional(),
});

// GET - Listar cupons
export async function GET(request: NextRequest) {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(coupons);
  } catch (error) {
    console.error("Get coupons error:", error);
    return NextResponse.json(
      { message: "Erro ao buscar cupons" },
      { status: 500 },
    );
  }
}

// POST - Criar cupom
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = couponSchema.parse(body);

    // Verificar se código já existe
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: validatedData.code },
    });

    if (existingCoupon) {
      return NextResponse.json(
        { message: "Cupom com este código já existe" },
        { status: 400 },
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: validatedData.code,
        type: validatedData.type,
        value: validatedData.value,
        min_order_value: validatedData.min_order_value,
        usage_limit: validatedData.usage_limit,
        max_uses_per_user: validatedData.max_uses_per_user,
        active: validatedData.active !== false,
        valid_from: validatedData.valid_from
          ? new Date(validatedData.valid_from)
          : undefined,
        valid_until: validatedData.valid_until
          ? new Date(validatedData.valid_until)
          : undefined,
      },
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error("Create coupon error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Dados inválidos", errors: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Erro ao criar cupom" },
      { status: 500 },
    );
  }
}
