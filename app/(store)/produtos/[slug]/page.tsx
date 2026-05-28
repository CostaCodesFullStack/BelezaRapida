import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/prisma/client'
import { ProductGallery } from '@/components/product/product-gallery'
import { ProductInfo } from '@/components/product/product-info'
import { ProductTabs } from '@/components/product/product-tabs'
import { ProductCard } from '@/components/product/product-card'
import { CATEGORY_LABELS } from '@/types/database'
import { ChevronRight } from 'lucide-react'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  
  const product = await prisma.product.findFirst({
    where: { slug, is_active: true },
    select: { name: true, description: true, images: true }
  })

  if (!product) {
    return { title: 'Produto não encontrado' }
  }

  const storeName = "Beleza Rápida"; // Nome da loja

  return {
    title: `${product.name} | ${storeName}`,
    description: product.description,
    openGraph: {
      title: `${product.name} | ${storeName}`,
      description: product.description,
      images: product.images && product.images.length > 0 ? [product.images[0]] : [],
    }
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  
  // Buscar produto
  const product = await prisma.product.findFirst({
    where: { slug, is_active: true }
  })

  if (!product) {
    notFound()
  }

  // Buscar avaliações aprovadas
  const reviews = await prisma.review.findMany({
    where: { productId: product.id, approved: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  // Buscar produtos relacionados (mesma categoria)
  const relatedProducts = await prisma.product.findMany({
    where: {
      category: product.category,
      is_active: true,
      id: { not: product.id }
    },
    take: 4
  })

  // Calcular média de avaliações
  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0

  // JSON-LD Schema Markup
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'BRL',
      availability: product.stock > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/produtos" className="hover:text-foreground">
          Produtos
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/produtos?categoria=${product.category}`} className="hover:text-foreground">
          {CATEGORY_LABELS[product.category as keyof typeof CATEGORY_LABELS]}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* Product Section */}
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Gallery */}
        <ProductGallery 
          images={product.images || []} 
          productName={product.name} 
        />

        {/* Product Info */}
        <ProductInfo 
          product={product}
          averageRating={averageRating}
          reviewCount={reviews?.length || 0}
        />
      </div>

      {/* Product Tabs (Description, How to Use, Reviews) */}
      <div className="mt-12">
        <ProductTabs 
          product={product}
          reviews={reviews || []}
        />
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">
            Produtos Relacionados
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
