import Link from 'next/link'
import { CheckCircle2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'

export const metadata = {
  title: 'Pedido Confirmado',
}

interface SuccessPageProps {
  searchParams: Promise<{
    orderId?: string
  }>
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams
  const orderId = params.orderId
  const displayId = orderId ? `BR${orderId.slice(-6).toUpperCase()}` : ''

  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-muted/30 p-4">
      <Card className="max-w-md w-full text-center border-emerald-100 shadow-lg">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <CardTitle className="text-3xl text-emerald-700">Pedido Confirmado!</CardTitle>
          <CardDescription className="text-base">
            Sua compra foi realizada com sucesso e já estamos separando o seu pedido.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {orderId && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Número do Pedido</p>
              <p className="text-xl font-bold tracking-wider">#{displayId}</p>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Você receberá um e-mail com os detalhes da compra e o link para acompanhamento da entrega.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-6">
          <Button asChild className="w-full" size="lg">
            <Link href="/minha-conta?tab=pedidos">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Acompanhar Pedido
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/produtos">
              Continuar Comprando
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}
