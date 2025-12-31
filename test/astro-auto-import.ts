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
  assert.match(page, /<lite-youtube videoid="Hoe-woAhq_k".+>.+<\/lite-youtube>/);
}

test('it should render components in a root-level MDX file', () => {
  checkPage(loadPage('/'));
});

test('it should render components in a nested MDX file', () => {
  checkPage(loadPage('/nested'));
});

test('it should render components imported from a barrel module', () => {
  checkPage(loadPage('/barrel'));
});

test.run();
