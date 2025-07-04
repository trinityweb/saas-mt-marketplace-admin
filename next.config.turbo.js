/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  // Optimizaciones de performance para Turbopack
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      '@/components/shared-ui',
      'lucide-react',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
    ],
    // Turbopack específico
    turbo: {
      resolveAlias: {
        '@/shared-ui': '@/components/shared-ui',
      },
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Configuración de compilación
  compiler: {
    // Remover console logs en producción
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Optimizar el módulo de resolución
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
    },
    '@/components/shared-ui': {
      transform: '@/components/shared-ui/{{member}}',
    },
  },
}

module.exports = nextConfig