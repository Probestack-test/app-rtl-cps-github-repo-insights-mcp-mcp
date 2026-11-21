import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { spawn } from 'node:child_process';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
const port = 18123; const host = '127.0.0.1:' + port; const origin = 'http://' + host;
const apiKey = 'generated-protocol-test-key';
let child;
let childOutput = '';
let childExited = false;
const meta = { 'io.modelcontextprotocol/protocolVersion': '2026-07-28',
  'io.modelcontextprotocol/clientInfo': { name: 'generated-wire-test', version: '1' },
  'io.modelcontextprotocol/clientCapabilities': {} };
const discover = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'server/discover', params: { _meta: meta } });
const wireHeaders = { Origin: origin, Accept: 'application/json, text/event-stream',
  'Content-Type': 'application/json', 'Mcp-Method': 'server/discover' };
const endpoint = origin + '/mcp';
describe('generated MCP capabilities over HTTP', () => {
  beforeAll(async () => {
    child = spawn(process.execPath, ['dist/http.js'], { stdio: ['ignore', 'pipe', 'pipe'], env: {
      ...process.env, PORT: String(port), HOST: '127.0.0.1', MCP_ALLOWED_HOSTS: host,
      MCP_ALLOWED_ORIGINS: origin, MCP_API_KEYS: apiKey
    }});
    // Captured so a startup crash is visible in CI instead of only "did not become
    // ready" -- piped stdio is otherwise read by nothing and the reason is lost.
    child.stdout.on('data', (chunk) => { childOutput += chunk; });
    child.stderr.on('data', (chunk) => { childOutput += chunk; });
    child.on('exit', (code, signal) => { childExited = true;
      childOutput += `\n[dist/http.js exited early: code=${code} signal=${signal}]`; });
  let ready = false;
  for (let i = 0; i < 100 && !childExited; i++) {
    // Any HTTP response proves the server is listening. An empty POST may be
    // rejected as 415 before protocol validation; the assertions below check MCP behavior.
    try { await fetch(origin + '/mcp', { method: 'POST' }); ready = true; break; } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
    expect(ready, 'HTTP MCP server did not become ready. Output:\n' + childOutput).toBe(true);
  }, 15000);
  afterAll(() => { if (child) child.kill(); });
  it('rejects an untrusted Origin', async () => {
  const wrongOrigin = await fetch(endpoint, { method: 'POST', body: discover,
    headers: { ...wireHeaders, Origin: 'https://untrusted.example', 'MCP-Protocol-Version': '2026-07-28' } });
    expect(wrongOrigin.status, 'untrusted Origin must be forbidden').toBe(403);
  });
  it('rejects a missing protocol header', async () => {
  const missingVersion = await fetch(endpoint, { method: 'POST', body: discover, headers: wireHeaders });
    expect(missingVersion.status, 'missing protocol header must be rejected').toBe(400);
  });
  it('rejects a mismatched protocol header', async () => {
  const invalidVersion = await fetch(endpoint, { method: 'POST', body: discover,
    headers: { ...wireHeaders, 'MCP-Protocol-Version': '2025-06-18' } });
    expect(invalidVersion.status, 'mismatched protocol header must be rejected').toBe(400);
  });
  it('rejects JSON-RPC batch arrays', async () => {
  const batch = await fetch(endpoint, { method: 'POST', body: '[' + discover + ']',
    headers: { ...wireHeaders, 'MCP-Protocol-Version': '2026-07-28' } });
    expect(batch.status, 'JSON-RPC batch arrays must be rejected').toBe(400);
  });
  it('discovers only implemented capabilities', async () => {
  const discovery = await fetch(endpoint, { method: 'POST', body: discover,
    headers: { ...wireHeaders, 'MCP-Protocol-Version': '2026-07-28' } });
    expect(discovery.status).toBe(200);
  const advertised = (await discovery.json()).result.capabilities;
    expect(Boolean(advertised.tools)).toBe(true);
    expect(Boolean(advertised.resources)).toBe(true);
    expect(Boolean(advertised.prompts)).toBe(true);
  });
  it('lists generated capabilities through the MCP client', async () => {
  const client = new Client({ name: 'generated-http-test', version: '1.0.0' }, { versionNegotiation: { mode: 'auto' } });
  const headers = { Origin: origin };
    try {
      await client.connect(new StreamableHTTPClientTransport(new URL(origin + '/mcp'), { requestInit: { headers } }));
      if (true) expect((await client.listTools()).tools.length).toBe(3);
      if (true) expect((await client.listResources()).resources.length).toBe(1);
      if (true) expect((await client.listPrompts()).prompts.length).toBe(1);
    } finally { await client.close(); }
    console.log('verified generated MCP capabilities over HTTP');
  }, 15000);
});
