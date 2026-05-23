"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutFormSchema, type CheckoutFormData } from "@/lib/validation";
import { useCartStore } from "@/lib/store/cart";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"customer" | "shipping" | "review">(
    "customer",
  );

  const {
    items,
    getSubtotal,
    getDiscount,
    getShippingCost,
    getTotal,
    shipping,
  } = useCartStore();

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      cpf: "",
      zipCode: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      termsAccepted: false,
      privacyAccepted: false,
    },
  });

  useEffect(() => {
    setMounted(true);

    // Redirecionar se carrinho vazio
    if (items.length === 0) {
      router.push("/carrinho");
    }
  }, [items, router]);

  const onSubmit = async (data: CheckoutFormData) => {
    if (!shipping) {
      toast.error("Selecione uma opção de frete");
      return;
    }

    setIsSubmitting(true);

    try {
      // Criar pedido na API
      const response = await fetch("/api/create-yampi-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: data,
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
          shippingOption: shipping,
          subtotal: getSubtotal(),
          discount: getDiscount(),
          total: getTotal(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao criar pedido");
      }

      const result = await response.json();

      // Redirecionar para checkout Yampi
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        toast.error("Erro ao obter URL de checkout");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao processar checkout",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return null;
  }

  if (items.length === 0) {
    return null;
  }

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const shippingCost = getShippingCost();
  const total = getTotal();

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/carrinho">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o carrinho
            </Link>
          </Button>

          <h1 className="text-3xl font-bold tracking-tight">
            Finalizar Compra
          </h1>
          <p className="mt-2 text-muted-foreground">
            Preencha seus dados para completar o pedido
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Formulário */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* Seção: Dados Pessoais */}
                <div className="rounded-lg border bg-card p-6">
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                    <CheckCircle2 className="h-5 w-5" />
                    Dados Pessoais
                  </h2>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="João Silva Santos" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="seu@email.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input placeholder="(11) 99999-9999" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF</FormLabel>
                          <FormControl>
                            <Input placeholder="000.000.000-00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Seção: Endereço de Entrega */}
                <div className="rounded-lg border bg-card p-6">
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                    <CheckCircle2 className="h-5 w-5" />
                    Endereço de Entrega
                  </h2>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input placeholder="00000-000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4">
                      <FormField
                        control={form.control}
                        name="street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rua</FormLabel>
                            <FormControl>
                              <Input placeholder="Rua..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número</FormLabel>
                            <FormControl>
                              <Input placeholder="123" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="complement"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Complemento (Opcional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Apto 42" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="neighborhood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bairro</FormLabel>
                          <FormControl>
                            <Input placeholder="Centro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cidade</FormLabel>
                            <FormControl>
                              <Input placeholder="São Paulo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="SP"
                                maxLength={2}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Seção: Termos e Condições */}
                <div className="rounded-lg border bg-card p-6">
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                    <CheckCircle2 className="h-5 w-5" />
                    Consentimentos
                  </h2>

                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="termsAccepted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="flex-1">
                            <FormLabel className="text-sm font-normal">
                              Aceito os{" "}
                              <Link
                                href="#"
                                className="text-primary hover:underline"
                              >
                                termos e condições
                              </Link>{" "}
                              de compra
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="privacyAccepted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="flex-1">
                            <FormLabel className="text-sm font-normal">
                              Aceito a{" "}
                              <Link
                                href="#"
                                className="text-primary hover:underline"
                              >
                                política de privacidade
                              </Link>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Botão de envio */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting || !shipping}
                >
                  {isSubmitting ? (
                    "Processando..."
                  ) : (
                    <>
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Pagar {formatCurrency(total)}
                    </>
                  )}
                </Button>

                {!shipping && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Volte para o carrinho e selecione uma opção de frete
                    </AlertDescription>
                  </Alert>
                )}
              </form>
            </Form>
          </div>

          {/* Resumo do Pedido */}
          <div className="space-y-4">
            <div className="rounded-lg border bg-card p-6 sticky top-4">
              <h3 className="mb-4 font-semibold">Resumo do Pedido</h3>

              {/* Itens */}
              <div className="mb-4 space-y-2 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex justify-between text-sm"
                  >
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        x{item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatCurrency(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Valores */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
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
                    <span>
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

              {/* Informações de segurança */}
              <div className="mt-6 space-y-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                <p>✓ Compra 100% segura e criptografada</p>
                <p>✓ Seu pagamento é processado pela Yampi</p>
                <p>✓ Proteção contra fraudes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
