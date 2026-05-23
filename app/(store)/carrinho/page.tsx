"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/store/cart";
import { formatCurrency } from "@/lib/format";
import { SHIPPING_CONFIG, CART_CONFIG } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [zipCode, setZipCode] = useState("");
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [loadingShipping, setLoadingShipping] = useState(false);

  const {
    items,
    coupon,
    shipping,
    removeItem,
    updateQuantity,
    setCoupon,
    setShipping,
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

  const handleCalculateShipping = async () => {
    if (!zipCode.trim() || zipCode.length < 8) {
      toast.error("CEP inválido");
      return;
    }

    setLoadingShipping(true);
    try {
      const response = await fetch("/api/calculate-shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zipCode: zipCode.replace(/\D/g, ""),
          items,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao calcular frete");
      }

      const options = await response.json();
      setShippingOptions(options);

      if (options.length > 0) {
        setShipping(options[0]);
      }

      toast.success("Frete calculado!");
    } catch (error) {
      toast.error("Erro ao calcular frete");
      setShippingOptions([]);
    } finally {
      setLoadingShipping(false);
    }
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
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Seu Carrinho</h1>
            <p className="mt-2 text-muted-foreground">
              {items.length} {items.length === 1 ? "item" : "itens"}
            </p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/produtos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continuar Comprando
            </Link>
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-semibold">Carrinho vazio</h2>
            <p className="mt-2 text-muted-foreground">
              Adicione produtos para começar suas compras
            </p>
            <Button asChild className="mt-6">
              <Link href="/produtos">Explorar Produtos</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Itens do carrinho */}
            <div className="lg:col-span-2">
              <div className="space-y-4 rounded-lg border bg-card p-6">
                {items.map((cartItem) => (
                  <div key={cartItem.product.id}>
                    <div className="flex gap-4">
                      {/* Imagem */}
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {cartItem.product.images?.[0] && (
                          <Image
                            src={cartItem.product.images[0]}
                            alt={cartItem.product.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <Link
                          href={`/produtos/${cartItem.product.slug}`}
                          className="text-lg font-semibold hover:text-primary"
                        >
                          {cartItem.product.name}
                        </Link>

                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-lg font-bold">
                            {formatCurrency(cartItem.product.price)}
                          </span>
                          {cartItem.product.is_buy_one_get_two && (
                            <Badge variant="secondary">Leve 2</Badge>
                          )}
                        </div>

                        {/* Quantidade */}
                        <div className="mt-3 flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              updateQuantity(
                                cartItem.product.id,
                                Math.max(cartItem.quantity - 1, 1),
                              )
                            }
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">
                            {cartItem.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
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
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="ml-auto"
                            onClick={() => removeItem(cartItem.product.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      {/* Subtotal por item */}
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Subtotal
                        </p>
                        <p className="text-lg font-bold">
                          {formatCurrency(
                            cartItem.product.price * cartItem.quantity,
                          )}
                        </p>
                      </div>
                    </div>
                    <Separator className="mt-4" />
                  </div>
                ))}
              </div>
            </div>

            {/* Resumo e Checkout */}
            <div className="space-y-4">
              {/* Cupom */}
              <div className="rounded-lg border bg-card p-4">
                <h3 className="mb-3 font-semibold">Cupom de Desconto</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Código do cupom"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={isApplyingCoupon || !!coupon}
                  />
                  {coupon ? (
                    <Button variant="outline" onClick={() => setCoupon(null)}>
                      Remover
                    </Button>
                  ) : (
                    <Button
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !couponCode}
                    >
                      Aplicar
                    </Button>
                  )}
                </div>
                {coupon && (
                  <p className="mt-2 text-sm text-green-600">
                    ✓ Cupom aplicado: -{formatCurrency(getDiscount())}
                  </p>
                )}
              </div>

              {/* Frete */}
              <div className="rounded-lg border bg-card p-4">
                <h3 className="mb-3 font-semibold">Calcular Frete</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="00000-000"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    maxLength={9}
                  />
                  <Button
                    onClick={handleCalculateShipping}
                    disabled={loadingShipping}
                  >
                    {loadingShipping ? "Calculando..." : "Calcular"}
                  </Button>
                </div>

                {shippingOptions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {shippingOptions.map((option, idx) => (
                      <label
                        key={idx}
                        className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50"
                      >
                        <input
                          type="radio"
                          name="shipping"
                          checked={shipping?.id === option.id}
                          onChange={() => setShipping(option)}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{option.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {option.deadline} dias úteis
                          </p>
                        </div>
                        <span className="font-semibold">
                          {option.price === 0 ? (
                            <span className="text-green-600">Grátis</span>
                          ) : (
                            formatCurrency(option.price)
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {subtotal > 0 &&
                  subtotal < SHIPPING_CONFIG.freeShippingThreshold &&
                  !isFreeShipping && (
                    <div className="mt-3 flex gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <p>
                        Frete grátis acima de{" "}
                        {formatCurrency(SHIPPING_CONFIG.freeShippingThreshold)}
                      </p>
                    </div>
                  )}
              </div>

              {/* Resumo de valores */}
              <div className="rounded-lg border bg-card p-4">
                <h3 className="mb-4 font-semibold">Resumo do Pedido</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">
                      {formatCurrency(subtotal)}
                    </span>
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

                <Button
                  asChild
                  size="lg"
                  className="mt-4 w-full"
                  disabled={items.length === 0 || !shipping}
                >
                  <Link href="/checkout">Finalizar Compra</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
