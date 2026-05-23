# 🛍️ Next.js E-Commerce Platform

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2-38B2AC?logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth-3ECF8E?logo=supabase&logoColor=white)

## 📖 Sobre o Projeto

Plataforma de e-commerce completa, moderna e de alta performance desenvolvida com **Next.js 16**, **React 19** e **Tailwind CSS v4**. O sistema oferece uma experiência de compra fluida com painel de administração integrado, autenticação segura via Supabase, checkout otimizado através da integração com Yampi e cálculo de frete via Melhor Envio. Tudo suportado por um banco de dados relacional (PostgreSQL) gerenciado pelo Prisma ORM.

## ✨ Features (Principais Funcionalidades)

* **Autenticação e Perfis**: Login seguro via Supabase Auth, controle de acesso baseado em funções (Customer e Admin) e gestão de múltiplos endereços por usuário.
* **Catálogo de Produtos Inteligente**: Gerenciamento completo de produtos (categorias, estoque, promoções como "Compre 1 Leve 2", produtos em destaque e galeria de imagens).
* **Checkout Integrado e Logística**: Integração nativa com **Yampi** para pagamentos otimizados e **Melhor Envio** para cálculo de frete inteligente.
* **Gestão de Pedidos e Cupons**: Acompanhamento de status de pedidos em tempo real, sistema avançado de cupons (desconto fixo ou percentual, com limites de uso e validade).
* **Avaliações (Reviews)**: Sistema de avaliações de produtos por clientes com notas (1-5), comentários em texto e imagens (com sistema de aprovação por moderadores).
* **Painel Administrativo (`/admin`)**: Área exclusiva para gestão de catálogo, pedidos, cupons, e acompanhamento de métricas.

## 💻 Tecnologias

As seguintes ferramentas foram usadas na construção do projeto:

| Categoria | Tecnologias |
| :--- | :--- |
| **Frontend / Core** | [Next.js 16](https://nextjs.org/), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/) |
| **Estilização e UI** | [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Lucide Icons](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/) / Animate |
| **Gerenciamento de Estado** | [Zustand](https://zustand-demo.pmnd.rs/), [React Query](https://tanstack.com/query/v5) |
| **Backend / Database** | [Prisma ORM](https://www.prisma.io/), [PostgreSQL](https://www.postgresql.org/) |
| **Autenticação** | [Supabase](https://supabase.com/) |
| **Integrações** | [Yampi](https://www.yampi.com.br/) (Checkout), [Melhor Envio](https://melhorenvio.com.br/) (Frete), [Resend](https://resend.com/) (E-mails) |
| **Formulários / Validação** | [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) |

## 🚀 Getting Started (Como começar)

Siga as instruções abaixo para configurar e rodar o projeto localmente.

### Pré-requisitos

Certifique-se de ter os seguintes itens instalados no seu ambiente de desenvolvimento:
* **Node.js** (v18.17 ou superior recomendado para Next.js)
* **pnpm** (Gerenciador de pacotes utilizado pelo projeto)
* **PostgreSQL** (Rodando localmente ou um serviço na nuvem)
* Uma conta no **Supabase** (para Auth e, opcionalmente, DB)

### 1. Clonando o Repositório

```bash
git clone https://github.com/CostaCodesFullStack/BelezaRapida.git
cd ecommerce
```

### 2. Instalando Dependências

Recomenda-se o uso do `pnpm`, conforme definido no `pnpm-lock.yaml`:

```bash
pnpm install
```

### 3. Configuração de Variáveis de Ambiente

Renomeie o arquivo `.env.example` para `.env` e preencha com suas chaves de API reais:

```bash
cp .env.example .env
```

Abra o arquivo `.env` e configure (veja o `.env.example` para referência dos serviços exigidos: Supabase, Database (Prisma URL), Yampi, Melhor Envio, Resend, etc).

### 4. Configurando o Banco de Dados (Prisma)

Após configurar a `DATABASE_URL` no `.env`, rode as migrations do Prisma e gere o Client:

```bash
pnpm prisma generate
pnpm prisma db push
# ou se estiver usando migrations:
# pnpm prisma migrate dev
```

### 5. Executando a Aplicação Localmente

Inicie o servidor de desenvolvimento:

```bash
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador para ver o e-commerce funcionando! 
Acesse `/admin` para entrar no painel administrativo.

## 📱 Uso

* **Loja / Vitrine**: Ao acessar a página inicial, os usuários podem navegar por categorias de produtos, adicionar ao carrinho e prosseguir para o fluxo de checkout (que integra com a Yampi).
* **Painel Admin**: Requer um usuário com a role `ADMIN`. Permite visualizar os pedidos mais recentes, configurar cupons promocionais e aprovar reviews pendentes de produtos.

*(Espaço reservado para adicionar screenshots ou GIFs do projeto em funcionamento)*
<!-- Adicione suas imagens aqui usando o formato: ![Descrição da Imagem](/caminho/para/imagem.png) -->

## 🤝 Contribuindo

Contribuições são o que fazem a comunidade open source ser um lugar incrível para aprender, inspirar e criar. Qualquer contribuição que você fizer será **muito apreciada**.

Se você tem uma sugestão para melhorar este projeto, por favor, faça um fork do repositório e crie um pull request. Você também pode simplesmente abrir uma issue com a tag "enhancement".

1. Faça o Fork do Projeto
2. Crie sua Branch para a Feature (`git checkout -b feature/AmazingFeature`)
3. Faça o Commit das suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Faça o Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

## 📫 Contato

[Seu Nome] - [seu-email@dominio.com](mailto:seu-email@dominio.com) - [Seu LinkedIn](https://www.linkedin.com/in/seu-perfil/)

Link do Projeto: [https://github.com/SeuUsuario/ecommerce](https://github.com/SeuUsuario/ecommerce)
