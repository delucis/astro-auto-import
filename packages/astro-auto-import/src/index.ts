import type { AstroIntegration } from 'astro';
import { parse, resolve } from 'node:path';

const resolveModulePath = (path: string) => {
  // Resolve relative paths
  if (path.startsWith('.')) return resolve(path);
  // Don’t resolve other paths (e.g. npm modules)
  return path;
};

type NamedImportConfig = string | [from: string, as: string];
type ImportsConfig = (string | Record<string, NamedImportConfig[]>)[];

interface AutoImportConfig {
  imports: ImportsConfig;
}

/**
 * Use a filename to generate a default import name.
 * @example
 * getDefaultImportName('/path/to/cool-component.astro');
 * // => coolcomponent
 */
function getDefaultImportName(path: string): string {
  return parse(path).name.replaceAll(/[^\w\d]/g, '');
}

/**
 * Create an import statement.
 * @param imported Stuff to import (e.g. `Thing` or `{ Named }`)
 * @param module Module to import from (e.g. `module-thing`)
 */
function formatImport(imported: string, module: string): string {
  return `import ${imported} from '${module}';`;
}

/** Create a statement assigning a variable to the global object. */
function formatExposure(name: string) {
  return `globalThis.${name} = ${name};`;
}

/** Get the parts for a named import statement from config. */
function formatNamedImports(
  namedImport: NamedImportConfig[]
): [importString: string, exposures: string[]] {
  const imports: string[] = [];
  const exposedNames: string[] = [];

  for (const imp of namedImport) {
    if (typeof imp === 'string') {
      imports.push(imp);
      exposedNames.push(imp);
    } else {
      const [from, as] = imp;
      imports.push(`${from} as ${as}`);
      exposedNames.push(as);
    }
  }

  return [`{ ${imports.join(', ')} }`, exposedNames.map(formatExposure)];
}

/** Generate a JavaScript string from a full imports config array. */
function generateScript(imports: ImportsConfig) {
  const importsBlock = [];
  const exposureBlock = [];

  for (const option of imports) {
    if (typeof option === 'string') {
      importsBlock.push(
        formatImport(getDefaultImportName(option), resolveModulePath(option))
      );
      exposureBlock.push(formatExposure(getDefaultImportName(option)));
    } else {
      for (const path in option) {
        const namedImports = option[path];
        const [importString, exposures] = formatNamedImports(namedImports);
        importsBlock.push(formatImport(importString, resolveModulePath(path)));
        exposureBlock.push(...exposures);
      }
    }
  }

  return [...importsBlock, ...exposureBlock].join('\n');
}

export default function AutoImport({
  imports,
}: AutoImportConfig): AstroIntegration {
  return {
    name: 'auto-import',
    hooks: {
      'astro:config:setup': ({ injectScript }) => {
        injectScript('page-ssr', generateScript(imports));
      },
    },
  };
}
