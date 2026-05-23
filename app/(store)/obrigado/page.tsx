"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart";
import { formatCurrency } from "@/lib/format";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Mail,
  Truck,
  MessageCircle,
  ArrowRight,
  Package,
} from "lucide-react";

export default function ThankYouPage() {
  const [mounted, setMounted] = useState(false);
  const {
    items,
    getSubtotal,
    getDiscount,
    getShippingCost,
    getTotal,
    clearCart,
  } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const shippingCost = getShippingCost();
  const total = getTotal();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-background py-12">
      <div className="container mx-auto px-4">
        {/* Success Message */}
        <div className="mx-auto max-w-2xl rounded-lg bg-card p-8 text-center shadow-lg">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-green-900">
            Pedido Confirmado!
          </h1>

          <p className="mt-2 text-lg text-muted-foreground">
            Agradecemos sua compra. Seu pedido será processado em breve.
          </p>

          {/* Order Details */}
          <div className="mt-8 rounded-lg bg-muted/50 p-6">
            <h2 className="mb-4 font-semibold">Detalhes do Pedido</h2>

            {/* Itens */}
            <div className="mb-4 space-y-2">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex justify-between text-sm"
                >
                  <div>
                    <p>{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Quantidade: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    {formatCurrency(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <Separator />

            {/* Resumo de valores */}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Frete</span>
                <span>
                  {shippingCost === 0 ? (
                    <span className="text-green-600">Grátis</span>
                  ) : (
                    formatCurrency(shippingCost)
                  )}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {/* Email Confirmation */}
            <div className="rounded-lg border p-4">
              <Mail className="mx-auto mb-2 h-6 w-6 text-blue-600" />
              <h3 className="font-semibold">Confirmação por Email</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Você receberá um email com todos os detalhes
              </p>
            </div>

            {/* Shipping */}
            <div className="rounded-lg border p-4">
              <Truck className="mx-auto mb-2 h-6 w-6 text-orange-600" />
              <h3 className="font-semibold">Envio em Breve</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Seu pedido será enviado nos próximos dias
              </p>
            </div>

            {/* Tracking */}
            <div className="rounded-lg border p-4">
              <Package className="mx-auto mb-2 h-6 w-6 text-purple-600" />
              <h3 className="font-semibold">Acompanhamento</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Receba atualizações em tempo real
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/produtos">
                Continuar Comprando
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Button variant="outline" size="lg" asChild>
              <a href="https://wa.me/5511999999999?text=Olá,%20tenho%20dúvidas%20sobre%20meu%20pedido">
                <MessageCircle className="mr-2 h-5 w-5" />
                WhatsApp
              </a>
            </Button>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="mt-12 rounded-lg bg-card p-6 text-center">
          <h2 className="mb-4 font-semibold">
            Sua Segurança é Nossa Prioridade
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm font-medium">🔒 Compra Segura</p>
              <p className="text-xs text-muted-foreground">
                Criptografia SSL de ponta a ponta
              </p>
            </div>

            <div>
              <p className="text-sm font-medium">💳 Pagamento Protegido</p>
              <p className="text-xs text-muted-foreground">
                Processado via Yampi
              </p>
            </div>

            <div>
              <p className="text-sm font-medium">✓ Garantia</p>
              <p className="text-xs text-muted-foreground">
                Satisfação garantida
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 max-w-2xl rounded-lg bg-muted/30 p-6">
          <h2 className="mb-4 font-semibold">Perguntas Frequentes</h2>

          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium">Quando receberei meu pedido?</p>
              <p className="mt-1 text-muted-foreground">
                O prazo de entrega foi informado durante o checkout. Você
                receberá um código de rastreamento por email.
              </p>
            </div>

            <div>
              <p className="font-medium">Posso cancelar meu pedido?</p>
              <p className="mt-1 text-muted-foreground">
                Entre em contato conosco via WhatsApp nos primeiros 24 horas
                após a compra.
              </p>
            </div>

            <div>
              <p className="font-medium">E se tiver dúvidas?</p>
              <p className="mt-1 text-muted-foreground">
                Nossa equipe está disponível pelo WhatsApp para ajudar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
