import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/api\.cohere\.ai\//,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'cohere-api-cache',
                            networkTimeoutSeconds: 10,
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 60 * 24 // 1 day
                            }
                        }
                    }
                ]
            },
            manifest: {
                name: '이력서 채용공고 매칭 분석',
                short_name: 'Resume Matcher',
                description: 'AI 기반 이력서와 채용공고 매칭 분석 플랫폼',
                theme_color: '#3b82f6',
                background_color: '#ffffff',
                display: 'standalone',
                icons: [
                    {
                        src: 'icon-192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'icon-512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            }
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
    optimizeDeps: {
        exclude: ['pdfjs-dist']
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    pdf: ['pdfjs-dist'],
                    nlp: ['natural'],
                    ui: ['@radix-ui/react-dialog', '@radix-ui/react-progress', 'framer-motion']
                }
            }
        },
        chunkSizeWarningLimit: 1000
    },
    server: {
        port: 3000,
        open: true
    }
});
