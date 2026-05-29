"use server";

import { prisma } from "@/prisma/client";
import { createClient } from "@/lib/supabase/server";

export interface CheckoutRequest {
  addressId: string;
  shippingName: string;
  shippingPrice: number;
  items: { productId: string; quantity: number }[];
  couponId?: string;
}

export async function checkoutAction(data: CheckoutRequest) {
  try {
    // 1. Validação de Sessão
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Você precisa estar logado para finalizar a compra.",
      };
    }

    const profile = await prisma.profile.findUnique({
      where: { supabaseId: user.id },
    });

    if (!profile) {
      return { success: false, error: "Perfil não encontrado." };
    }

    if (!data.items.length) {
      return { success: false, error: "Seu carrinho está vazio." };
    }

    // 2. Busca e Validação de Endereço
    const address = await prisma.address.findUnique({
      where: { id: data.addressId },
    });

    if (!address || address.profileId !== profile.id) {
      return {
        success: false,
        error: "Endereço inválido ou não pertence ao usuário.",
      };
    }

    // 3. Busca de Produtos e Recálculo Seguro do Total
    const productIds = data.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    let subtotal = 0;

    // Verifica estoque e recalcula valores
    for (const item of data.items) {
      const dbProduct = products.find((p) => p.id === item.productId);

      if (!dbProduct) {
        return {
          success: false,
          error: `O produto com ID ${item.productId} não foi encontrado.`,
        };
      }

      if (dbProduct.stock < item.quantity) {
        return {
          success: false,
          error: `Desculpe, temos apenas ${dbProduct.stock} unidades de "${dbProduct.name}" em estoque.`,
        };
      }

      // Regra de Compre 1 Leve 2
      const paidQuantity = dbProduct.is_buy_one_get_two
        ? Math.ceil(item.quantity / 2)
        : item.quantity;

      subtotal += dbProduct.price * paidQuantity;
    }

    // Tratamento de Cupom de desconto (simplificado para o contexto do total)
    let discount = 0;
    if (data.couponId) {
      const coupon = await prisma.coupon.findUnique({
        where: { id: data.couponId },
      });
      if (
        coupon &&
        coupon.active &&
        (!coupon.min_order_value || subtotal >= coupon.min_order_value)
      ) {
        if (coupon.type === "PERCENTAGE") {
          discount = subtotal * (coupon.value / 100);
        } else {
          discount = Math.min(coupon.value, subtotal);
        }
      }
    }

    const total = subtotal - discount + data.shippingPrice;

    // 4. Execução da Transação no Banco de Dados
    const result = await prisma.$transaction(async (tx) => {
      // Passo A: Decremento de Estoque
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Formatando o endereço para o log do pedido
      const addressString = JSON.stringify({
        cep: address.zipCode,
        street: address.street,
        number: address.number,
        complement: address.complement,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
      });

      // Passos B e C: Criação do Pedido (Order) e dos Itens (OrderItems) aninhados
      const order = await tx.order.create({
        data: {
          profileId: profile.id,
          customerName: profile.name || user.email || "Cliente",
          customerEmail: user.email || "",
          customerPhone: profile.phone || "",
          customerCpf: profile.cpf || "",
          shippingAddress: addressString,

          subtotal: subtotal,
          discount: discount,
          shippingCost: data.shippingPrice,
          total: total,

          couponId: data.couponId || null,
          status: "PENDING_PAYMENT",
          notes: `Frete selecionado: ${data.shippingName}`,

          items: {
            create: data.items.map((item) => {
              const dbProduct = products.find((p) => p.id === item.productId)!;
              return {
                productId: item.productId,
                quantity: item.quantity,
                price: dbProduct.price,
              };
            }),
          },
        },
      });

      // (Opcional) Poderia atualizar a contagem de uso do cupom se existisse
      if (data.couponId) {
        await tx.coupon.update({
          where: { id: data.couponId },
          data: { usage_count: { increment: 1 } },
        });
      }

      return order;
    });

    return { success: true, orderId: result.id };
  } catch (error) {
    console.error("Falha ao processar checkout:", error);
    return {
      success: false,
      error:
        "Ocorreu um erro interno durante a finalização do seu pedido. Tente novamente.",
    };
  }
}
