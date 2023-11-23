# astro-auto-import

This an Astro integration that allows you to auto-import components or other modules and access them in MDX files without importing them.

## Installation

```shell
npm i astro-auto-import
```

If you aren’t already using MDX, you’ll need to add it too:

```shell
npx astro add mdx
```

## Usage

Import the integration and add it to your `astro.config.*` file:

```js
import { defineConfig } from 'astro/config';
import AutoImport from 'astro-auto-import';
import mdx from '@astrojs/mdx';

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

          // Import all named exports from a module as a namespace
          // generates:
          // import * as Components from './src/components';
          './src/components': 'Components',
        },
      ],
    }),

    // Make sure the MDX integration is included AFTER astro-auto-import
    mdx(),
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
imports: ['./src/components/A.astro', './src/components/react/ReactComponent.tsx'];
```

The above config will import `A` and `ReactComponent` respectively, so they could be used as `<A />` or `<ReactComponent />`.

###### Equivalent to

```js
import A from './src/components/A.astro';
import ReactComponent from './src/components/react/ReactComponent.tsx';
```

##### Named exports

For script modules or component frameworks that can use named exports, you can pass an object mapping the module to the names you want to import.

```js
imports: [
  {
    'astro-embed': ['Twitter', 'YouTube'],
  },
];
```

This config will import both the `Twitter` and `YouTube` components from the `astro-embed` package.

###### Equivalent to

```js
import { Twitter, YouTube } from 'astro-embed';
```

#### Import aliasing

In some cases you may want to alias a default or named export to a different name either for convenience or to avoid conflicts. In this case instead of passing strings, you can pass a tuple of `['original-name', 'alias']`.

```js
imports: [
  {
    './src/components/B.astro': [['default', 'RenamedB']],
  },
];
```

This config will import the Astro component in `src/components/B.astro` but make it available as `<RenamedB />`.

###### Equivalent to

```js
import { default as RenamedB } from './src/components/B.astro';
```

#### Namespace import

If you want to import all the named exports in a file to a namespace, you can pass a string to set the namespace to import to:

```js
imports: [
  {
    './src/components/index': 'Components',
  },
];
```

This config would import all the components in an index file, making them available as `<Components.A />`, `<Components.B />` etc.

###### Equivalent to

```js
import * as Components from './src/components/index';
```

## License

MIT
