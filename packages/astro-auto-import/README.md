# astro-auto-import

This an Astro integration that allows you to auto-import components or other modules and access them in any page. Mainly useful to make components available in Markdown files without importing them in `setup`.

## Installation

```shell
npm i astro-auto-import
```

### Experimental status

Third-party integrations are currently only supported behind a flag. You’ll need to update your Astro scripts to include the `--experimental-integrations` flag.

## Usage

Import the integration and add it to your `astro.config.*` file:

```js
import { defineConfig } from 'astro/config';
import AutoImport from 'astro-auto-import';

export default defineConfig({
  integrations: [
    AutoImport({
      imports: ['./src/components/A.astro', './src/components/B.astro'],
    }),
  ],
});
```

### Options

#### `imports`

**Type**: `string[]`

An array of paths to components to auto import. Each component is available as its filename, so with the example configuration above, `<A />` and `<B />` would be available in `.md` and `.astro` pages.

## License

MIT