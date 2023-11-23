import { parse as parseJs } from 'acorn';
import type { AstroIntegration } from 'astro';
import type { MdxjsEsm } from 'mdast-util-mdx';
import { parse, resolve } from 'node:path';
import type { VFile } from 'vfile';

const resolveModulePath = (path: string) => {
  // Resolve relative paths
  if (path.startsWith('.')) return resolve(path);
  // Don’t resolve other paths (e.g. npm modules)
  return path;
};

type NamedImportConfig = string | [from: string, as: string];
type ImportsConfig = (string | Record<string, string | NamedImportConfig[]>)[];

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
  return `import ${imported} from ${JSON.stringify(module)};`;
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

/** Generate imports and exposures from a full imports config array. */
function processImportsConfig(config: ImportsConfig) {
  const imports = [];
  const exposures = [];

  for (const option of config) {
    if (typeof option === 'string') {
      imports.push(formatImport(getDefaultImportName(option), resolveModulePath(option)));
      exposures.push(formatExposure(getDefaultImportName(option)));
    } else {
      for (const path in option) {
        const namedImportsOrNamespace = option[path];
        if (typeof namedImportsOrNamespace === 'string') {
          imports.push(formatImport(`* as ${namedImportsOrNamespace}`, resolveModulePath(path)));
          exposures.push(formatExposure(namedImportsOrNamespace));
        } else {
          const [importString, exposureArray] = formatNamedImports(namedImportsOrNamespace);
          imports.push(formatImport(importString, resolveModulePath(path)));
          exposures.push(...exposureArray);
        }
      }
    }
  }

  return { imports, exposures };
}

/** Get an MDX node representing a block of imports based on user config. */
function generateImportsNode(config: ImportsConfig): MdxjsEsm {
  const { imports } = processImportsConfig(config);
  const js = imports.join('\n');
  return {
    type: 'mdxjsEsm',
    value: '',
    data: {
      estree: {
        body: [],
        ...parseJs(js, { ecmaVersion: 'latest', sourceType: 'module' }),
        type: 'Program',
        sourceType: 'module',
      },
    },
  };
}

export default function AutoImport(integrationConfig: AutoImportConfig): AstroIntegration {
  return {
    name: 'auto-import',
    hooks: {
      'astro:config:setup': ({ config, updateConfig }) => {
        // Check MDX integration is initialized after auto-import.
        const mdxIndex = config.integrations.findIndex((i) => i.name === '@astrojs/mdx');
        const thisIndex = config.integrations.findIndex((i) => i.name === 'auto-import');
        if (mdxIndex >= 0 && mdxIndex < thisIndex) {
          console.warn(
            '[auto-import] ⚠️ @astrojs/mdx initialized BEFORE astro-auto-import.\n' +
              '              Auto imports in .mdx files won’t work!\n' +
              '              Move the MDX integration after auto-import in your integrations array in astro.config.'
          );
        }

        // Skip adding MDX plug-in if MDX is not being used.
        if (mdxIndex === -1) return;

        // Add a remark plugin to inject imports into `.mdx`.
        const importsNode = generateImportsNode(integrationConfig.imports);
        updateConfig({
          markdown: {
            remarkPlugins: [
              function rehypeInjectMdxImports() {
                return function injectMdxImports(tree: { children: any[] }, vfile: VFile) {
                  if (!vfile.basename?.endsWith('.md')) {
                    tree.children.unshift(importsNode);
                  }
                };
              },
            ],
          },
        });
      },
    },
  };
}
