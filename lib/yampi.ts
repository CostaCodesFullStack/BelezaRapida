/**
 * Cliente da API Yampi
 * Documentação: https://docs.yampi.com.br/api/
 */

interface YampiClient {
  email: string;
  name: string;
  phone?: string;
  document?: string; // CPF
}

interface YampiProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface YampiCreateOrderParams {
  client: YampiClient;
  products: YampiProduct[];
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  couponCode?: string;
  shipping?: {
    method: string;
    value: number;
    deadline: number;
  };
}

interface YampiOrderResponse {
  id: string;
  checkoutUrl: string;
  status: string;
}

const YAMPI_API_BASE_URL = "https://api.yampi.com.br/v1";

export class YampiApiClient {
  private apiKey: string;
  private secretKey: string;

  constructor(apiKey: string, secretKey: string) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
  }

  private getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      "X-API-Secret": this.secretKey,
    };
  }

  /**
   * Criar ou buscar cliente na Yampi
   */
  async createOrGetCustomer(client: YampiClient) {
    try {
      const response = await fetch(`${YAMPI_API_BASE_URL}/customers`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          email: client.email,
          name: client.name,
          phone: client.phone,
          document: client.document,
        }),
      });

      if (!response.ok && response.status !== 409) {
        throw new Error(`Erro ao criar cliente: ${response.statusText}`);
      }

      const data = await response.json();
      return data.id || data.customer?.id;
    } catch (error) {
      console.error("Error creating customer in Yampi:", error);
      throw error;
    }
  }

  /**
   * Criar pedido na Yampi (retorna checkout URL)
   */
  async createOrder(
    params: YampiCreateOrderParams,
  ): Promise<YampiOrderResponse> {
    try {
      const customerId = await this.createOrGetCustomer(params.client);

      const orderBody = {
        customer_id: customerId,
        billing_address: {
          street: params.address.street,
          number: params.address.number,
          complement: params.address.complement,
          neighborhood: params.address.neighborhood,
          city: params.address.city,
          state: params.address.state,
          zipcode: params.address.zipCode,
        },
        shipping_address: {
          street: params.address.street,
          number: params.address.number,
          complement: params.address.complement,
          neighborhood: params.address.neighborhood,
          city: params.address.city,
          state: params.address.state,
          zipcode: params.address.zipCode,
        },
        items: params.products.map((product) => ({
          product_id: product.id,
          quantity: product.quantity,
          price: product.price,
        })),
        ...(params.couponCode && { coupon_code: params.couponCode }),
        ...(params.shipping && {
          shipping_method: params.shipping.method,
          shipping_value: params.shipping.value,
          shipping_deadline: params.shipping.deadline,
        }),
      };

      const response = await fetch(`${YAMPI_API_BASE_URL}/orders`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(orderBody),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao criar pedido na Yampi");
      }

      const data = await response.json();

      return {
        id: data.id,
        checkoutUrl: data.checkout_url,
        status: data.status,
      };
    } catch (error) {
      console.error("Error creating order in Yampi:", error);
      throw error;
    }
  }

  /**
   * Buscar status do pedido na Yampi
   */
  async getOrderStatus(orderId: string) {
    try {
      const response = await fetch(`${YAMPI_API_BASE_URL}/orders/${orderId}`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar pedido: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        status: data.status,
        paymentStatus: data.payment_status,
      };
    } catch (error) {
      console.error("Error getting order status from Yampi:", error);
      throw error;
    }
  }

  /**
   * Validar webhook signature (HMAC SHA256)
   */
  validateWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require("crypto");

    const hash = crypto
      .createHmac("sha256", this.secretKey)
      .update(payload)
      .digest("hex");

    return hash === signature;
  }
}

export default YampiApiClient;
