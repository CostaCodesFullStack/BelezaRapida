// Tipos TypeScript baseados no schema do Supabase

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type CouponType = "PERCENTAGE" | "FIXED";

export type ProductCategory =
  | "SKINCARE"
  | "HAIRCARE"
  | "MAKEUP"
  | "SUPPLEMENTS"
  | "BODY"
  | "FRAGRANCE";

export type UserRole = "CUSTOMER" | "ADMIN";

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  cpf: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  cep: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  category: ProductCategory;
  images: string[];
  stock: number;
  is_featured: boolean;
  is_buy_one_get_two: boolean;
  is_active: boolean;
  weight?: number | null;
  width?: number | null;
  height?: number | null;
  depth?: number | null;
  sku?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  min_order_value: number | null;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  coupon_id: string | null;

  // Dados do cliente (snapshot)
  customer_name: string;
  customer_email: string;
  customer_cpf: string;
  customer_phone: string;

  // Endereço de entrega (snapshot)
  shipping_cep: string;
  shipping_street: string;
  shipping_number: string;
  shipping_complement: string | null;
  shipping_neighborhood: string;
  shipping_city: string;
  shipping_state: string;

  // Dados de frete
  shipping_method: string | null;
  shipping_carrier: string | null;
  shipping_deadline: number | null;
  tracking_code: string | null;

  // Dados Yampi
  yampi_order_id: string | null;
  yampi_checkout_url: string | null;

  created_at: string;
  updated_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  is_buy_one_get_two: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  productId: string;
  profileId: string | null;
  rating: number;
  title: string | null;
  content: string | null;
  images: string[];
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para o carrinho (client-side)
export interface CartItem {
  product: Product;
  quantity: number;
}

/**
 * Versão flat de CartItem para uso em formulários e checkout
 * (campos individuais conforme contrato de API)
 */
export interface CartItemFlat {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  delivery_time: number;
  company: {
    name: string;
    picture: string;
  };
}

/**
 * Versão simplificada de ShippingOption para exibição na UI
 */
export interface ShippingOptionSimple {
  id: string;
  name: string;
  price: number;
  /** Prazo em dias úteis */
  days: number;
  company: string;
}

// Tipos para respostas de API
export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

// Categorias com labels em português
export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  SKINCARE: "Cuidados com a Pele",
  HAIRCARE: "Cuidados com o Cabelo",
  MAKEUP: "Maquiagem",
  SUPPLEMENTS: "Suplementos",
  BODY: "Corpo",
  FRAGRANCE: "Fragrâncias",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Aguardando Pagamento",
  PAID: "Pago",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};
