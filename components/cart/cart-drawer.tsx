"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/store/cart";
import { formatCurrency } from "@/lib/format";
import { SHIPPING_CONFIG, CART_CONFIG } from "@/lib/constants";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { calculateShippingAction } from "@/actions/shipping";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Truck,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [zipCode, setZipCode] = useState("");
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  const {
    items,
    coupon,
    shipping,
    addItem,
    removeItem,
    updateQuantity,
    setCoupon,
    setShipping,
    getItemCount,
    getSubtotal,
    getDiscount,
    getShippingCost,
    getTotal,
  } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          subtotal: getSubtotal(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || "Cupom inválido");
        return;
      }

      const coupon = await response.json();
      setCoupon(coupon);
      setCouponCode("");
      toast.success("Cupom aplicado com sucesso!");
    } catch (error) {
      toast.error("Erro ao aplicar cupom");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleCalculateShipping = () => {
    const cleanCep = zipCode.replace(/\D/g, "");
    if (!cleanCep || cleanCep.length < 8) {
      toast.error("CEP inválido");
      return;
    }

    startTransition(async () => {
      const result = await calculateShippingAction({
        destinationCep: cleanCep,
        cartItems: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }))
      });

      if (!result.success) {
        toast.error(result.error || "Erro ao calcular frete");
        setShippingOptions([]);
      } else {
        const options = result.options || [];
        setShippingOptions(options);
        if (options.length > 0) {
          setShipping(options[0]);
        }
        toast.success("Frete calculado com sucesso!");
      }
    });
  };

  if (!mounted) {
    return null;
  }

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const shippingCost = getShippingCost();
  const total = getTotal();

  const isFreeShipping =
    shipping && subtotal >= SHIPPING_CONFIG.freeShippingThreshold;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[90vh] max-h-[90vh] flex flex-col">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-xl">Seu Carrinho</DrawerTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {items.length} {items.length === 1 ? "item" : "itens"}
              </p>
            </div>
            <DrawerClose />
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium">Carrinho vazio</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Adicione produtos para começar
                </p>
              </div>
            ) : (
              items.map((cartItem) => (
                <div
                  key={cartItem.product.id}
                  className="space-y-3 pb-4 border-b"
                >
                  <div className="flex gap-3">
                    {/* Produto imagem */}
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {cartItem.product.images?.[0] && (
                        <Image
                          src={cartItem.product.images[0]}
                          alt={cartItem.product.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>

                    {/* Produto info */}
                    <div className="flex-1">
                      <Link
                        href={`/produtos/${cartItem.product.slug}`}
                        className="font-medium hover:text-primary"
                      >
                        {cartItem.product.name}
                      </Link>

                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          {formatCurrency(cartItem.product.price)}
                        </span>
                        {cartItem.product.is_buy_one_get_two && (
                          <Badge variant="secondary" className="text-xs">
                            Leve 2
                          </Badge>
                        )}
                      </div>

                      {/* Quantidade */}
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0"
                          onClick={() =>
                            updateQuantity(
                              cartItem.product.id,
                              Math.max(cartItem.quantity - 1, 1),
                            )
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">
                          {cartItem.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            const maxQty = Math.min(
                              cartItem.product.stock,
                              CART_CONFIG.maxQuantityPerItem,
                            );
                            if (cartItem.quantity < maxQty) {
                              updateQuantity(
                                cartItem.product.id,
                                cartItem.quantity + 1,
                              );
                            }
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="ml-auto h-6 px-2"
                          onClick={() => removeItem(cartItem.product.id)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <DrawerFooter className="border-t space-y-4">
          {/* Cupom */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Cupom de Desconto
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Código do cupom"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={isApplyingCoupon || !!coupon}
                className="text-sm"
              />
              {coupon ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCoupon(null)}
                  className="text-xs"
                >
                  Remover
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon || !couponCode}
                  className="text-xs"
                >
                  Aplicar
                </Button>
              )}
            </div>
            {coupon && (
              <p className="text-xs text-green-600">
                Cupom aplicado: -{formatCurrency(getDiscount())}
              </p>
            )}
          </div>

          {/* CEP e Frete */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Calcular Frete
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="00000-000"
                value={zipCode}
                onChange={(e) => {
                  let v = e.target.value.replace(/\D/g, "");
                  v = v.replace(/^(\d{5})(\d)/, "$1-$2");
                  setZipCode(v.slice(0, 9));
                }}
                maxLength={9}
                className="text-sm"
              />
              <Button
                size="sm"
                onClick={handleCalculateShipping}
                disabled={isPending || items.length === 0}
                className="text-xs"
              >
                {isPending ? "Calculando..." : "Calcular"}
              </Button>
            </div>

            {shippingOptions.length > 0 && (
              <RadioGroup
                value={shipping?.id}
                onValueChange={(val) => {
                  const selected = shippingOptions.find(opt => opt.id === val);
                  if (selected) setShipping(selected);
                }}
                className="space-y-2 rounded-lg bg-muted p-3 mt-3"
              >
                {shippingOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2 rounded hover:bg-background/50 p-1">
                    <RadioGroupItem value={option.id} id={`ship-${option.id}`} />
                    <Label htmlFor={`ship-${option.id}`} className="flex flex-1 items-center justify-between cursor-pointer">
                      <div>
                        <p className="text-xs font-medium">{option.name}</p>
                        <p className="text-xs text-muted-foreground">{option.delivery_time} dias úteis</p>
                      </div>
                      <span className="text-xs font-semibold">
                        {option.price === 0 ? (
                          <span className="text-green-600">Grátis</span>
                        ) : (
                          formatCurrency(option.price)
                        )}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {subtotal > 0 &&
              subtotal < SHIPPING_CONFIG.freeShippingThreshold &&
              !isFreeShipping && (
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>
                    Frete grátis acima de{" "}
                    {formatCurrency(SHIPPING_CONFIG.freeShippingThreshold)}
                  </p>
                </div>
              )}
          </div>

          <Separator />

          {/* Resumo de valores */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Desconto</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}

            {shipping && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frete</span>
                <span className="font-medium">
                  {shippingCost === 0 ? (
                    <span className="text-green-600">Grátis</span>
                  ) : (
                    formatCurrency(shippingCost)
                  )}
                </span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Botões */}
          <Button
            asChild
            size="lg"
            className="w-full"
            disabled={items.length === 0 || !shipping}
          >
            <Link href="/checkout">Finalizar Compra</Link>
          </Button>

          <Button variant="outline" size="lg" className="w-full" asChild>
            <Link href="/produtos">Continuar Comprando</Link>
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
