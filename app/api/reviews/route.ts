import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { product_id, author_name, rating, title, content } = body

    // Validação básica
    if (!product_id || !author_name || !rating) {
      return NextResponse.json(
        { message: 'Campos obrigatórios: product_id, author_name, rating' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: 'A nota deve ser entre 1 e 5' },
        { status: 400 }
      )
    }

    if (author_name.trim().length < 2) {
      return NextResponse.json(
        { message: 'O nome deve ter pelo menos 2 caracteres' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verificar se o produto existe
    const { data: product } = await supabase
      .from('products')
      .select('id')
      .eq('id', product_id)
      .eq('is_active', true)
      .single()

    if (!product) {
      return NextResponse.json(
        { message: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    // Buscar usuário logado (opcional)
    const { data: { user } } = await supabase.auth.getUser()

    // Criar a review (sempre começa como não aprovada)
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        product_id,
        user_id: user?.id || null,
        author_name: author_name.trim(),
        rating,
        title: title?.trim() || null,
        content: content?.trim() || null,
        is_approved: false, // Precisa de aprovação manual
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating review:', error)
      return NextResponse.json(
        { message: 'Erro ao criar avaliação' },
        { status: 500 }
      )
    }

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error('Error in reviews API:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
