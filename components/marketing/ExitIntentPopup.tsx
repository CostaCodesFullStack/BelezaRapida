'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Gift, X, Sparkles, Copy, Check } from 'lucide-react'

const COUPON_CODE = 'FICA10'
const STORAGE_KEY = 'exit_intent_shown'

export function ExitIntentPopup() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    // Só dispara quando o cursor sai pelo topo da janela
    if (e.clientY <= 5) {
      const alreadyShown = sessionStorage.getItem(STORAGE_KEY)
      if (!alreadyShown) {
        setOpen(true)
        sessionStorage.setItem(STORAGE_KEY, 'true')
      }
    }
  }, [])

  useEffect(() => {
    document.documentElement.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [handleMouseLeave])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(COUPON_CODE)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback silencioso
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden gap-0">
        {/* Faixa superior decorativa */}
        <div className="h-2 w-full bg-primary" />

        <div className="px-8 py-8 text-center">
          {/* Ícone */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Gift className="h-8 w-8 text-primary" />
          </div>

          <DialogTitle className="text-2xl font-bold text-foreground text-balance leading-tight">
            Espera! Temos um presente para você
          </DialogTitle>

          <p className="mt-3 text-muted-foreground leading-relaxed">
            Antes de ir embora, use o cupom abaixo e ganhe{' '}
            <strong className="text-primary">10% de desconto</strong> em toda a
            sua compra.
          </p>

          {/* Cupom */}
          <div className="mt-6 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-5">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-mono text-2xl font-bold tracking-widest text-primary">
                {COUPON_CODE}
              </span>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              10% de desconto em qualquer pedido
            </p>
          </div>

          {/* Ações */}
          <div className="mt-6 flex flex-col gap-3">
            <Button className="w-full" size="lg" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Cupom copiado!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar cupom
                </>
              )}
            </Button>

            <button
              onClick={() => setOpen(false)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
            >
              Não, obrigada. Prefiro pagar o valor cheio.
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
