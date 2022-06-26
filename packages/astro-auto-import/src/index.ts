import type { AstroIntegration } from 'astro';
import { parse, resolve } from 'node:path';

export default function AutoImport({
  imports,
}: {
  imports: string[];
}): AstroIntegration {
  return {
    name: 'auto-import',
    hooks: {
      'astro:config:setup': ({ injectScript }) => {
        const getComponentName = (path: string) =>
          parse(path).name.replaceAll(/[^\w\d]/g, '');

        const script = [
          ...imports.map(
            (i) => `import ${getComponentName(i)} from '${resolve(i)}';`
          ),
          ...imports.map(
            (i) => `global.${getComponentName(i)} = ${getComponentName(i)};`
          ),
        ].join('\n');

        injectScript('page-ssr', script);
      },
    },
  };
}
