import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/prisma/client'

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const profile = await prisma.profile.findUnique({
      where: { supabaseId: user.id },
      select: { role: true }
    })
    isAdmin = profile?.role === 'ADMIN'
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user ? { id: user.id, email: user.email!, isAdmin } : null} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
