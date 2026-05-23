"use server";

import { prisma } from "@/prisma/client";
import { revalidatePath } from "next/cache";
import { OrderStatus, CouponType } from "@prisma/client";

export async function createProductAction(data: any) {
  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: parseFloat(data.price),
        compare_at_price: data.compare_at_price ? parseFloat(data.compare_at_price) : null,
        category: data.category,
        stock: parseInt(data.stock, 10),
        is_featured: data.is_featured || false,
        is_buy_one_get_two: data.is_buy_one_get_two || false,
        images: data.images || [],
        is_active: true,
      },
    });
    revalidatePath("/admin/produtos");
    return { success: true, product };
  } catch (error) {
    console.error("Error creating product:", error);
    return { success: false, error: "Falha ao criar o produto." };
  }
}

export async function updateOrderStatusAction(orderId: string, status: OrderStatus, trackingCode?: string) {
  try {
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status,
        ...(trackingCode !== undefined && { trackingCode })
      },
    });
    revalidatePath("/admin/pedidos");
    revalidatePath(`/admin/pedidos/${orderId}`);
    return { success: true, order: updated };
  } catch (error) {
    console.error("Error updating order:", error);
    return { success: false, error: "Falha ao atualizar o pedido." };
  }
}

export async function createCouponAction(data: any) {
  try {
    const coupon = await prisma.coupon.create({
      data: {
        code: data.code,
        type: data.type as CouponType,
        value: parseFloat(data.value),
        usage_limit: data.usage_limit ? parseInt(data.usage_limit, 10) : null,
        valid_until: data.valid_until ? new Date(data.valid_until) : null,
        active: true,
      },
    });
    revalidatePath("/admin/cupons");
    return { success: true, coupon };
  } catch (error) {
    console.error("Error creating coupon:", error);
    return { success: false, error: "Falha ao criar o cupom." };
  }
}

export async function toggleReviewStatusAction(reviewId: string, approved: boolean) {
  try {
    await prisma.review.update({
      where: { id: reviewId },
      data: { approved },
    });
    revalidatePath("/admin/avaliacoes");
    return { success: true };
  } catch (error) {
    console.error("Error updating review:", error);
    return { success: false, error: "Falha ao atualizar avaliação." };
  }
}
