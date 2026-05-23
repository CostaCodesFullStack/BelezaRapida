import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

    const response = await resend.emails.send({
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

export async function sendWelcomeEmail(data: WelcomeEmailData) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Bem-vindo!</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
            <h1 style="color: #333; margin: 0;">Bem-vindo à Beleza Rápida!</h1>
          </div>
          
          <div style="padding: 30px; background-color: #fff;">
            <p>Olá ${data.customerName},</p>
            <p>Ficamos felizes em ter você conosco! Explore nossa coleção de produtos de beleza e saúde.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://example.com"}/produtos" 
                 style="display: inline-block; background-color: #1976d2; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;">
                Explorar Produtos
              </a>
            </div>
            
            <p style="color: #666; margin-top: 30px;">
              Se tiver alguma dúvida, não hesite em nos contactar.
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

    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@example.com",
      to: data.customerEmail,
      subject: "Bem-vindo à Beleza Rápida!",
      html,
    });

    return response;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw error;
  }
}
