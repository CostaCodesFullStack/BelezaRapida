import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { STORE_CONFIG } from '@/lib/constants'
import { Mail, CheckCircle } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">Conta criada com sucesso!</CardTitle>
          <CardDescription className="text-base">
            Enviamos um email de confirmação para você.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg bg-muted p-4 text-left">
            <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground">
              Por favor, verifique sua caixa de entrada e clique no link de confirmação para ativar sua conta.
            </p>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Não recebeu o email? Verifique sua pasta de spam ou lixo eletrônico.
          </p>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link href="/auth/login">Ir para o login</Link>
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
  title: `Conta criada | ${STORE_CONFIG.name}`,
}
