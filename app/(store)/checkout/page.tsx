import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/prisma/client'
import { CheckoutForm } from '@/components/checkout/checkout-form'

export const metadata = {
  title: 'Checkout | Finalizar Compra',
}

export default async function CheckoutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/checkout')
  }

  const profile = await prisma.profile.findUnique({
    where: { supabaseId: user.id },
    select: { id: true }
  })

  if (!profile) {
    redirect('/auth/login')
  }

  const addresses = await prisma.address.findMany({
    where: { profileId: profile.id },
    orderBy: [
      { isDefault: 'desc' },
      { createdAt: 'desc' }
    ]
  })

  return (
    <main className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Finalizar Compra</h1>
        <CheckoutForm initialAddresses={addresses} />
      </div>
    </main>
  )
}
