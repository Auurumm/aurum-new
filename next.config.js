/** @type {import('next').NextConfig} */
const nextConfig = {
    // Vercel 배포 최적화 설정
    experimental: {
      optimizeCss: true, // CSS 최적화 활성화
      scrollRestoration: true, // 스크롤 복원 최적화
    },
  
    // 이미지 최적화 설정
    images: {
      domains: ['localhost'],
      formats: ['image/webp', 'image/avif'],
      minimumCacheTTL: 60,
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },
  
    // 컴파일러 최적화
    compiler: {
      removeConsole: process.env.NODE_ENV === 'production',
    },
  
    // 정적 생성 최적화
    trailingSlash: false,
    
    // 헤더 설정 (CSS/JS 캐싱 최적화)
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'X-Frame-Options',
              value: 'DENY',
            },
            {
              key: 'Referrer-Policy',
              value: 'strict-origin-when-cross-origin',
            },
          ],
        },
        {
          source: '/(.*)\\.(css|js)$',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
      ]
    },
  
    // 웹팩 설정 최적화
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      // CSS 모듈 최적화
      config.module.rules.push({
        test: /\.css$/,
        use: [
          defaultLoaders.babel,
          {
            loader: 'css-loader',
            options: {
              modules: false,
              importLoaders: 1,
            },
          },
        ],
      });
  
      // 번들 사이즈 최적화
      if (!dev && !isServer) {
        config.optimization.splitChunks = {
          chunks: 'all',
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
            },
          },
        };
      }
  
      return config;
    },
  
    // 환경변수 설정
    env: {
      CUSTOM_KEY: process.env.CUSTOM_KEY,
    },
  
    // 리다이렉트 설정
    async redirects() {
      return [];
    },
  
    // 재작성 설정
    async rewrites() {
      return [];
    },
  
    // PWA 설정 (필요시)
    // pwa: {
    //   dest: 'public',
    //   register: true,
    //   skipWaiting: true,
    // },
  };
  
  module.exports = nextConfig;