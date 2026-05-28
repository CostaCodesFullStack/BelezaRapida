import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // Define a URL base da loja
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/', 
        '/admin/', 
        '/minha-conta/', 
        '/checkout/', 
        '/carrinho'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
