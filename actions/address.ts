'use server'

import { prisma } from '@/prisma/client'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CreateAddressInput {
  zipCode: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  isDefault: boolean
}

export async function createAddressAction(data: CreateAddressInput) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Usuário não autenticado.' }
    }

    const profile = await prisma.profile.findUnique({
      where: { supabaseId: user.id }
    })

    if (!profile) {
      return { success: false, error: 'Perfil não encontrado.' }
    }

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { profileId: profile.id },
        data: { isDefault: false }
      })
    }

    await prisma.address.create({
      data: {
        profileId: profile.id,
        zipCode: data.zipCode.replace(/\D/g, ''),
        street: data.street,
        number: data.number,
        complement: data.complement || null,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        isDefault: data.isDefault,
      }
    })

    revalidatePath('/minha-conta')
    return { success: true }
  } catch (error) {
    console.error('Erro ao criar endereço:', error)
    return { success: false, error: 'Erro interno ao salvar endereço.' }
  }
}
