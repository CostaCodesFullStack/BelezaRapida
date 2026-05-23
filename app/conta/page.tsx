import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/format'
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Package,
  User,
  Star,
  ChevronRight,
  ShoppingBag,
} from 'lucide-react'

function getStatusVariant(status: OrderStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'DELIVERED':
      return 'default'
    case 'SHIPPED':
      return 'secondary'
    case 'PAID':
      return 'outline'
    case 'PENDING_PAYMENT':
      return 'outline'
    case 'CANCELLED':
    case 'REFUNDED':
      return 'destructive'
    default:
      return 'outline'
  }
}

function getStatusClassName(status: OrderStatus): string {
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

export default async function ContaPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/conta')
  }

  // Busca perfil do usuário
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Busca últimos pedidos
  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, status, total, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const totalOrders = orders?.length ?? 0
  const totalSpent = orders?.reduce((acc, o) => acc + (o.total ?? 0), 0) ?? 0
  const displayName = profile?.name ?? user.email?.split('@')[0] ?? 'Cliente'

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      {/* Saudação */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground text-balance">
          Olá, {displayName}!
        </h1>
        <p className="mt-1 text-muted-foreground">
          Bem-vinda de volta. Aqui está um resumo da sua conta.
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-primary/10 p-3">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalOrders}</p>
              <p className="text-sm text-muted-foreground">Pedidos realizados</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-primary/10 p-3">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {orders?.filter((o) => o.status === 'SHIPPED').length ?? 0}
              </p>
              <p className="text-sm text-muted-foreground">Em trânsito</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-primary/10 p-3">
              <Star className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
              <p className="text-sm text-muted-foreground">Total em compras</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Atalhos */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Link href="/conta/dados">
          <Card className="group cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center justify-between pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-accent p-3">
                  <User className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-medium">Meus Dados</p>
                  <p className="text-sm text-muted-foreground">
                    Edite seu perfil e endereços
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/conta/avaliacoes">
          <Card className="group cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center justify-between pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-accent p-3">
                  <Star className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-medium">Minhas Avaliações</p>
                  <p className="text-sm text-muted-foreground">
                    Veja e gerencie suas avaliações
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Últimos Pedidos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Últimos Pedidos</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/conta/pedidos">
              Ver todos
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          {!orders || orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">Nenhum pedido ainda</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Que tal fazer sua primeira compra?
              </p>
              <Button asChild className="mt-4">
                <Link href="/produtos">Explorar produtos</Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Tabela — visível em telas maiores */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          #{order.order_number}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(order.created_at)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusVariant(order.status as OrderStatus)}
                            className={getStatusClassName(order.status as OrderStatus)}
                          >
                            {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(order.total)}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/conta/pedidos/${order.id}`}>
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Lista — visível em mobile */}
              <div className="divide-y sm:hidden">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/conta/pedidos/${order.id}`}
                    className="flex items-center justify-between px-4 py-4 hover:bg-muted/40"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">#{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.created_at)}
                      </p>
                      <Badge
                        variant={getStatusVariant(order.status as OrderStatus)}
                        className={getStatusClassName(order.status as OrderStatus)}
                      >
                        {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{formatCurrency(order.total)}</p>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
