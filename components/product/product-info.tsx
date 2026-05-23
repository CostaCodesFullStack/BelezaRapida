'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/store/cart'
import type { Product } from '@/types/database'
import { CATEGORY_LABELS } from '@/types/database'
import { formatCurrency, calculateDiscountPercentage } from '@/lib/format'
import { 
  ShoppingBag, 
  Check, 
  Minus, 
  Plus, 
  Truck, 
  Shield, 
  Star,
  Package,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { SHIPPING_CONFIG, CART_CONFIG } from '@/lib/constants'

interface ProductInfoProps {
  product: Product
  averageRating: number
  reviewCount: number
}

export function ProductInfo({ product, averageRating, reviewCount }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  const discount = product.compare_at_price
    ? calculateDiscountPercentage(product.compare_at_price, product.price)
    : null

  const isOutOfStock = product.stock <= 0
  const maxQuantity = Math.min(product.stock, CART_CONFIG.maxQuantityPerItem)

  const handleAddToCart = () => {
    if (isOutOfStock) return

    setIsAdding(true)
    addItem(product, quantity)
    
    toast.success(`${quantity}x ${product.name} adicionado ao carrinho!`, {
      icon: <Check className="h-4 w-4" />,
    })

    setTimeout(() => {
      setIsAdding(false)
      setQuantity(1)
    }, 1000)
  }

  const incrementQuantity = () => {
    if (quantity < maxQuantity) {
      setQuantity((q) => q + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1)
    }
  }

  return (
    <div className="space-y-6">
      {/* Category */}
      <p className="text-sm text-muted-foreground">
        {CATEGORY_LABELS[product.category]}
      </p>

      {/* Name */}
      <h1 className="text-balance text-3xl font-bold tracking-tight lg:text-4xl">
        {product.name}
      </h1>

      {/* Rating */}
      {reviewCount > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.round(averageRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground/30'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            ({reviewCount} {reviewCount === 1 ? 'avaliação' : 'avaliações'})
          </span>
        </div>
      )}

      {/* Price */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-primary">
            {formatCurrency(product.price)}
          </span>
          {product.compare_at_price && (
            <span className="text-lg text-muted-foreground line-through">
              {formatCurrency(product.compare_at_price)}
            </span>
          )}
          {discount && discount >= 10 && (
            <span className="rounded bg-destructive px-2 py-1 text-sm font-medium text-destructive-foreground">
              -{discount}% OFF
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          ou 12x de {formatCurrency(product.price / 12)} sem juros
        </p>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {product.is_buy_one_get_two && (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            Leve 2 Pague 1
          </span>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <span className="rounded-full bg-warning/10 px-3 py-1 text-sm font-medium text-warning-foreground">
            Últimas {product.stock} unidades
          </span>
        )}
      </div>

      {/* Quantity Selector */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Quantidade</label>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-md border">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-r-none"
              onClick={decrementQuantity}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
              <span className="sr-only">Diminuir quantidade</span>
            </Button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-l-none"
              onClick={incrementQuantity}
              disabled={quantity >= maxQuantity}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Aumentar quantidade</span>
            </Button>
          </div>
          <span className="text-sm text-muted-foreground">
            {product.stock} disponíveis
          </span>
        </div>
      </div>

      {/* Add to Cart Button */}
      <Button
        size="lg"
        className="w-full text-base"
        onClick={handleAddToCart}
        disabled={isOutOfStock || isAdding}
      >
        {isAdding ? (
          <>
            <Check className="mr-2 h-5 w-5" />
            Adicionado ao carrinho
          </>
        ) : isOutOfStock ? (
          'Produto esgotado'
        ) : (
          <>
            <ShoppingBag className="mr-2 h-5 w-5" />
            Adicionar ao carrinho
          </>
        )}
      </Button>

      {/* Benefits */}
      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <Truck className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium">Frete Grátis</p>
            <p className="text-xs text-muted-foreground">
              Em compras acima de {formatCurrency(SHIPPING_CONFIG.freeShippingThreshold)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium">Compra Segura</p>
            <p className="text-xs text-muted-foreground">
              Pagamento 100% protegido
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium">Troca Fácil</p>
            <p className="text-xs text-muted-foreground">
              Até 30 dias após o recebimento
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
