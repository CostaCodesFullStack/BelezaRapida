/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        // Lembre-se de trocar SEU_PROJETO_ID pelo ID real do seu projeto Supabase!
        hostname: 'xwnoerdfefgpllfmykxl.supabase.co',
        pathname: '/storage/v1/object/public/produtos/**',
      },
    ],
  },
}

export default nextConfig
