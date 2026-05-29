import { Resend } from "resend";

function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  trackingUrl?: string;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  try {
    const itemsHtml = data.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            ${item.name} x${item.quantity}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
            R$ ${(item.price * item.quantity).toFixed(2)}
          </td>
        </tr>
      `,
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Confirmação de Pedido</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
            <h1 style="color: #333; margin: 0;">Pedido Confirmado!</h1>
          </div>
          
          <div style="padding: 30px; background-color: #fff;">
            <p>Olá ${data.customerName},</p>
            <p>Agradecemos sua compra! Seu pedido foi confirmado e será processado em breve.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold;">Número do Pedido:</p>
              <p style="margin: 5px 0; color: #666;">${data.orderId}</p>
            </div>
            
            <h3 style="color: #333; margin-top: 30px;">Itens do Pedido:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${itemsHtml}
              <tr style="background-color: #f9f9f9; font-weight: bold;">
                <td style="padding: 10px;">Total</td>
                <td style="padding: 10px; text-align: right;">R$ ${data.total.toFixed(2)}</td>
              </tr>
            </table>
            
            ${
              data.trackingUrl
                ? `
              <div style="margin-top: 30px; padding: 15px; background-color: #e8f5e9; border-radius: 5px;">
                <p style="margin: 0; font-weight: bold; color: #2e7d32;">
                  Seu pedido foi enviado!
                </p>
                <p style="margin: 10px 0; color: #666;">
                  <a href="${data.trackingUrl}" style="color: #1976d2; text-decoration: none;">
                    Acompanhe seu pedido aqui
                  </a>
                </p>
              </div>
            `
                : ""
            }
            
            <p style="margin-top: 30px; color: #666;">
              Se tiver dúvidas, entre em contato conosco pelo WhatsApp.
            </p>
          </div>
          
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; color: #999; font-size: 12px;">
            <p style="margin: 0;">
              &copy; 2026 Beleza Rápida. Todos os direitos reservados.
            </p>
          </div>
        </body>
      </html>
    `;

    const response = await getResendClient().emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@example.com",
      to: data.customerEmail,
      subject: `Pedido Confirmado - ${data.orderId}`,
      html,
    });

    return response;
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    throw error;
  }
}

interface WelcomeEmailData {
  customerName: string;
  customerEmail: string;
}

export async function sendWelcomeEmail(
  emailOrData: string | WelcomeEmailData,
  name?: string,
) {
  const customerEmail =
    typeof emailOrData === "string" ? emailOrData : emailOrData.customerEmail;
  const customerName =
    typeof emailOrData === "string" ? (name ?? "") : emailOrData.customerName;

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Bem-vindo!</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8e8ec; padding: 20px; text-align: center;">
            <h1 style="color: #c2185b; margin: 0;">Bem-vindo(a) à Beleza Rápida!</h1>
          </div>
          
          <div style="padding: 30px; background-color: #fff;">
            <p>Olá ${customerName},</p>
            <p>Ficamos muito felizes em ter você conosco! Explore nossa coleção exclusiva de produtos de beleza e saúde.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${appUrl}/produtos" 
                 style="display: inline-block; background-color: #c2185b; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;">
                Explorar Produtos
              </a>
            </div>
            
            <p style="color: #666; margin-top: 30px;">
              Se tiver alguma dúvida, não hesite em nos contatar pelo WhatsApp ou pelo e-mail de suporte.
            </p>
          </div>
          
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; color: #999; font-size: 12px;">
            <p style="margin: 0;">
              &copy; 2026 Beleza Rápida. Todos os direitos reservados.
            </p>
          </div>
        </body>
      </html>
    `;

    const response = await getResendClient().emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@example.com",
      to: customerEmail,
      subject: "Bem-vindo(a) à Beleza Rápida!",
      html,
    });

    return response;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw error;
  }
}

const ORDER_STATUS_PT: Record<string, string> = {
  PENDING_PAYMENT: "Aguardando Pagamento",
  PAID: "Pago",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

export async function sendOrderStatusUpdateEmail(
  email: string,
  orderId: string,
  newStatus: string,
) {
  try {
    const statusLabel = ORDER_STATUS_PT[newStatus] ?? newStatus;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Atualização do Pedido</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8e8ec; padding: 20px; text-align: center;">
            <h1 style="color: #c2185b; margin: 0;">Atualização do seu Pedido</h1>
          </div>

          <div style="padding: 30px; background-color: #fff;">
            <p>O status do seu pedido foi atualizado.</p>

            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #c2185b;">
              <p style="margin: 0; font-weight: bold; color: #333;">Número do Pedido:</p>
              <p style="margin: 4px 0 12px; color: #666;">${orderId}</p>
              <p style="margin: 0; font-weight: bold; color: #333;">Novo Status:</p>
              <p style="margin: 4px 0 0; color: #c2185b; font-size: 18px; font-weight: bold;">${statusLabel}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${appUrl}/minha-conta/pedidos/${orderId}"
                 style="display: inline-block; background-color: #c2185b; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;">
                Ver Detalhes do Pedido
              </a>
            </div>

            <p style="color: #666;">
              Se você não reconhece este pedido ou tem alguma dúvida, entre em contato com o nosso suporte.
            </p>
          </div>

          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; color: #999; font-size: 12px;">
            <p style="margin: 0;">
              &copy; 2026 Beleza Rápida. Todos os direitos reservados.
            </p>
          </div>
        </body>
      </html>
    `;

    const response = await getResendClient().emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@example.com",
      to: email,
      subject: `Pedido ${orderId} — Status atualizado: ${statusLabel}`,
      html,
    });

    return response;
  } catch (error) {
    console.error("Error sending order status update email:", error);
    throw error;
  }
}
