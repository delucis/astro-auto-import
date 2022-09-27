import { defineConfig } from 'astro/config';
import AutoImport from 'astro-auto-import';

// https://astro.build/config
export default defineConfig({
  legacy: {
    astroFlavoredMarkdown: true,
  },
  integrations: [
    AutoImport({
      imports: [
        './src/components/A.astro',
        {
          './src/components/B.astro': [['default', 'B']],
          'astro-embed': ['Tweet'],
        },
      ],
    }),
  ],
});
