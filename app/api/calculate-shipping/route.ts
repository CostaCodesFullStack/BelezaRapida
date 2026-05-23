import { NextRequest, NextResponse } from "next/server";
import MelhorEnvioClient from "@/lib/melhorenvio";
import { z } from "zod";

const calculateShippingSchema = z.object({
  zipCode: z.string().regex(/^\d{8}$/, "CEP deve ter 8 dígitos"),
  items: z.array(
    z.object({
      product: z.object({
        id: z.string(),
        weight: z.number().nullable().optional(),
        width: z.number().nullable().optional(),
        height: z.number().nullable().optional(),
        depth: z.number().nullable().optional(),
      }),
      quantity: z.number().int().positive(),
    }),
  ),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar request
    const validatedData = calculateShippingSchema.parse(body);

    if (!process.env.MELHOR_ENVIO_TOKEN) {
      return NextResponse.json(
        {
          error: "Melhor Envio token not configured",
          message: "Configuração de frete não disponível no momento",
        },
        { status: 500 },
      );
    }

    const melhorEnvio = new MelhorEnvioClient(process.env.MELHOR_ENVIO_TOKEN);

    const shippingOptions = await melhorEnvio.calculateShipping({
      zipCode: validatedData.zipCode,
      items: validatedData.items,
    });

    return NextResponse.json(shippingOptions);
  } catch (error) {
    console.error("Calculate shipping error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Shipping calculation failed",
          message: error.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Erro ao calcular frete",
      },
      { status: 500 },
    );
  }
}
