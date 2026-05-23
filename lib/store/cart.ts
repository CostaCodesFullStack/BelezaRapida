'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product, Coupon, ShippingOption } from '@/types/database'

interface CartStore {
  items: CartItem[]
  coupon: Coupon | null
  shipping: ShippingOption | null
  
  // Actions
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  setCoupon: (coupon: Coupon | null) => void
  setShipping: (shipping: ShippingOption | null) => void
  
  // Computed values (getters)
  getItemCount: () => number
  getSubtotal: () => number
  getDiscount: () => number
  getShippingCost: () => number
  getTotal: () => number
  getItemByProductId: (productId: string) => CartItem | undefined
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      shipping: null,

      addItem: (product: Product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id
          )

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            }
          }

          return {
            items: [...state.items, { product, quantity }],
          }
        })
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }))
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }))
      },

      clearCart: () => {
        set({ items: [], coupon: null, shipping: null })
      },

      setCoupon: (coupon: Coupon | null) => {
        set({ coupon })
      },

      setShipping: (shipping: ShippingOption | null) => {
        set({ shipping })
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          // Se é "Leve 1 Pague 2", conta apenas metade dos itens para cobrança
          if (item.product.is_buy_one_get_two) {
            const paidQuantity = Math.ceil(item.quantity / 2)
            return total + item.product.price * paidQuantity
          }
          return total + item.product.price * item.quantity
        }, 0)
      },

      getDiscount: () => {
        const { coupon } = get()
        const subtotal = get().getSubtotal()

        if (!coupon) return 0

        // Verifica valor mínimo do pedido
        if (coupon.min_order_value && subtotal < coupon.min_order_value) {
          return 0
        }

        if (coupon.type === 'PERCENTAGE') {
          return subtotal * (coupon.value / 100)
        }

        return Math.min(coupon.value, subtotal)
      },

      getShippingCost: () => {
        return get().shipping?.price ?? 0
      },

      getTotal: () => {
        const subtotal = get().getSubtotal()
        const discount = get().getDiscount()
        const shipping = get().getShippingCost()

        return Math.max(0, subtotal - discount + shipping)
      },

      getItemByProductId: (productId: string) => {
        return get().items.find((item) => item.product.id === productId)
      },
    }),
    {
      name: 'beleza-rapida-cart',
      partialize: (state) => ({
        items: state.items,
        coupon: state.coupon,
        shipping: state.shipping,
      }),
    }
  )
)
