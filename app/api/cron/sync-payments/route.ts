import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";
import { sendOrderStatusUpdateEmail } from "@/lib/email";

/**
 * GET /api/cron/sync-payments
 *
 * Cron job para sincronizar pagamentos pendentes com a Yampi.
 * Deve ser chamado periodicamente (ex.: a cada 15 minutos) via Vercel Cron Jobs.
 *
 * Protegido pelo header `Authorization: Bearer <CRON_SECRET>`.
 */
export async function GET(request: NextRequest) {
  // Validação de segurança — impede chamadas externas não autorizadas
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const startedAt = new Date();
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  try {
    // Busca pedidos pendentes criados há mais de 30 minutos
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: "PENDING_PAYMENT",
        createdAt: { lte: thirtyMinutesAgo },
      },
      select: {
        id: true,
        orderNumber: true,
        customerEmail: true,
        yampiOrderId: true,
        total: true,
        createdAt: true,
      },
    });

    const summary = {
      checkedAt: startedAt.toISOString(),
      totalPending: pendingOrders.length,
      markedAsPaid: 0,
      markedAsCancelled: 0,
      errors: 0,
      details: [] as Array<{
        orderId: string
        orderNumber: string
        action: "paid" | "cancelled" | "error"
        reason?: string
      }>,
    };

    for (const order of pendingOrders) {
      try {
        // Mock da consulta à API da Yampi
        // Em produção, substituir por: await yampiClient.getOrderStatus(order.yampiOrderId)
        const mockYampiStatus = simulateYampiStatus(order.yampiOrderId);

        if (mockYampiStatus === "paid") {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: "PAID",
              paidAt: new Date(),
              updatedAt: new Date(),
            },
          });

          // Notifica o cliente por email
          try {
            await sendOrderStatusUpdateEmail(
              order.customerEmail,
              order.orderNumber,
              "PAID",
            );
          } catch {
            // Falha no email não deve interromper a sincronização
          }

          summary.markedAsPaid++;
          summary.details.push({
            orderId: order.id,
            orderNumber: order.orderNumber,
            action: "paid",
          });
        } else if (mockYampiStatus === "cancelled") {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: "CANCELLED",
              updatedAt: new Date(),
            },
          });

          try {
            await sendOrderStatusUpdateEmail(
              order.customerEmail,
              order.orderNumber,
              "CANCELLED",
            );
          } catch {
            // Falha no email não deve interromper a sincronização
          }

          summary.markedAsCancelled++;
          summary.details.push({
            orderId: order.id,
            orderNumber: order.orderNumber,
            action: "cancelled",
          });
        }
        // status "pending" — sem ação, aguardar próxima execução
      } catch (orderError) {
        console.error(`[sync-payments] Erro ao processar pedido ${order.id}:`, orderError);
        summary.errors++;
        summary.details.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          action: "error",
          reason: orderError instanceof Error ? orderError.message : "Erro desconhecido",
        });
      }
    }

    return NextResponse.json(summary, { status: 200 });
  } catch (error) {
    console.error("[sync-payments] Erro crítico na sincronização:", error);
    return NextResponse.json(
      {
        message: "Erro interno na sincronização de pagamentos",
        error: error instanceof Error ? error.message : "Erro desconhecido",
        checkedAt: startedAt.toISOString(),
      },
      { status: 500 },
    );
  }
}

/**
 * Simula a resposta da API da Yampi para um pedido.
 * Em produção, substituir por uma chamada real ao endpoint da Yampi.
 *
 * Lógica mock:
 * - Se yampiOrderId for nulo → permanece pendente
 * - 70% de chance de "paid", 10% "cancelled", 20% "pending"
 */
function simulateYampiStatus(
  yampiOrderId: string | null,
): "paid" | "cancelled" | "pending" {
  if (!yampiOrderId) return "pending";

  const rand = Math.random();
  if (rand < 0.7) return "paid";
  if (rand < 0.8) return "cancelled";
  return "pending";
}
