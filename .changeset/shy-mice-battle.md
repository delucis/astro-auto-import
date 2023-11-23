---
"astro-auto-import": minor
---

Added support for namespace imports, for importing all named exports from a module.

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
