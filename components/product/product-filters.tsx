'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CATEGORY_LABELS, type ProductCategory } from '@/types/database'
import { X } from 'lucide-react'

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevância' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
  { value: 'newest', label: 'Mais recentes' },
  { value: 'name_asc', label: 'Nome A-Z' },
] as const

const PRICE_RANGES = [
  { value: '0-50', label: 'Até R$ 50' },
  { value: '50-100', label: 'R$ 50 - R$ 100' },
  { value: '100-200', label: 'R$ 100 - R$ 200' },
  { value: '200-', label: 'Acima de R$ 200' },
] as const

interface ProductFiltersProps {
  searchQuery?: string
  selectedCategory?: ProductCategory
  selectedPriceRange?: string
  selectedSort?: string
  totalProducts: number
}

export function ProductFilters({
  searchQuery,
  selectedCategory,
  selectedPriceRange,
  selectedSort = 'relevance',
  totalProducts,
}: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value === null || value === '' || value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    
    // Reset to page 1 when filters change
    params.delete('pagina')
    
    router.push(`/produtos?${params.toString()}`)
  }

  const clearAllFilters = () => {
    router.push('/produtos')
  }

  const hasActiveFilters = searchQuery || selectedCategory || selectedPriceRange

  return (
    <div className="space-y-4">
      {/* Results count and active filters */}
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm text-muted-foreground">
          {totalProducts} {totalProducts === 1 ? 'produto encontrado' : 'produtos encontrados'}
        </p>
        
        {hasActiveFilters && (
          <>
            <span className="text-muted-foreground">|</span>
            {searchQuery && (
              <Button
                variant="secondary"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={() => updateFilter('busca', null)}
              >
                Busca: {searchQuery}
                <X className="h-3 w-3" />
              </Button>
            )}
            {selectedCategory && (
              <Button
                variant="secondary"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={() => updateFilter('categoria', null)}
              >
                {CATEGORY_LABELS[selectedCategory]}
                <X className="h-3 w-3" />
              </Button>
            )}
            {selectedPriceRange && (
              <Button
                variant="secondary"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={() => updateFilter('preco', null)}
              >
                {PRICE_RANGES.find((r) => r.value === selectedPriceRange)?.label}
                <X className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={clearAllFilters}
            >
              Limpar filtros
            </Button>
          </>
        )}
      </div>

      {/* Filter controls */}
      <div className="flex flex-wrap gap-3">
        {/* Category filter */}
        <Select
          value={selectedCategory || 'all'}
          onValueChange={(value) => updateFilter('categoria', value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {(Object.entries(CATEGORY_LABELS) as [ProductCategory, string][]).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Price filter */}
        <Select
          value={selectedPriceRange || 'all'}
          onValueChange={(value) => updateFilter('preco', value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Faixa de preço" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Qualquer preço</SelectItem>
            {PRICE_RANGES.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select
          value={selectedSort}
          onValueChange={(value) => updateFilter('ordenar', value === 'relevance' ? null : value)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
