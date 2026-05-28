import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/prisma/client'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format'
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/types/database'
import { STORE_CONFIG } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  MapPin,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  CreditCard,
  RotateCcw,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type StatusStep = {
  key: OrderStatus
  label: string
  icon: React.ElementType
  description: string
}

const STATUS_STEPS: StatusStep[] = [
  {
    key: 'PENDING_PAYMENT',
    label: 'Aguardando Pagamento',
    icon: Clock,
    description: 'Pedido criado',
  },
  {
    key: 'PAID',
    label: 'Pagamento Confirmado',
    icon: CreditCard,
    description: 'Pagamento aprovado',
  },
  {
    key: 'SHIPPED',
    label: 'Enviado',
    icon: Truck,
    description: 'Em trânsito',
  },
  {
    key: 'DELIVERED',
    label: 'Entregue',
    icon: CheckCircle2,
    description: 'Pedido recebido',
  },
]

const STATUS_ORDER: OrderStatus[] = [
  'PENDING_PAYMENT',
  'PAID',
  'SHIPPED',
  'DELIVERED',
]

function getStepIndex(status: OrderStatus): number {
  const index = STATUS_ORDER.indexOf(status)
  return index === -1 ? 0 : index
}

function getStatusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case 'DELIVERED':
      return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80 border-transparent'
    case 'SHIPPED':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100/80 border-transparent'
    case 'PAID':
      return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100/80 border-transparent'
    case 'PENDING_PAYMENT':
      return 'bg-amber-100 text-amber-800 hover:bg-amber-100/80 border-transparent'
    case 'CANCELLED':
      return 'bg-rose-100 text-rose-800 hover:bg-rose-100/80 border-transparent'
    case 'REFUNDED':
      return 'bg-muted text-muted-foreground border-border'
    default:
      return ''
  }
}

export default async function PedidoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?next=/minha-conta/pedidos/${id}`)
  }

  // Busca segura do pedido via Prisma, garantindo que pertence ao usuário logado
  const order = await prisma.order.findFirst({
    where: {
      id: id,
      profile: {
        supabaseId: user.id
      }
    },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  })

  if (!order) {
    notFound()
  }

  const status = order.status as OrderStatus
  const currentStepIndex = getStepIndex(status)
  const isCancelledOrRefunded = status === 'CANCELLED' || status === 'REFUNDED'
  const items = order.items ?? []
  
  // Formatando o número do pedido visual (usamos yamipiOrderId ou final do CUID)
  const orderNumber = order.yamipiOrderId || `BR${order.id.slice(18).toUpperCase()}`

  const refundMailto = `mailto:${STORE_CONFIG?.email || 'suporte@loja.com'}?subject=Solicitar Reembolso - Pedido %23${orderNumber}&body=Olá, gostaria de solicitar o reembolso do pedido %23${orderNumber}.`

  let shippingAddress: any = {}
  try {
    shippingAddress = JSON.parse(order.shippingAddress)
  } catch (e) {
    // Falldown se n conseguir parsear
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      {/* Cabeçalho */}
      <div className="mb-8 flex items-start gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/minha-conta">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar para minha conta</span>
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              Pedido #{orderNumber}
            </h1>
            <Badge className={getStatusBadgeClass(status)}>
              {ORDER_STATUS_LABELS[status] || status}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Link href="/minha-conta" className="hover:text-foreground hover:underline">
              Minha Conta
            </Link>
            <span>/</span>
            <span>Detalhes do pedido</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Realizado em {formatDateTime(order.createdAt)}
          </p>
        </div>
      </div>

      {/* Linha do Tempo do Status */}
      {!isCancelledOrRefunded && (
        <Card className="mb-6 shadow-sm border-muted/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4 text-primary" />
              Acompanhamento do Pedido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative flex items-start justify-between">
              {/* Linha de conexão */}
              <div className="absolute left-0 right-0 top-5 h-0.5 bg-border" aria-hidden="true">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{
                    width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%`,
                  }}
                />
              </div>

              {STATUS_STEPS.map((step, index) => {
                const isCompleted = index <= currentStepIndex
                const isCurrent = index === currentStepIndex
                const Icon = step.icon

                return (
                  <div
                    key={step.key}
                    className="relative flex flex-col items-center gap-2 text-center"
                    style={{ width: `${100 / STATUS_STEPS.length}%` }}
                  >
                    <div
                      className={cn(
                        'z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                        isCompleted
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background text-muted-foreground',
                        isCurrent && 'ring-4 ring-primary/20',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="hidden sm:block">
                      <p
                        className={cn(
                          'text-xs font-medium mt-1',
                          isCompleted ? 'text-foreground' : 'text-muted-foreground',
                        )}
                      >
                        {step.label}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Labels no mobile */}
            <p className="mt-4 text-center text-sm font-medium text-foreground sm:hidden">
              {STATUS_STEPS[currentStepIndex]?.label}
            </p>

            {/* Código de rastreamento */}
            {order.trackingCode && (
              <div className="mt-6 rounded-lg bg-muted/30 p-4 border border-border/50">
                <p className="text-sm text-muted-foreground">
                  Código de rastreamento:{' '}
                  <span className="font-mono font-bold text-primary tracking-wider">
                    {order.trackingCode}
                  </span>
                </p>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <a
                    href={`https://www.correios.com.br/rastreamento/#/resultado/${order.trackingCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-3 w-3" />
                    Rastrear Objeto
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna principal: Itens + Resumo */}
        <div className="space-y-6 lg:col-span-2">
          {/* Itens do Pedido */}
          <Card className="shadow-sm border-muted/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4 text-primary" />
                Produtos Adquiridos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => {
                const product = item.product
                const productImage = product?.images?.[0]
                
                return (
                  <div key={item.id} className="flex items-center gap-4 group">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-border/50 bg-background shadow-sm transition-transform group-hover:scale-105">
                      {productImage ? (
                        <Image
                          src={productImage}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted/30">
                          <Package className="h-6 w-6 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {product?.name || 'Produto indisponível'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Qtd: {item.quantity} &times;{' '}
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                    <p className="font-semibold text-foreground">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                )
              })}

              <Separator className="my-4" />

              {/* Resumo de valores */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Frete</span>
                  <span className="font-medium">
                    {order.shippingCost === 0 ? (
                      <span className="text-emerald-600 font-semibold bg-emerald-100/50 px-2 py-0.5 rounded text-xs uppercase tracking-wider">Grátis</span>
                    ) : (
                      formatCurrency(order.shippingCost)
                    )}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between items-center text-emerald-600">
                    <span>Desconto</span>
                    <span className="font-medium">-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between items-center text-lg font-bold text-foreground">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna lateral: Endereço + Ações */}
        <div className="space-y-4">
          {/* Endereço de Entrega */}
          <Card className="shadow-sm border-muted/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4 text-primary" />
                Entrega para
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">{order.customerName}</p>
              <p>
                {shippingAddress.street || 'Rua'}, {shippingAddress.number || 'S/N'}
                {shippingAddress.complement ? ` - ${shippingAddress.complement}` : ''}
              </p>
              <p>{shippingAddress.neighborhood}</p>
              <p>
                {shippingAddress.city} - {shippingAddress.state}
              </p>
              <p className="pt-1 font-mono text-xs">CEP: {shippingAddress.zipCode}</p>
            </CardContent>
          </Card>

          {/* Datas importantes */}
          <Card className="shadow-sm border-muted/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-primary" />
                Histórico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Pedido feito</span>
                <span className="font-medium">{formatDate(order.createdAt)}</span>
              </div>
              {order.paidAt && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Pago em</span>
                  <span className="font-medium">{formatDate(order.paidAt)}</span>
                </div>
              )}
              {order.shippedAt && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Enviado em</span>
                  <span className="font-medium">{formatDate(order.shippedAt)}</span>
                </div>
              )}
              {order.deliveredAt && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Entregue em</span>
                  <span className="font-medium text-emerald-600">{formatDate(order.deliveredAt)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Solicitar Reembolso */}
          {(status === 'PAID' || status === 'SHIPPED' || status === 'DELIVERED') && (
            <Button variant="outline" className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/5 hover:border-destructive/30 transition-all" asChild>
              <a href={refundMailto}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Solicitar Reembolso
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
