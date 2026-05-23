import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
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
  const supabase = await createClient()
  
  const { data: product } = await supabase
    .from('products')
    .select('name, description')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!product) {
    return { title: 'Produto não encontrado' }
  }

  return {
    title: product.name,
    description: product.description || `Compre ${product.name} na Beleza Rápida`,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const supabase = await createClient()
  
  // Buscar produto
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!product) {
    notFound()
  }

  // Buscar avaliações aprovadas
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', product.id)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(10)

  // Buscar produtos relacionados (mesma categoria)
  const { data: relatedProducts } = await supabase
    .from('products')
    .select('*')
    .eq('category', product.category)
    .eq('is_active', true)
    .neq('id', product.id)
    .limit(4)

  // Calcular média de avaliações
  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0

  return (
    <div className="container mx-auto px-4 py-8">
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
