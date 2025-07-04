/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  // Optimizaciones de performance para Turbopack
  experimental: {
    optimizeCss: true,
    // NO usar modularizeImports con Turbopack
  },
  
  // Configuración de compilación
  compiler: {
    // Remover console logs en producción
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Configuración de imágenes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Configuración de transpilación
  transpilePackages: ['lucide-react'],
}

module.exports = nextConfig