import type { AstroIntegration } from 'astro';
import { parse, resolve } from 'node:path';

const resolveModulePath = (path: string) => {
  // Resolve relative paths
  if (path.startsWith('.')) return resolve(path);
  // Don’t resolve other paths (e.g. npm modules)
  return path;
}

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
            (i) => `import ${getComponentName(i)} from '${resolveModulePath(i)}';`
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
