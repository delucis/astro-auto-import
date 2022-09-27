# astro-auto-import

This an Astro integration that allows you to auto-import components or other modules and access them in any page. Mainly useful to make components available in Markdown files without importing them in `setup`.

> **Note**
> Using components in Markdown with Astro v1 requires setting [the `legacy.astroFlavoredMarkdown` flag](https://docs.astro.build/en/reference/configuration-reference/#legacyastroflavoredmarkdown) in your config.

## Installation

```shell
npm i astro-auto-import
```

## Usage

Import the integration and add it to your `astro.config.*` file:

```js
import { defineConfig } from 'astro/config';
import AutoImport from 'astro-auto-import';

export default defineConfig({
  integrations: [
    AutoImport({
      imports: [
        // Import a component’s default export
        // generates:
        // import A from './src/components/A.astro';
        './src/components/A.astro',

        {
          // Explicitly alias a default export
          // generates:
          // import { default as B } from './src/components/B.astro';
          './src/components/B.astro': [['default', 'B']],

          // Import a module’s named exports
          // generates:
          // import { Tweet, YouTube } from 'astro-embed';
          'astro-embed': ['Tweet', 'YouTube'],
        },
      ],
    }),
  ],
});
```

### Options

#### `imports`

**Type**: `(string | Record<string, (string | [string, string])[]>)[]`

An array of items that configure what files are imported and how.

##### Default exports

For Astro components or other files that have a default export, the easiest option is to provide their path and they will be imported with a name based on the file name.

```js
imports: [
  './src/components/A.astro',
  './src/components/react/ReactComponent.tsx',
];
```

The above config would import `A` and `ReactComponent` respectively, so they could be used as `<A />` or `<ReactComponent />`.

##### Named exports

For script modules or component frameworks that can used named exports, you can pass an object mapping the module to the names you want to import.

```js
imports: [
  {
    'astro-embed': ['Twitter', 'YouTube'],
  },
];
```

This config would import both the `Twitter` and `YouTube` components from the `astro-embed` package.

#### Import aliasing

In some cases you may want to alias a default or named export to a different name either for convenience or to avoid conflicts. In this case instead of passing strings, you can pass a tuple of `['original-name', 'alias']`.

```js
imports: [
  {
    './src/components/B.astro': [['default', 'RenamedB']],
  },
];
```

This config would import the Astro component in `src/components/B.astro` but make it available as `<RenamedB />`.

### Using with MDX

This integration is compatible with [`@astrojs/mdx`](https://docs.astro.build/en/guides/integrations-guide/mdx/), allowing you to auto-import into `.mdx` files.

For this to work, make sure you add the auto-import integration **_before_** the MDX integration in your `integrations` array.

## License

MIT
