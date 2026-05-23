import { Suspense } from 'react'
import { Metadata } from 'next'
import { ProductGrid } from '@/components/product/product-grid'
import { ProductFilters } from '@/components/product/product-filters'
import { createClient } from '@/lib/supabase/server'
import { CATEGORY_LABELS, type ProductCategory } from '@/types/database'
import { PAGINATION_CONFIG } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Produtos',
  description: 'Explore nossa coleção completa de produtos de beleza e saúde',
}

interface ProductsPageProps {
  searchParams: Promise<{
    busca?: string
    categoria?: ProductCategory
    preco?: string
    ordenar?: string
    pagina?: string
  }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const supabase = await createClient()
  
  const page = Math.max(1, parseInt(params.pagina || '1'))
  const limit = PAGINATION_CONFIG.productsPerPage
  const offset = (page - 1) * limit

  // Build query
  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true)

  // Filter by search
  if (params.busca) {
    query = query.or(`name.ilike.%${params.busca}%,description.ilike.%${params.busca}%`)
  }

  // Filter by category
  if (params.categoria && params.categoria in CATEGORY_LABELS) {
    query = query.eq('category', params.categoria)
  }

  // Filter by price range
  if (params.preco) {
    const [min, max] = params.preco.split('-')
    if (min) query = query.gte('price', parseFloat(min))
    if (max) query = query.lte('price', parseFloat(max))
  }

  // Sort
  switch (params.ordenar) {
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    case 'name_asc':
      query = query.order('name', { ascending: true })
      break
    default:
      // Relevance: featured first, then by created_at
      query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
  }

  // Pagination
  query = query.range(offset, offset + limit - 1)

  const { data: products, count } = await query

  const totalPages = Math.ceil((count || 0) / limit)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  // Build pagination URL
  const buildPageUrl = (pageNum: number) => {
    const searchParamsObj = new URLSearchParams()
    if (params.busca) searchParamsObj.set('busca', params.busca)
    if (params.categoria) searchParamsObj.set('categoria', params.categoria)
    if (params.preco) searchParamsObj.set('preco', params.preco)
    if (params.ordenar) searchParamsObj.set('ordenar', params.ordenar)
    if (pageNum > 1) searchParamsObj.set('pagina', pageNum.toString())
    const queryString = searchParamsObj.toString()
    return `/produtos${queryString ? `?${queryString}` : ''}`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {params.categoria
            ? CATEGORY_LABELS[params.categoria]
            : params.busca
            ? `Resultados para "${params.busca}"`
            : 'Todos os Produtos'}
        </h1>
      </div>

      {/* Filters */}
      <Suspense fallback={<div className="h-20 animate-pulse rounded bg-muted" />}>
        <ProductFilters
          searchQuery={params.busca}
          selectedCategory={params.categoria}
          selectedPriceRange={params.preco}
          selectedSort={params.ordenar}
          totalProducts={count || 0}
        />
      </Suspense>

      {/* Product Grid */}
      <div className="mt-8">
        <ProductGrid 
          products={products || []} 
          emptyMessage={
            params.busca
              ? `Nenhum produto encontrado para "${params.busca}"`
              : 'Nenhum produto disponível no momento.'
          }
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Paginação">
          <Button
            variant="outline"
            size="sm"
            asChild={hasPrevPage}
            disabled={!hasPrevPage}
          >
            {hasPrevPage ? (
              <Link href={buildPageUrl(page - 1)}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Anterior
              </Link>
            ) : (
              <span>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Anterior
              </span>
            )}
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (page <= 3) {
                pageNum = i + 1
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = page - 2 + i
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? 'default' : 'outline'}
                  size="sm"
                  asChild={pageNum !== page}
                  className="w-10"
                >
                  {pageNum === page ? (
                    <span>{pageNum}</span>
                  ) : (
                    <Link href={buildPageUrl(pageNum)}>{pageNum}</Link>
                  )}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            asChild={hasNextPage}
            disabled={!hasNextPage}
          >
            {hasNextPage ? (
              <Link href={buildPageUrl(page + 1)}>
                Próxima
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            ) : (
              <span>
                Próxima
                <ChevronRight className="ml-1 h-4 w-4" />
              </span>
            )}
          </Button>
        </nav>
      )}
    </div>
  )
}
