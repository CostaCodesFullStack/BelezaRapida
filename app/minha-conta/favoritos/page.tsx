import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/prisma/client'
import { ProductCard } from '@/components/product/product-card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Heart, Search } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function FavoritosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/minha-conta/favoritos')
  }

  // Busca segura: encontra os favoritos apenas do perfil associado ao user.id atual
  const favorites = await prisma.favorite.findMany({
    where: {
      profile: {
        supabaseId: user.id
      }
    },
    include: {
      product: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 min-h-[calc(100vh-200px)]">
      {/* Botão Voltar */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground -ml-3">
          <Link href="/minha-conta">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para minha conta
          </Link>
        </Button>
      </div>

      {/* Cabeçalho */}
      <div className="mb-10 text-center sm:text-left flex items-center justify-center sm:justify-start gap-3">
        <div className="bg-primary/10 p-3 rounded-full">
          <Heart className="w-6 h-6 text-primary fill-primary/20" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Meus Favoritos
          </h1>
          <p className="mt-2 text-muted-foreground">
            Produtos que você curtiu e salvou para depois.
          </p>
        </div>
      </div>

      {/* Grid de Produtos ou Empty State */}
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-muted-foreground/20 rounded-2xl bg-muted/10">
          <div className="bg-muted p-6 rounded-full mb-6">
            <Heart className="w-12 h-12 text-muted-foreground/50" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Você ainda não tem favoritos</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            Navegue pela loja e clique no coração dos produtos que você mais gostar para salvá-los aqui.
          </p>
          <Button size="lg" className="rounded-full px-8 shadow-md hover:shadow-lg transition-all" asChild>
            <Link href="/produtos">
              <Search className="w-4 h-4 mr-2" />
              Explorar Produtos
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in-50 duration-500">
          {favorites.map((favorite) => (
            <ProductCard key={favorite.id} product={favorite.product as any} isFavorited={true} />
          ))}
        </div>
      )}
    </div>
  )
}
