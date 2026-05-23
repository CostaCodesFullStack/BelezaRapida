'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/store/cart'
import type { Product } from '@/types/database'
import { formatCurrency, calculateDiscountPercentage } from '@/lib/format'
import { ShoppingBag, Sparkles, Check } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const addItem = useCartStore((state) => state.addItem)
  const existingItem = useCartStore((state) => state.getItemByProductId(product.id))

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (product.stock <= 0) return

    setIsAdding(true)
    addItem(product, 1)
    
    toast.success(`${product.name} adicionado ao carrinho!`, {
      icon: <Check className="h-4 w-4" />,
    })

    setTimeout(() => setIsAdding(false), 1000)
  }

  const discount = product.compare_at_price
    ? calculateDiscountPercentage(product.compare_at_price, product.price)
    : null

  const isOutOfStock = product.stock <= 0

  return (
    <Link
      href={`/produtos/${product.slug}`}
      className="group relative flex flex-col rounded-lg border bg-card transition-all hover:border-primary/50 hover:shadow-md"
    >
      {/* Badges */}
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
        {discount && discount >= 10 && (
          <span className="rounded bg-destructive px-2 py-0.5 text-xs font-medium text-destructive-foreground">
            -{discount}%
          </span>
        )}
        {product.is_buy_one_get_two && (
          <span className="rounded bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
            Leve 2 Pague 1
          </span>
        )}
        {isOutOfStock && (
          <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            Esgotado
          </span>
        )}
      </div>

      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Sparkles className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 flex-1 text-balance font-medium leading-tight">
          {product.name}
        </h3>

        {/* Price */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary">
            {formatCurrency(product.price)}
          </span>
          {product.compare_at_price && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(product.compare_at_price)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          size="sm"
          className="mt-4 w-full"
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdding}
        >
          {isAdding ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Adicionado
            </>
          ) : existingItem ? (
            <>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Adicionar mais
            </>
          ) : (
            <>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Adicionar
            </>
          )}
        </Button>
      </div>
    </Link>
  )
}
