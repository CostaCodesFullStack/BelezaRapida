/**
 * Constantes da loja Beleza Rápida
 */

export const STORE_CONFIG = {
  name: 'Beleza Rápida',
  description: 'Sua loja de beleza e saúde com os melhores produtos e preços.',
  tagline: 'Beleza que chega rápido até você',
  email: 'contato@belezarapida.com.br',
  phone: '(11) 99999-9999',
  whatsapp: '5511999999999',
  address: {
    street: 'Rua Exemplo',
    number: '123',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    cep: '01001-000',
  },
  social: {
    instagram: 'https://instagram.com/belezarapida',
    facebook: 'https://facebook.com/belezarapida',
    tiktok: 'https://tiktok.com/@belezarapida',
  },
}

export const SEO_CONFIG = {
  title: 'Beleza Rápida | Loja de Beleza e Saúde',
  description: 'Encontre os melhores produtos de beleza, skincare, haircare, maquiagem e muito mais. Entrega rápida e frete grátis em compras acima de R$ 199.',
  keywords: ['beleza', 'skincare', 'haircare', 'maquiagem', 'cosméticos', 'cuidados pessoais', 'saúde', 'bem-estar'],
  ogImage: '/og-image.jpg',
}

export const SHIPPING_CONFIG = {
  freeShippingThreshold: 199, // Frete grátis acima de R$ 199
  defaultDeadline: 7, // Prazo padrão em dias úteis
}

export const CART_CONFIG = {
  maxQuantityPerItem: 10,
  minQuantityPerItem: 1,
}

export const PAGINATION_CONFIG = {
  productsPerPage: 12,
  reviewsPerPage: 5,
  ordersPerPage: 10,
}

// Estados brasileiros
export const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
] as const

export type BrazilianState = typeof BRAZILIAN_STATES[number]['value']
