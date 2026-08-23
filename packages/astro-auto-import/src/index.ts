import { parse as parseJs } from 'acorn';
import type { AstroIntegration } from 'astro';
import type { MdxjsEsm } from 'mdast-util-mdx';
import { parse, resolve } from 'node:path';
import type { MdastPluginDefinition } from 'satteri';
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

/** Astro 5 has no `markdown.processor`, so read it structurally instead of from Astro’s types. */
interface MarkdownConfig {
  processor?: { name: string; options: { mdastPlugins: MdastPluginDefinition[] } };
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

/** Get the parts for a named import statement from config. */
function formatNamedImports(namedImport: NamedImportConfig[]): string {
  const imports: string[] = [];
  for (const imp of namedImport) {
    if (typeof imp === 'string') {
      imports.push(imp);
    } else {
      const [from, as] = imp;
      imports.push(`${from} as ${as}`);
    }
  }
  return `{ ${imports.join(', ')} }`;
}

/** Generate imports from a full imports config array. */
function processImportsConfig(config: ImportsConfig) {
  const imports = [];
  for (const option of config) {
    if (typeof option === 'string') {
      imports.push(formatImport(getDefaultImportName(option), resolveModulePath(option)));
    } else {
      for (const path in option) {
        const namedImportsOrNamespace = option[path];
        if (typeof namedImportsOrNamespace === 'string') {
          imports.push(formatImport(`* as ${namedImportsOrNamespace}`, resolveModulePath(path)));
        } else {
          const importString = formatNamedImports(namedImportsOrNamespace);
          imports.push(formatImport(importString, resolveModulePath(path)));
        }
      }
    }
  }
  return imports;
}

/** Get an MDX node representing a block of imports based on user config. */
function generateImportsNode(config: ImportsConfig): MdxjsEsm {
  const imports = processImportsConfig(config);
  const js = imports.join('\n');
  return {
    type: 'mdxjsEsm',
    value: '',
    data: {
      estree: {
        // @ts-expect-error - Latest `acorn` types don’t align with MDX types.
        body: [],
        ...parseJs(js, { ecmaVersion: 'latest', sourceType: 'module' }),
        type: 'Program',
        sourceType: 'module',
      },
    },
  };
}

/** Get a Sätteri mdast plugin that injects a block of imports based on user config. */
function generateSatteriPlugin(config: ImportsConfig): MdastPluginDefinition {
  // Sätteri parses the import statements itself, so no estree is needed.
  const value = processImportsConfig(config).join('\n');
  return {
    name: 'auto-import',
    before(root, ctx) {
      // Plugins also run for `.md`, which can’t use ESM imports.
      if (ctx.sourceFormat !== 'mdx') return;
      // Imports go after frontmatter, which Sätteri parses as a root child.
      const firstBlock = root.children.find(
        (child) => child.type !== 'yaml' && child.type !== 'toml',
      );
      if (!firstBlock) return;
      ctx.insertBefore(firstBlock, { type: 'mdxjsEsm', value });
    },
  };
}

export default function AutoImport(integrationConfig: AutoImportConfig): AstroIntegration {
  return {
    name: 'auto-import',
    hooks: {
      'astro:config:setup': ({ config, updateConfig }) => {
        const thisIndex = config.integrations.findIndex((i) => i.name === 'auto-import');
        const mdxIndex = config.integrations.findIndex((i) => i.name === '@astrojs/mdx');

        // Skip adding a Markdown plug-in if MDX is not being used.
        if (mdxIndex === -1) return;

        const processor = (config.markdown as MarkdownConfig | undefined)?.processor;

        // Sätteri reads `processor.options` lazily, so integration order doesn’t matter here.
        if (processor?.name === 'satteri') {
          processor.options.mdastPlugins.push(generateSatteriPlugin(integrationConfig.imports));
          return;
        }

        if (processor && processor.name !== 'unified') {
          throw new Error(
            '[auto-import] ⚠️ Found incompatible Markdown processor.\n' +
              '              Only the unified and Sätteri processors are supported.\n' +
              '              See https://docs.astro.build/en/guides/markdown-content/#markdown-processors',
          );
        }

        // Check MDX integration is initialized after auto-import.
        if (mdxIndex < thisIndex) {
          console.warn(
            '[auto-import] ⚠️ @astrojs/mdx initialized BEFORE astro-auto-import.\n' +
              '              Auto imports in .mdx files won’t work!\n' +
              '              Move the MDX integration after auto-import in your integrations array in astro.config.',
          );
        }

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
