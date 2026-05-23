import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkoutFormSchema } from "@/lib/validation";
import { prisma } from "@/prisma/client";
import { createClient } from "@/lib/supabase/server";
import YampiApiClient from "@/lib/yampi";

const createOrderSchema = z.object({
  customer: checkoutFormSchema,
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
    }),
  ),
  shippingOption: z.object({
    id: z.string(),
    name: z.string(),
    price: z.number().min(0),
    deadline: z.number().int().positive(),
  }),
  couponCode: z.string().optional(),
  subtotal: z.number().positive(),
  discount: z.number().min(0),
  total: z.number().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar dados
    const validatedData = createOrderSchema.parse(body);

    // Verificar variáveis de ambiente
    if (!process.env.YAMPI_API_KEY || !process.env.YAMPI_SECRET_KEY) {
      return NextResponse.json(
        { message: "Configuração de pagamento não disponível" },
        { status: 500 },
      );
    }

    // Buscar usuário autenticado (opcional para checkout guest)
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let userId: string | undefined = undefined;
    if (user) {
      const profile = await prisma.profile.findUnique({
        where: { supabaseId: user.id },
      });
      if (profile) {
        userId = profile.id;
      }
    }

    // Buscar produtos para validar estoques
    const productIds = validatedData.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // Validar estoque
    for (const item of validatedData.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return NextResponse.json(
          { message: `Produto ${item.productId} não encontrado` },
          { status: 404 },
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { message: `Estoque insuficiente para ${product.name}` },
          { status: 400 },
        );
      }
    }

    // Criar pedido no banco de dados
    const order = await prisma.order.create({
      data: {
        profile: {
          connect: { id: userId as string },
        },
        customerName: validatedData.customer.fullName,
        customerEmail: validatedData.customer.email,
        customerPhone: validatedData.customer.phone,
        customerCpf: validatedData.customer.cpf,
        shippingAddress: JSON.stringify({
          zipCode: validatedData.customer.zipCode,
          street: validatedData.customer.street,
          number: validatedData.customer.number,
          complement: validatedData.customer.complement,
          neighborhood: validatedData.customer.neighborhood,
          city: validatedData.customer.city,
          state: validatedData.customer.state,
        }),
        subtotal: validatedData.subtotal,
        discount: validatedData.discount,
        shippingCost: validatedData.shippingOption.price,
        total: validatedData.total,
        status: "PENDING_PAYMENT",
        items: {
          create: validatedData.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
        ...(validatedData.couponCode && {
          coupon: {
            connect: { code: validatedData.couponCode },
          },
        }),
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    // Criar pedido na Yampi
    const yampiClient = new YampiApiClient(
      process.env.YAMPI_API_KEY,
      process.env.YAMPI_SECRET_KEY,
    );

    const yamipiOrder = await yampiClient.createOrder({
      client: {
        email: validatedData.customer.email,
        name: validatedData.customer.fullName,
        phone: validatedData.customer.phone,
        document: validatedData.customer.cpf,
      },
      products: validatedData.items.map((item) => ({
        id: item.productId,
        name: products.find((p) => p.id === item.productId)?.name || "Produto",
        price: item.price,
        quantity: item.quantity,
      })),
      address: {
        street: validatedData.customer.street,
        number: validatedData.customer.number,
        complement: validatedData.customer.complement,
        neighborhood: validatedData.customer.neighborhood,
        city: validatedData.customer.city,
        state: validatedData.customer.state,
        zipCode: validatedData.customer.zipCode,
      },
      ...(validatedData.couponCode && {
        couponCode: validatedData.couponCode,
      }),
      shipping: {
        method: validatedData.shippingOption.name,
        value: validatedData.shippingOption.price,
        deadline: validatedData.shippingOption.deadline,
      },
    });

    // Atualizar pedido com informações da Yampi
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        yamipiOrderId: yamipiOrder.id,
        yamipiCheckoutUrl: yamipiOrder.checkoutUrl,
      },
    });

    return NextResponse.json({
      orderId: updatedOrder.id,
      yamipiOrderId: yamipiOrder.id,
      checkoutUrl: yamipiOrder.checkoutUrl,
    });
  } catch (error) {
    console.error("Create order error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Dados inválidos",
          errors: error.errors,
        },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: error.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        message: "Erro ao criar pedido",
      },
      { status: 500 },
    );
  }
}
