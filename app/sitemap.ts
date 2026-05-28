import { MetadataRoute } from 'next'
import { prisma } from '@/prisma/client'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Define a URL base da loja
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // Rotas estáticas principais
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/produtos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ]

  // Buscar produtos ativos no Prisma
  const products = await prisma.product.findMany({
    where: {
      is_active: true,
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  // Mapear produtos para o formato do Sitemap
  const dynamicRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/produtos/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  // Retornar a junção das rotas estáticas e dinâmicas
  return [...staticRoutes, ...dynamicRoutes]
}
