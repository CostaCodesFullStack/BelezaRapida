const MELHOR_ENVIO_API_BASE_URL = "https://api.melhorenvio.com.br";

interface CalculateShippingParams {
  zipCode: string; // CEP destino, apenas números
  items: Array<{
    product: {
      id: string;
      weight?: number | null;
      width?: number | null;
      height?: number | null;
      depth?: number | null;
    };
    quantity: number;
  }>;
}

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  deadline: number;
}

/**
 * Cliente da API Melhor Envio
 * Documentação: https://www.melhorenvio.com.br/
 */
export class MelhorEnvioClient {
  private token: string;
  private userAgent = "ecommerce-api/1.0";

  constructor(token: string) {
    this.token = token;
  }

  /**
   * Calcula opções de frete para os itens do carrinho
   */
  async calculateShipping(
    params: CalculateShippingParams,
  ): Promise<ShippingOption[]> {
    try {
      // Validar CEP
      if (!params.zipCode || params.zipCode.length !== 8) {
        throw new Error("CEP inválido. Use formato 00000000");
      }

      if (!params.items || params.items.length === 0) {
        throw new Error("Nenhum item para calcular frete");
      }

      // Calcular dimensões e peso totais (simplificado para MVP)
      // Em produção, você implementaria lógica mais robusta
      let totalWeight = 0;
      let totalWidth = 0;
      let totalHeight = 0;
      let totalDepth = 0;

      params.items.forEach((item) => {
        totalWeight += (item.product.weight || 300) * item.quantity; // 300g default
        totalWidth = Math.max(totalWidth, item.product.width || 15);
        totalHeight +=
          (item.product.height || 10) * Math.ceil(item.quantity / 5);
        totalDepth = Math.max(totalDepth, item.product.depth || 5);
      });

      // Garantir dimensões mínimas (15cm x 10cm x 2cm)
      totalWidth = Math.max(totalWidth, 15);
      totalHeight = Math.max(totalHeight, 10);
      totalDepth = Math.max(totalDepth, 2);
      totalWeight = Math.max(totalWeight, 300); // 300g mínimo

      // Body para Melhor Envio API v2
      const body = {
        from: {
          postal_code: "01310100", // CEP da origem (seu depósito) - placeholder
        },
        to: {
          postal_code: params.zipCode,
        },
        products: [
          {
            id: "cart",
            width: totalWidth,
            height: totalHeight,
            length: totalDepth,
            weight: totalWeight,
            quantity: 1,
            insurance_value: 0,
          },
        ],
      };

      const response = await fetch(
        `${MELHOR_ENVIO_API_BASE_URL}/v2/me/shipment/calculate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
            "User-Agent": this.userAgent,
          },
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        console.error("Melhor Envio API Error:", error);
        throw new Error(error.message || "Erro ao calcular frete");
      }

      const data = await response.json();

      // Mapear resposta da Melhor Envio para nosso formato
      const shippingOptions: ShippingOption[] = data.map((option: any) => ({
        id: option.id || option.name.toLowerCase().replace(/\s/g, "-"),
        name: option.name,
        price: option.price,
        deadline: option.delivery_time || 7,
      }));

      return shippingOptions;
    } catch (error) {
      console.error("MelhorEnvio calculateShipping error:", error);
      throw error;
    }
  }
}

export default MelhorEnvioClient;
