import { defineConfig } from 'astro/config';
import AutoImport from 'astro-auto-import';
import mdx from '@astrojs/mdx';

// Astro Markdown configuration. The unified processor is loaded dynamically to support testing
// against Astro 5 in CI where a custom processor is not available.
/** @type {import('astro').AstroUserConfig['markdown']} */
const markdown = {};
try {
  const { unified } = await import('@astrojs/markdown-remark');
  markdown.processor = unified();
} catch (e) {}

// https://astro.build/config
export default defineConfig({
  integrations: [
    AutoImport({
      imports: [
        './src/components/A.astro',
        {
          './src/components/B.astro': [['default', 'B']],
          'astro-embed': ['YouTube'],
          './src/components/barrel.ts': 'Barrel',
        },
      ],
    }),
    mdx(),
  ],
  markdown,
});
