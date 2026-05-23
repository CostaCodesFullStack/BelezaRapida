import Link from 'next/link'
import { STORE_CONFIG } from '@/lib/constants'
import { CATEGORY_LABELS, type ProductCategory } from '@/types/database'
import { Sparkles, Instagram, Facebook, Mail, Phone } from 'lucide-react'

export function Footer() {
  const categories = Object.entries(CATEGORY_LABELS) as [ProductCategory, string][]

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">{STORE_CONFIG.name}</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {STORE_CONFIG.description}
            </p>
            <div className="flex gap-4">
              {STORE_CONFIG.social.instagram && (
                <a
                  href={STORE_CONFIG.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </a>
              )}
              {STORE_CONFIG.social.facebook && (
                <a
                  href={STORE_CONFIG.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  <Facebook className="h-5 w-5" />
                  <span className="sr-only">Facebook</span>
                </a>
              )}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-4 font-semibold">Categorias</h3>
            <ul className="space-y-2">
              {categories.map(([key, label]) => (
                <li key={key}>
                  <Link
                    href={`/produtos?categoria=${key}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Institutional */}
          <div>
            <h3 className="mb-4 font-semibold">Institucional</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/sobre"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link
                  href="/politica-privacidade"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link
                  href="/termos-uso"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  href="/trocas-devolucoes"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Trocas e Devoluções
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-semibold">Contato</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={`mailto:${STORE_CONFIG.email}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="h-4 w-4" />
                  {STORE_CONFIG.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${STORE_CONFIG.phone.replace(/\D/g, '')}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Phone className="h-4 w-4" />
                  {STORE_CONFIG.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {STORE_CONFIG.name}. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            CNPJ: 00.000.000/0001-00
          </p>
        </div>
      </div>
    </footer>
  )
}
