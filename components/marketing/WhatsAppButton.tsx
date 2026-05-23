'use client'

import { STORE_CONFIG } from '@/lib/constants'
import { MessageCircle } from 'lucide-react'

type WhatsAppButtonProps = {
  message?: string
}

export function WhatsAppButton({
  message = 'Olá! Gostaria de tirar uma dúvida sobre os produtos.',
}: WhatsAppButtonProps) {
  const encoded = encodeURIComponent(message)
  const href = `https://wa.me/${STORE_CONFIG.whatsapp}?text=${encoded}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale conosco pelo WhatsApp"
      className="fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
    >
      {/* Ícone SVG oficial do WhatsApp para fidelidade visual */}
      <svg
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-7 fill-white"
        aria-hidden="true"
      >
        <path d="M16.004 2C8.28 2 2 8.28 2 16.003c0 2.478.652 4.8 1.787 6.813L2 30l7.393-1.773A13.93 13.93 0 0 0 16.004 30C23.72 30 30 23.719 30 16.003 30 8.28 23.72 2 16.004 2zm0 25.5a11.43 11.43 0 0 1-5.83-1.596l-.42-.249-4.39 1.051 1.082-4.269-.274-.44A11.44 11.44 0 0 1 4.5 16.003C4.5 9.659 9.659 4.5 16.004 4.5c6.342 0 11.498 5.16 11.498 11.503 0 6.343-5.156 11.497-11.498 11.497zm6.325-8.603c-.347-.174-2.054-1.014-2.374-1.13-.318-.116-.55-.174-.78.173-.23.346-.893 1.13-1.096 1.36-.202.232-.404.26-.75.087-.347-.174-1.464-.54-2.79-1.72-1.03-.918-1.727-2.05-1.93-2.397-.202-.346-.022-.533.153-.705.156-.155.347-.405.52-.607.173-.201.23-.346.347-.578.116-.231.058-.434-.03-.607-.087-.174-.78-1.882-1.07-2.577-.28-.678-.567-.587-.78-.597l-.664-.011c-.23 0-.607.087-.924.434-.318.346-1.21 1.183-1.21 2.88 0 1.7 1.24 3.342 1.412 3.573.173.231 2.44 3.726 5.911 5.225.826.357 1.47.57 1.972.73.829.263 1.584.226 2.18.137.665-.1 2.054-.84 2.344-1.651.29-.811.29-1.507.203-1.651-.087-.144-.318-.23-.665-.404z" />
      </svg>
    </a>
  )
}
