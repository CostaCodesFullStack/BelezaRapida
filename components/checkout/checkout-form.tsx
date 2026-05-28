'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Address } from '@prisma/client'
import { useCartStore } from '@/lib/store/cart'
import { formatCurrency } from '@/lib/format'
import { checkoutAction } from '@/actions/checkout'

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { AddAddressDialog } from '@/components/account/add-address-dialog'
import { Loader2, MapPin, Truck, ShoppingBag, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface CheckoutFormProps {
  initialAddresses: Address[]
}

export function CheckoutForm({ initialAddresses }: CheckoutFormProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isPending, startTransition] = useTransition()
  
  const defaultAddress = initialAddresses.find(a => a.isDefault)?.id || (initialAddresses[0]?.id ?? '')
  const [selectedAddressId, setSelectedAddressId] = useState<string>(defaultAddress)

  const {
    items,
    shipping,
    coupon,
    getSubtotal,
    getDiscount,
    getTotal,
    clearCart
  } = useCartStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">Seu carrinho está vazio</h2>
        <p className="text-muted-foreground mt-2 mb-6">Você precisa adicionar produtos para finalizar a compra.</p>
        <Button onClick={() => router.push('/produtos')}>Ir para a Loja</Button>
      </div>
    )
  }

  const handleCheckout = () => {
    if (!selectedAddressId) {
      toast.error('Por favor, selecione um endereço de entrega.')
      return
    }

    if (!shipping) {
      toast.error('Por favor, calcule e selecione o frete antes de finalizar.')
      return
    }

    startTransition(async () => {
      const result = await checkoutAction({
        addressId: selectedAddressId,
        shippingName: shipping.name,
        shippingPrice: shipping.price,
        couponId: coupon?.id,
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }))
      })

      if (result.success && result.orderId) {
        clearCart()
        toast.success('Pedido realizado com sucesso!')
        router.push(`/checkout/sucesso?orderId=${result.orderId}`)
      } else {
        toast.error(result.error || 'Erro ao processar pagamento.')
      }
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {/* Endereços */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Endereço de Entrega
            </CardTitle>
            <AddAddressDialog buttonVariant="outline" className="h-8 text-xs" />
          </CardHeader>
          <CardContent>
            {initialAddresses.length === 0 ? (
              <div className="text-center py-6 bg-muted/30 rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground mb-3">Você ainda não tem endereços cadastrados.</p>
                <AddAddressDialog />
              </div>
            ) : (
              <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId} className="space-y-3">
                {initialAddresses.map((address) => (
                  <div key={address.id} className={`flex items-start space-x-3 rounded-lg border p-4 transition-all hover:bg-muted/50 ${selectedAddressId === address.id ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : ''}`}>
                    <RadioGroupItem value={address.id} id={`addr-${address.id}`} className="mt-1" />
                    <Label htmlFor={`addr-${address.id}`} className="flex flex-col cursor-pointer w-full">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-base">
                          {address.street}, {address.number}
                        </span>
                        {address.isDefault && (
                          <Badge variant="secondary" className="text-[10px]">Principal</Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground mt-1">
                        {address.neighborhood} - {address.city}/{address.state}
                      </span>
                      {address.complement && (
                        <span className="text-sm text-muted-foreground">{address.complement}</span>
                      )}
                      <span className="text-sm text-muted-foreground mt-1">CEP: {address.zipCode}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </CardContent>
        </Card>

        {/* Frete */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Opção de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent>
            {shipping ? (
              <div className="flex items-center justify-between border rounded-lg p-4 bg-muted/20">
                <div className="flex flex-col">
                  <span className="font-semibold">{shipping.name}</span>
                  <span className="text-sm text-muted-foreground">Prazo estimado: {shipping.delivery_time} dias úteis</span>
                </div>
                <span className="font-bold text-lg">
                  {shipping.price === 0 ? <span className="text-green-600">Grátis</span> : formatCurrency(shipping.price)}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-4 text-amber-800 border border-amber-200">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm">
                  O frete não foi calculado. Por favor, volte ao carrinho e calcule o frete para sua região.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resumo do Pedido */}
      <div className="space-y-6">
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle>Resumo do Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-4">
                  <div className="relative h-16 w-16 rounded-md bg-muted overflow-hidden shrink-0">
                    {item.product.images?.[0] && (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-col flex-1 justify-center">
                    <span className="text-sm font-medium line-clamp-2">{item.product.name}</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">Qtd: {item.quantity}</span>
                      <span className="text-sm font-semibold">{formatCurrency(item.product.price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(getSubtotal())}</span>
              </div>
              {getDiscount() > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto {coupon ? `(${coupon.code})` : ''}</span>
                  <span>-{formatCurrency(getDiscount())}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Frete</span>
                <span>{shipping ? (shipping.price === 0 ? 'Grátis' : formatCurrency(shipping.price)) : '---'}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(getTotal())}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              size="lg" 
              className="w-full text-base" 
              disabled={isPending || !selectedAddressId || !shipping}
              onClick={handleCheckout}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processando Pedido...
                </>
              ) : (
                'Finalizar Compra'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
