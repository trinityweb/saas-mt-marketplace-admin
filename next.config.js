/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  // Optimizaciones de performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
    ],
  },
  
  // Configuración de compilación
  compiler: {
    // Remover console logs en producción
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // NO usar modularizeImports con Turbopack - causa problemas
  // modularizeImports: {
  //   'lucide-react': {
  //     transform: 'lucide-react/dist/esm/icons/{{member}}',
  //   },
  // },
  
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
  transpilePackages: ['@/components/shared-ui', 'lucide-react'],
}

module.exports = nextConfig