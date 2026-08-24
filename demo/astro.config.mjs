import { defineConfig } from 'astro/config';
import AutoImport from 'astro-auto-import';
import mdx from '@astrojs/mdx';

// Astro Markdown configuration.
// Use each Astro version’s default processor unless CI opts into unified.
// The import is dynamic because CI uninstalls the package on the Astro 5 leg.
/** @type {import('astro').AstroUserConfig['markdown']} */
const markdown = {};
if (process.env.MARKDOWN_PROCESSOR === 'unified') {
  const { unified } = await import('@astrojs/markdown-remark');
  markdown.processor = unified();
}

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
