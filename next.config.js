/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    '@supabase/supabase-js',
    'pdf-parse',
    'mammoth'
  ],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000']
    }
  },
  typescript: {
    ignoreBuildErrors: false
  },
  eslint: {
    ignoreDuringBuilds: false
  }
}

module.exports = nextConfig