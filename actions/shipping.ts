'use server'

import { prisma } from '@/prisma/client'

export interface CalculateShippingRequest {
  destinationCep: string
  cartItems: { productId: string; quantity: number }[]
}

export async function calculateShippingAction({ destinationCep, cartItems }: CalculateShippingRequest) {
  try {
    // 1. Validação básica do CEP
    const cleanCep = destinationCep.replace(/\D/g, '')
    if (cleanCep.length !== 8) {
      return { success: false, error: 'CEP inválido.' }
    }

    if (!cartItems.length) {
      return { success: false, error: 'O carrinho está vazio.' }
    }

    // 2. Variáveis de ambiente (Mocked - TODO: Reverter para API real do Melhor Envio)
    // const originCep = process.env.STORE_ORIGIN_CEP
    // const token = process.env.MELHOR_ENVIO_TOKEN

    // if (!originCep || !token) { ... }

    // TODO: Descomentar o código real de fetch do banco e Melhor Envio quando .env for configurado.
    
    // MOCK DATA: Simulando a resposta para não travar os testes de checkout
    const validOptions = [
      { 
        id: "mock-pac", 
        name: "PAC (Simulado)", 
        price: 15.90, 
        delivery_time: 7,
        company: { name: 'Correios', picture: '' }
      },
      { 
        id: "mock-sedex", 
        name: "SEDEX (Simulado)", 
        price: 29.90, 
        delivery_time: 2,
        company: { name: 'Correios', picture: '' }
      }
    ]

    return { success: true, options: validOptions }

  } catch (error) {
    console.error('Falha interna ao executar calculateShippingAction:', error)
    return { success: false, error: 'Ocorreu um erro interno durante a cotação.' }
  }
}
