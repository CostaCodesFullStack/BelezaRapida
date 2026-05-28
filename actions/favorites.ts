'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/prisma/client'
import { revalidatePath } from 'next/cache'

export async function toggleFavoriteAction(productId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Você precisa estar logado para favoritar produtos.' }
    }

    const profile = await prisma.profile.findUnique({
      where: { supabaseId: user.id }
    })

    if (!profile) {
      return { success: false, error: 'Perfil não encontrado.' }
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        profileId_productId: {
          profileId: profile.id,
          productId: productId
        }
      }
    })

    if (existingFavorite) {
      // Remove o favorito
      await prisma.favorite.delete({
        where: { id: existingFavorite.id }
      })
      revalidatePath('/minha-conta/favoritos')
      return { success: true, isFavorited: false }
    } else {
      // Adiciona o favorito
      await prisma.favorite.create({
        data: {
          profileId: profile.id,
          productId: productId
        }
      })
      revalidatePath('/minha-conta/favoritos')
      return { success: true, isFavorited: true }
    }
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return { success: false, error: 'Ocorreu um erro ao atualizar os favoritos.' }
  }
}
