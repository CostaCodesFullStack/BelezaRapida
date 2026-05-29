import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { STORE_CONFIG, SEO_CONFIG, SHIPPING_CONFIG } from "@/lib/constants";
import {
  CATEGORY_LABELS,
  type ProductCategory,
  type Product,
} from "@/types/database";
import { prisma } from "@/prisma/client";
import { formatCurrency } from "@/lib/format";
import {
  Sparkles,
  Truck,
  Shield,
  CreditCard,
  Star,
  ArrowRight,
} from "lucide-react";

const CATEGORY_ICONS: Record<ProductCategory, string> = {
  SKINCARE: "🧴",
  HAIRCARE: "💇",
  MAKEUP: "💄",
  SUPPLEMENTS: "💊",
  BODY: "🧖",
  FRAGRANCE: "🌸",
};

export default async function HomePage() {
  // Buscar produtos em destaque usando Prisma
  let featuredProducts: Product[] = [];
  let promoProducts: Product[] = [];

  try {
    featuredProducts = await prisma.product.findMany({
      where: {
        is_featured: true,
        is_active: true,
      },
      take: 8,
    });

    // Buscar produtos com promoção "Leve 2 Pague 1"
    promoProducts = await prisma.product.findMany({
      where: {
        is_buy_one_get_two: true,
        is_active: true,
      },
      take: 4,
    });
  } catch (error) {
    // Se a tabela não existir ainda, continuar com arrays vazios
    console.error("[v0] Erro ao buscar produtos:", error);
  }

  const categories = Object.entries(CATEGORY_LABELS) as [
    ProductCategory,
    string,
  ][];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/30 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                {STORE_CONFIG.tagline}
              </h1>
              <p className="mt-6 text-pretty text-lg text-muted-foreground sm:text-xl">
                {SEO_CONFIG.description}
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Button asChild size="lg" className="text-base">
                  <Link href="/produtos">
                    Ver todos os produtos
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="text-base"
                >
                  <Link href="/produtos?categoria=SKINCARE">Skincare</Link>
                </Button>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="aspect-square rounded-full bg-primary/10 p-8">
                <div className="flex h-full items-center justify-center">
                  <Sparkles className="h-48 w-48 text-primary/30" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-y bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Frete Grátis</h3>
                <p className="text-sm text-muted-foreground">
                  Acima de{" "}
                  {formatCurrency(SHIPPING_CONFIG.freeShippingThreshold)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Compra Segura</h3>
                <p className="text-sm text-muted-foreground">100% protegida</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Parcelamento</h3>
                <p className="text-sm text-muted-foreground">
                  Até 12x sem juros
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Produtos Originais</h3>
                <p className="text-sm text-muted-foreground">
                  Garantia de qualidade
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Categorias</h2>
            <p className="mt-2 text-muted-foreground">
              Encontre o produto perfeito para você
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map(([key, label]) => (
              <Link
                key={key}
                href={`/produtos?categoria=${key}`}
                className="group flex items-center gap-4 rounded-lg border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md"
              >
                <span className="text-4xl">{CATEGORY_ICONS[key]}</span>
                <div className="flex-1">
                  <h3 className="font-semibold group-hover:text-primary">
                    {label}
                  </h3>
                  <p className="text-sm text-muted-foreground">Ver produtos</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Destaques</h2>
                <p className="mt-2 text-muted-foreground">
                  Os favoritos dos nossos clientes
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/produtos?destaque=true">Ver todos</Link>
              </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Promo Section */}
      {promoProducts && promoProducts.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-10 rounded-lg bg-primary/10 p-6 text-center">
              <span className="inline-block rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground">
                Promoção Especial
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight">
                Leve 2 Pague 1
              </h2>
              <p className="mt-2 text-muted-foreground">
                Aproveite essa oferta imperdível em produtos selecionados
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {promoProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Pronta para realçar sua beleza?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/80">
            Cadastre-se agora e receba 10% de desconto na sua primeira compra
            com o cupom BEMVINDO10
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-8">
            <Link href="/auth/sign-up">Criar minha conta</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
