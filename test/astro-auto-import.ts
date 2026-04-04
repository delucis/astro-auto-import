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

test('it should override default HTML elements with defaultComponents', () => {
  const page = loadPage('/');
  // Check that paragraphs use the custom-paragraph class from CustomParagraph.astro
  assert.match(page, /class="custom-paragraph"/);
});

test('it should skip defaultComponents when file has its own components export', () => {
  const page = loadPage('/custom-components');
  // The page defines its own components export with a custom link
  assert.match(page, /class="custom-link"/);
  // The auto-imported defaultComponents (custom-paragraph) should NOT be applied
  assert.not.match(page, /class="custom-paragraph"/);
});

test.run();
