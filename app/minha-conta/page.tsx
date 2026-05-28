import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/prisma/client'
import { AccountTabs } from '@/components/account-tabs'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function ContaPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/minha-conta')
  }

  // Busca perfil completo do usuário no Prisma (incluindo endereços e histórico de pedidos)
  const profile = await prisma.profile.findUnique({
    where: {
      supabaseId: user.id,
    },
    include: {
      addresses: true,
      orders: {
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  })

  // Caso o usuário esteja logado no Supabase, mas o profile ainda não exista no Prisma
  // Isso pode ocorrer dependendo de como o fluxo de registro está configurado
  if (!profile) {
    // Tratamento de fallback ou criação sob demanda do Profile:
    // (A depender da regra de negócio, poderia criar um profile vazio aqui)
    return (
      <div className="container mx-auto max-w-5xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Perfil não encontrado</h1>
        <p className="text-muted-foreground">
          Parece que seu perfil não foi completamente configurado. Entre em contato com o suporte.
        </p>
      </div>
    )
  }

  const displayName = profile.name || user.email?.split('@')[0] || 'Cliente'

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 min-h-[calc(100vh-200px)]">
      {/* Botão Voltar */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground -ml-3">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a loja
          </Link>
        </Button>
      </div>

      {/* Cabeçalho da Página */}
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground text-balance">
          Olá, {displayName}!
        </h1>
        <p className="mt-2 text-muted-foreground text-lg">
          Bem-vindo à sua área exclusiva. Gerencie seus dados e acompanhe seus pedidos.
        </p>
      </div>

      {/* Componente Client com as Abas (Dados, Endereços, Pedidos) */}
      <AccountTabs profile={profile} />
    </div>
  )
}
