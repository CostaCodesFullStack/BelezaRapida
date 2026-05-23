import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
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
      return 'bg-[color:var(--success)] text-[color:var(--success-foreground)] border-transparent'
    case 'SHIPPED':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'PAID':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'PENDING_PAYMENT':
      return 'bg-[color:var(--warning)]/20 text-[color:var(--warning-foreground)] border-[color:var(--warning)]/30'
    case 'CANCELLED':
      return 'bg-destructive/10 text-destructive border-destructive/20'
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
    redirect(`/auth/login?next=/conta/pedidos/${id}`)
  }

  // Busca o pedido com seus itens
  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!order) {
    notFound()
  }

  const status = order.status as OrderStatus
  const currentStepIndex = getStepIndex(status)
  const isCancelledOrRefunded = status === 'CANCELLED' || status === 'REFUNDED'
  const items = order.order_items ?? []

  const refundMailto = `mailto:${STORE_CONFIG.email}?subject=Solicitar Reembolso - Pedido %23${order.order_number}&body=Olá, gostaria de solicitar o reembolso do pedido %23${order.order_number}.`

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      {/* Cabeçalho */}
      <div className="mb-8 flex items-start gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/conta">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar para minha conta</span>
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              Pedido #{order.order_number}
            </h1>
            <Badge className={getStatusBadgeClass(status)}>
              {ORDER_STATUS_LABELS[status]}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Realizado em {formatDateTime(order.created_at)}
          </p>
        </div>
      </div>

      {/* Linha do Tempo do Status */}
      {!isCancelledOrRefunded && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4" />
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
                          'text-xs font-medium',
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
            {order.tracking_code && (
              <div className="mt-6 rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  Código de rastreamento:{' '}
                  <span className="font-mono font-medium text-foreground">
                    {order.tracking_code}
                  </span>
                </p>
                {order.shipping_carrier && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Transportadora: {order.shipping_carrier}
                  </p>
                )}
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <a
                    href={`https://www.correios.com.br/rastreamento/#/resultado/${order.tracking_code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-3 w-3" />
                    Rastrear nos Correios
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4" />
                Itens do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border bg-muted">
                    {item.product_image ? (
                      <Image
                        src={item.product_image}
                        alt={item.product_name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {item.product_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Qtd: {item.quantity} &times;{' '}
                      {formatCurrency(item.unit_price)}
                    </p>
                    {item.is_buy_one_get_two && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        Leve 2, Pague 1
                      </Badge>
                    )}
                  </div>
                  <p className="font-medium text-foreground">
                    {formatCurrency(item.total_price)}
                  </p>
                </div>
              ))}

              <Separator />

              {/* Resumo de valores */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frete</span>
                  <span>
                    {order.shipping_cost === 0 ? (
                      <span className="text-[color:var(--success)]">Grátis</span>
                    ) : (
                      formatCurrency(order.shipping_cost)
                    )}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-[color:var(--success)]">
                    <span>Desconto</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna lateral: Endereço + Ações */}
        <div className="space-y-4">
          {/* Endereço de Entrega */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" />
                Endereço de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{order.customer_name}</p>
              <p>
                {order.shipping_street}, {order.shipping_number}
                {order.shipping_complement
                  ? ` - ${order.shipping_complement}`
                  : ''}
              </p>
              <p>{order.shipping_neighborhood}</p>
              <p>
                {order.shipping_city} - {order.shipping_state}
              </p>
              <p>CEP: {order.shipping_cep}</p>
            </CardContent>
          </Card>

          {/* Datas importantes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Histórico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pedido feito</span>
                <span>{formatDate(order.created_at)}</span>
              </div>
              {order.paid_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pago em</span>
                  <span>{formatDate(order.paid_at)}</span>
                </div>
              )}
              {order.shipped_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Enviado em</span>
                  <span>{formatDate(order.shipped_at)}</span>
                </div>
              )}
              {order.delivered_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entregue em</span>
                  <span>{formatDate(order.delivered_at)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Solicitar Reembolso */}
          {(status === 'PAID' || status === 'SHIPPED' || status === 'DELIVERED') && (
            <Button variant="outline" className="w-full" asChild>
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
