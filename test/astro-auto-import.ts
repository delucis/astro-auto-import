import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { readFileSync } from 'node:fs';

test('it should render components in a root-level Markdown file', () => {
  const page = readFileSync(
    new URL('../demo/dist/index.html', import.meta.url),
    'utf-8'
  );
  assert.match(page, /<p>Component A<\/p>/);
  assert.match(page, /<p>Component B<\/p>/);
});

test('it should render components in a nested Markdown file', () => {
  const page = readFileSync(
    new URL('../demo/dist/nested/index.html', import.meta.url),
    'utf-8'
  );
  assert.match(page, /<p>Component A<\/p>/);
  assert.match(page, /<p>Component B<\/p>/);
});

test.run();
