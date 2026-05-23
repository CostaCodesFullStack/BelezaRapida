import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";
import YampiApiClient from "@/lib/yampi";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    // Validar signature do webhook
    if (!process.env.YAMPI_SECRET_KEY) {
      console.error("YAMPI_SECRET_KEY not configured");
      return NextResponse.json(
        { message: "Webhook not configured" },
        { status: 500 },
      );
    }

    const signature = request.headers.get("x-signature");
    const payload = await request.text();

    // Validar assinatura
    const yampiClient = new YampiApiClient(
      process.env.YAMPI_API_KEY || "",
      process.env.YAMPI_SECRET_KEY,
    );

    const isValid = yampiClient.validateWebhookSignature(
      payload,
      signature || "",
    );

    if (!isValid) {
      console.warn("Invalid webhook signature");
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 401 },
      );
    }

    const body = JSON.parse(payload);

    // Eventos de webhook da Yampi
    if (body.event === "order.paid" || body.event === "payment.confirmed") {
      const yamipiOrderId = body.data?.order_id || body.data?.id;

      if (!yamipiOrderId) {
        return NextResponse.json(
          { message: "Missing order ID" },
          { status: 400 },
        );
      }

      // Buscar pedido no banco de dados
      const order = await prisma.order.findUnique({
        where: { yamipiOrderId },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      if (!order) {
        console.warn(`Order not found for Yampi ID: ${yamipiOrderId}`);
        return NextResponse.json(
          { message: "Order not found" },
          { status: 404 },
        );
      }

      // Atualizar status do pedido para PAID
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      // Enviar email de confirmação
      try {
        await sendOrderConfirmationEmail({
          customerName: updatedOrder.customerName,
          customerEmail: updatedOrder.customerEmail,
          orderId: updatedOrder.id,
          items: updatedOrder.items.map((item: any) => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.price,
          })),
          total: updatedOrder.total,
        });
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
        // Não interromper o webhook se email falhar
      }

      // Log do evento
      console.log(`Order ${order.id} marked as PAID`);

      return NextResponse.json({ success: true });
    }

    // Evento de cancelamento
    if (body.event === "order.cancelled" || body.event === "payment.failed") {
      const yamipiOrderId = body.data?.order_id || body.data?.id;

      if (!yamipiOrderId) {
        return NextResponse.json(
          { message: "Missing order ID" },
          { status: 400 },
        );
      }

      const order = await prisma.order.findUnique({
        where: { yamipiOrderId },
      });

      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "CANCELLED" },
        });

        console.log(`Order ${order.id} marked as CANCELLED`);
      }

      return NextResponse.json({ success: true });
    }

    // Evento desconhecido - apenas confirmar recebimento
    console.log(`Received webhook event: ${body.event}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      {
        message: "Webhook processing error",
      },
      { status: 500 },
    );
  }
}
