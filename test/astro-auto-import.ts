import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { readFileSync } from 'fs';

function loadPage(path: string) {
  const rel = `../demo/dist/${path}/index.html`.replaceAll(/\/{2,}/g, '/');
  return readFileSync(new URL(rel, import.meta.url), 'utf-8');
}

function checkPage(page: string) {
  // Default import
  assert.match(page, /<p>Component A<\/p>/);
  // Aliased default import
  assert.match(page, /<p>Component B<\/p>/);
  // Named import
  assert.match(
    page,
    /Tune in for your recap of developments, contributions, and community news./
  );
}

test('it should render components in a root-level Markdown file', () => {
  checkPage(loadPage('/'));
});

test('it should render components in a nested Markdown file', () => {
  checkPage(loadPage('/nested'));
});

test('it should render components in an MDX file', () => {
  checkPage(loadPage('/mdx'));
});

test.run();
