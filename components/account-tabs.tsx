'use client'

import * as React from 'react'
import { Prisma } from '@prisma/client'
import { formatCurrency, formatDate } from '@/lib/format'
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AddAddressDialog } from '@/components/account/add-address-dialog'
import { Package, User, MapPin, Plus, ShoppingBag, Truck, CheckCircle2, ChevronRight } from 'lucide-react'

type ProfileWithRelations = Prisma.ProfileGetPayload<{
  include: {
    addresses: true
    orders: {
      orderBy: { createdAt: 'desc' }
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    }
  }
}>

interface AccountTabsProps {
  profile: ProfileWithRelations
}

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
      return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80 border-transparent dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'SHIPPED':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100/80 border-transparent dark:bg-blue-900/30 dark:text-blue-400'
    case 'PAID':
      return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100/80 border-transparent dark:bg-indigo-900/30 dark:text-indigo-400'
    case 'PENDING_PAYMENT':
      return 'bg-amber-100 text-amber-800 hover:bg-amber-100/80 border-transparent dark:bg-amber-900/30 dark:text-amber-400'
    case 'CANCELLED':
    case 'REFUNDED':
      return 'bg-rose-100 text-rose-800 hover:bg-rose-100/80 border-transparent dark:bg-rose-900/30 dark:text-rose-400'
    default:
      return ''
  }
}

export function AccountTabs({ profile }: AccountTabsProps) {
  const { addresses, orders } = profile

  return (
    <Tabs defaultValue="dados" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-8 h-12 p-1 bg-muted/50 rounded-xl">
        <TabsTrigger value="dados" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
          <User className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Meus Dados</span>
          <span className="sm:hidden">Dados</span>
        </TabsTrigger>
        <TabsTrigger value="enderecos" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
          <MapPin className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Endereços</span>
          <span className="sm:hidden">Endereços</span>
        </TabsTrigger>
        <TabsTrigger value="pedidos" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
          <ShoppingBag className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Meus Pedidos</span>
          <span className="sm:hidden">Pedidos</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="dados" className="space-y-6 animate-in fade-in-50 duration-500">
        <Card className="border-muted/60 shadow-sm overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-primary/80 to-primary/40" />
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              Informações do Perfil
            </CardTitle>
            <CardDescription>
              Mantenha seus dados atualizados para facilitar suas próximas compras.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Nome Completo</p>
                <p className="text-base font-semibold">{profile.name || 'Não informado'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">E-mail</p>
                <p className="text-base font-semibold">{profile.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                <p className="text-base font-semibold">{profile.phone || 'Não informado'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">CPF</p>
                <p className="text-base font-semibold">{profile.cpf || 'Não informado'}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 pt-6">
            <Button variant="outline" className="w-full sm:w-auto">Editar Perfil</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="enderecos" className="space-y-6 animate-in fade-in-50 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-semibold flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              Meus Endereços
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              Gerencie os endereços para entrega dos seus pedidos.
            </p>
          </div>
          <AddAddressDialog className="hidden sm:flex shadow-sm hover:shadow transition-all" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.length === 0 ? (
            <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl border-muted-foreground/20">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">Nenhum endereço salvo</h3>
              <p className="text-muted-foreground mb-4 mt-1">
                Adicione um endereço para agilizar seu checkout.
              </p>
              <AddAddressDialog className="flex mx-auto sm:hidden" />
            </div>
          ) : (
            addresses.map((address) => (
              <Card key={address.id} className={`relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-md ${address.isDefault ? 'border-primary/50 ring-1 ring-primary/20' : 'border-muted/60'}`}>
                {address.isDefault && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                    Principal
                  </div>
                )}
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {address.street}, {address.number}
                  </CardTitle>
                  <CardDescription className="flex flex-col gap-1 mt-1">
                    {address.complement && <span>{address.complement}</span>}
                    <span>{address.neighborhood} - {address.city}/{address.state}</span>
                    <span>CEP: {address.zipCode}</span>
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-2 gap-2">
                  <Button variant="secondary" size="sm" className="w-full">Editar</Button>
                  {!address.isDefault && (
                    <Button variant="outline" size="sm" className="w-full">Tornar Principal</Button>
                  )}
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </TabsContent>

      <TabsContent value="pedidos" className="space-y-6 animate-in fade-in-50 duration-500">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-semibold flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              Histórico de Pedidos
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              Acompanhe o status das suas compras recentes.
            </p>
          </div>
        </div>

        <Card className="border-muted/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 rounded-full bg-muted/50 p-6">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground/70" />
                </div>
                <h3 className="text-xl font-medium text-foreground">Nenhum pedido ainda</h3>
                <p className="mt-2 text-muted-foreground max-w-sm">
                  Que tal explorar nossos produtos e fazer sua primeira compra?
                </p>
                <Button className="mt-6" asChild>
                  <a href="/produtos">Explorar produtos</a>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="w-[120px]">Pedido</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rastreio</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const orderNumber = order.yamipiOrderId || `BR${order.id.slice(18).toUpperCase()}`
                    
                    return (
                      <TableRow key={order.id} className="group hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">
                          #{orderNumber}
                        </TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusVariant(order.status as OrderStatus)}
                            className={getStatusClassName(order.status as OrderStatus)}
                          >
                            {ORDER_STATUS_LABELS[order.status as OrderStatus] || order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {order.trackingCode ? (
                            <div className="flex items-center gap-1.5 text-sm text-primary font-medium">
                              <Truck className="h-3.5 w-3.5" />
                              {order.trackingCode}
                            </div>
                          ) : (
                            <span className="text-muted-foreground/60 text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium text-base">
                          {formatCurrency(order.total)}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="group-hover:bg-background group-hover:shadow-sm transition-all" asChild>
                            <a href={`/minha-conta/pedidos/${order.id}`} aria-label={`Ver detalhes do pedido ${orderNumber}`}>
                              <ChevronRight className="h-4 w-4" />
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
