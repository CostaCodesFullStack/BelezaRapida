'use client'

import { useEffect, useState, useRef } from 'react'
import { ShoppingBag, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type Notification = {
  name: string
  city: string
  product: string
  time: string
}

const NOTIFICATIONS: Notification[] = [
  { name: 'Ana', city: 'São Paulo', product: 'Sérum Vitamina C', time: '2 minutos' },
  { name: 'Carla', city: 'Rio de Janeiro', product: 'Kit Skincare Noturno', time: '5 minutos' },
  { name: 'Fernanda', city: 'Belo Horizonte', product: 'Protetor Solar FPS 70', time: '7 minutos' },
  { name: 'Julia', city: 'Curitiba', product: 'Óleo de Rosa Mosqueta', time: '10 minutos' },
  { name: 'Beatriz', city: 'Florianópolis', product: 'Máscara Capilar Argan', time: '3 minutos' },
  { name: 'Larissa', city: 'Porto Alegre', product: 'Creme Hidratante Corporal', time: '1 minuto' },
  { name: 'Patricia', city: 'Fortaleza', product: 'Tônico Facial Antienvelhecimento', time: '8 minutos' },
  { name: 'Mariana', city: 'Recife', product: 'Esfoliante de Açúcar', time: '4 minutos' },
]

const SHOW_INTERVAL = 8000  // ms entre notificações
const DISPLAY_DURATION = 5000  // ms que fica visível

export function PurchaseNotification() {
  const [current, setCurrent] = useState<Notification | null>(null)
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const indexRef = useRef(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showNext = () => {
    const notification = NOTIFICATIONS[indexRef.current % NOTIFICATIONS.length]
    indexRef.current += 1
    setCurrent(notification)
    setVisible(true)
    setDismissed(false)

    // Esconde após DISPLAY_DURATION
    timeoutRef.current = setTimeout(() => {
      setVisible(false)
    }, DISPLAY_DURATION)
  }

  useEffect(() => {
    // Primeira exibição após 4s
    const firstTimer = setTimeout(() => {
      showNext()
    }, 4000)

    // Exibições subsequentes
    const intervalTimer = setInterval(() => {
      showNext()
    }, SHOW_INTERVAL + DISPLAY_DURATION)

    return () => {
      clearTimeout(firstTimer)
      clearInterval(intervalTimer)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!current || dismissed) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'fixed bottom-6 left-4 z-50 flex max-w-[300px] items-start gap-3 rounded-xl border bg-card p-4 shadow-lg transition-all duration-300',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none',
      )}
    >
      <div className="flex-shrink-0 rounded-full bg-primary/10 p-2">
        <ShoppingBag className="h-4 w-4 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground leading-snug">
          <span className="text-primary">{current.name}</span> de {current.city}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
          comprou{' '}
          <span className="font-medium text-foreground">{current.product}</span>{' '}
          há {current.time}
        </p>
      </div>

      <button
        onClick={() => {
          setVisible(false)
          setDismissed(true)
        }}
        aria-label="Fechar notificação"
        className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
