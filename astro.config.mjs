import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://liang.today',
  output: 'static',
  vite: {
    server: {
      proxy: {
        // Development-only, public GET; deployed pages call the public API directly.
        '/__liangxiang_live_snapshot': {
          target: 'https://api.liang.today', changeOrigin: true,
          rewrite: () => '/v1/snapshot',
          headers: { 'x-liangxiang-liangzi-policy': 'liangzi-v0.2-25-50-70-85-95' },
        },
      },
    },
  },
  integrations: [sitemap({ filter: page => !page.endsWith('/social-card/') })],
})
