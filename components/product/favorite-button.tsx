'use client'

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toggleFavoriteAction } from '@/actions/favorites'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  productId: string
  isInitiallyFavorited?: boolean
  className?: string
}

export function FavoriteButton({ 
  productId, 
  isInitiallyFavorited = false, 
  className 
}: FavoriteButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [isFavorited, setIsFavorited] = useState(isInitiallyFavorited)

  const handleToggle = (e: React.MouseEvent) => {
    // Evita que o clique no botão dispare a navegação do Link no ProductCard
    e.preventDefault()
    e.stopPropagation()

    // Optimistic UI Update: atualiza a interface imediatamente
    const previousState = isFavorited
    setIsFavorited(!previousState)

    startTransition(async () => {
      const result = await toggleFavoriteAction(productId)
      
      if (!result.success) {
        // Reverte em caso de erro na Server Action
        setIsFavorited(previousState)
        toast.error(result.error || 'Erro ao atualizar favorito.')
      } else {
        if (result.isFavorited) {
          toast.success('Adicionado aos favoritos!', { icon: '❤️' })
        } else {
          toast.success('Removido dos favoritos.')
        }
      }
    })
  }

  return (
    <Button
      variant="secondary"
      size="icon"
      className={cn(
        "rounded-full shadow-sm hover:scale-110 transition-transform h-8 w-8 bg-background/90 backdrop-blur-sm hover:bg-background",
        isPending && "opacity-70 pointer-events-none scale-95",
        className
      )}
      onClick={handleToggle}
      aria-label={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      title={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          isFavorited 
            ? "fill-destructive text-destructive" 
            : "text-muted-foreground hover:text-foreground"
        )}
      />
    </Button>
  )
}
