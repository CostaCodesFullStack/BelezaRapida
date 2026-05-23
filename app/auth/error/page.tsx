import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { STORE_CONFIG } from '@/lib/constants'
import { AlertTriangle } from 'lucide-react'

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; error_description?: string }>
}) {
  return (
    <AuthErrorContent searchParams={searchParams} />
  )
}

async function AuthErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; error_description?: string }>
}) {
  const { error, error_description } = await searchParams
  
  const errorMessages: Record<string, string> = {
    'access_denied': 'Acesso negado. Por favor, tente novamente.',
    'invalid_request': 'Requisição inválida. Por favor, tente novamente.',
    'unauthorized_client': 'Cliente não autorizado.',
    'unsupported_response_type': 'Tipo de resposta não suportado.',
    'server_error': 'Erro no servidor. Por favor, tente novamente mais tarde.',
    'temporarily_unavailable': 'Serviço temporariamente indisponível.',
  }

  const displayError = error_description || errorMessages[error || ''] || 'Ocorreu um erro durante a autenticação.'

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">Erro na autenticação</CardTitle>
          <CardDescription className="text-base">
            Não foi possível completar a autenticação.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-lg bg-destructive/5 p-4 text-left">
            <p className="text-sm text-destructive">
              {displayError}
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link href="/auth/login">Tentar novamente</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Voltar para a loja</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export const metadata = {
  title: `Erro | ${STORE_CONFIG.name}`,
}
