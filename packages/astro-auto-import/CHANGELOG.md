# astro-auto-import

## 0.4.5

### Patch Changes

- [`8538321`](https://github.com/delucis/astro-auto-import/commit/853832156e8e58bfb2c1be864bee5e53fab86bd9) Thanks [@delucis](https://github.com/delucis)! - No code changes. This release is the first published using OIDC trusted publisher configuration for improved security.

## 0.4.4

### Patch Changes

- f7c02dc: Adds support for Astro v5

## 0.4.3

### Patch Changes

- d7fdae6: Add `utility` keyword for better categorization in the Astro integrations library

## 0.4.2

### Patch Changes

- 13b07e1: Support Astro v4

## 0.4.1

### Patch Changes

- 5b9b278: Improve README

## 0.4.0

### Minor Changes

- ec5f241: Added support for namespace imports, for importing all named exports from a module.

  ```js
  AutoImport({
    imports: [
      {
        // Import all named exports from a module as a namespace
        // generates:
        // import * as Components from './src/components';
        './src/components': 'Components',
      },
    ],
  }),
  ```

### Patch Changes

- ea93946: refactor: strip out old “exposures” code

## 0.3.2

### Patch Changes

- 8baeeae: Fix Windows compatibility

## 0.3.1

### Patch Changes

- 75f332a: Add support for Astro 3.0.0 incl. prereleases

## 0.3.0

> **Warning**
> This release includes breaking changes.
> The minimum required Astro version is now 2.0 and auto-imports only work in MDX.

### Minor Changes

- ad941b0: Drop support for auto-importing in `.astro` files
- ad941b0: Drop support for Astro v1

## 0.2.1

### Patch Changes

- 9c5c1d2: Allow installation in Astro v2 projects

## 0.2.0

### Minor Changes

- aa42e19: Add support for [@astrojs/mdx](https://docs.astro.build/en/guides/integrations-guide/mdx/) 🎉

  Auto-imports will now also be injected in `.mdx` files. You may need to remove manual imports if you were already using `astro-auto-import` v0.1.x with MDX.

- 795e08e: Update to Astro v1 — remember to enable `legacy.astroFlavoredMarkdown` if you’re using components in `.md` files

## 0.1.2

### Patch Changes

- db1ac29: Internal: assign imports to `globalThis` instead of `global` — H/T @natemoo-re 🙌

## 0.1.1

### Patch Changes

- c28efdf: Document extended imports config syntax
- 075bfa2: Only resolve module identifiers that start with `.`
- b89fcbb: Add support for named imports & import aliasing

## 0.1.0

### Minor Changes

- b0d94cb: Initial release
