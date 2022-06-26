import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { readFileSync } from 'node:fs';

test('it should render components in a root-level Markdown file', () => {
  const page = readFileSync(
    new URL('../demo/dist/index.html', import.meta.url),
    'utf-8'
  );
  // Default import
  assert.match(page, /<p>Component A<\/p>/);
  // Aliased default import
  assert.match(page, /<p>Component B<\/p>/);
  // Named import
  assert.match(
    page,
    /Tune in for your recap of developments, contributions, and community news./
  );
});

test('it should render components in a nested Markdown file', () => {
  const page = readFileSync(
    new URL('../demo/dist/nested/index.html', import.meta.url),
    'utf-8'
  );
  // Default import
  assert.match(page, /<p>Component A<\/p>/);
  // Aliased default import
  assert.match(page, /<p>Component B<\/p>/);
  // Named import
  assert.match(
    page,
    /Tune in for your recap of developments, contributions, and community news./
  );
});

test.run();
