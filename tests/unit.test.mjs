import { afterAll, describe, expect, it } from 'vitest';
import { prompts, resources, tools } from '../dist/catalog.js';
import { invokeToolForTest } from '../dist/server.js';
describe('generated MCP catalog module', () => {
  it('exposes a tools/resources/prompts catalog', () => {
    expect(Array.isArray(tools)).toBe(true);
    expect(Array.isArray(resources)).toBe(true);
    expect(Array.isArray(prompts)).toBe(true);
  });
  for (const name of []) it('invokes builtin tool ' + name, async () => {
    await invokeToolForTest(name, { name: 'ForgeSphere' });
  });
  afterAll(() => console.log('verified generated MCP catalog module'));
});
