'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Star } from 'lucide-react'
import type { Review } from '@/types/database'
import toast from 'react-hot-toast'

interface ReviewFormProps {
  productId: string
  onReviewAdded: (review: Review) => void
}

export function ReviewForm({ productId, onReviewAdded }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [authorName, setAuthorName] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast.error('Por favor, selecione uma nota')
      return
    }
    
    if (!authorName.trim()) {
      toast.error('Por favor, informe seu nome')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          author_name: authorName.trim(),
          rating,
          title: title.trim() || null,
          content: content.trim() || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao enviar avaliação')
      }

      const { review } = await response.json()
      
      onReviewAdded(review)
      
      // Reset form
      setRating(0)
      setAuthorName('')
      setTitle('')
      setContent('')
      
      toast.success('Avaliação enviada com sucesso! Ela será exibida após aprovação.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar avaliação')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-lg border p-6">
      <h3 className="mb-4 text-lg font-semibold">Deixe sua avaliação</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div className="space-y-2">
          <Label>Nota *</Label>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                className="p-1 transition-transform hover:scale-110"
                onMouseEnter={() => setHoveredRating(i + 1)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(i + 1)}
              >
                <Star
                  className={`h-6 w-6 ${
                    i < (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground/30'
                  }`}
                />
                <span className="sr-only">{i + 1} estrela{i > 0 ? 's' : ''}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Author Name */}
        <div className="space-y-2">
          <Label htmlFor="author_name">Seu nome *</Label>
          <Input
            id="author_name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Como você quer ser identificado"
            required
          />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="review_title">Título (opcional)</Label>
          <Input
            id="review_title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Resuma sua experiência"
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor="review_content">Comentário (opcional)</Label>
          <Textarea
            id="review_content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Conte mais sobre sua experiência com o produto"
            rows={4}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : 'Enviar avaliação'}
        </Button>

        <p className="text-xs text-muted-foreground">
          * Campos obrigatórios. Sua avaliação será publicada após aprovação.
        </p>
      </form>
    </div>
  )
}
