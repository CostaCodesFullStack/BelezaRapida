'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReviewList } from './review-list'
import { ReviewForm } from './review-form'
import type { Product, Review } from '@/types/database'

interface ProductTabsProps {
  product: Product
  reviews: Review[]
}

export function ProductTabs({ product, reviews }: ProductTabsProps) {
  const [localReviews, setLocalReviews] = useState(reviews)

  const handleReviewAdded = (newReview: Review) => {
    // Add the review to the local state (will appear as pending moderation)
    setLocalReviews((prev) => [newReview, ...prev])
  }

  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="w-full justify-start border-b bg-transparent p-0">
        <TabsTrigger
          value="description"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          Descrição
        </TabsTrigger>
        {product.how_to_use && (
          <TabsTrigger
            value="how-to-use"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Como Usar
          </TabsTrigger>
        )}
        <TabsTrigger
          value="reviews"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          Avaliações ({localReviews.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="mt-6">
        <div className="prose prose-gray max-w-none">
          {product.description ? (
            <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          ) : (
            <p className="text-muted-foreground">
              Nenhuma descrição disponível para este produto.
            </p>
          )}
        </div>
      </TabsContent>

      {product.how_to_use && (
        <TabsContent value="how-to-use" className="mt-6">
          <div className="prose prose-gray max-w-none">
            <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
              {product.how_to_use}
            </p>
          </div>
        </TabsContent>
      )}

      <TabsContent value="reviews" className="mt-6">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ReviewList reviews={localReviews} />
          </div>
          <div>
            <ReviewForm 
              productId={product.id} 
              onReviewAdded={handleReviewAdded}
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
