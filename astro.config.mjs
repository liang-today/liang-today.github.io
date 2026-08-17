import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://liang.today',
  output: 'static',
  integrations: [sitemap({ filter: page => !page.endsWith('/social-card/') })],
})
