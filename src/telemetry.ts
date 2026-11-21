import { trace } from '@opentelemetry/api';
export const tracer = trace.getTracer('generated-mcp-server');

import { Registry, collectDefaultMetrics, Counter, Histogram } from 'prom-client';
export const registry = new Registry();
collectDefaultMetrics({ register: registry });
export const httpRequests = new Counter({
  name: 'mcp_http_requests_total', help: 'MCP HTTP requests', labelNames: ['status'], registers: [registry]
});
export const httpRequestDuration = new Histogram({
  name: 'mcp_http_request_duration_seconds', help: 'MCP HTTP request duration',
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10], registers: [registry]
});
export const toolCalls = new Counter({
  name: 'mcp_tool_calls_total', help: 'MCP tool invocations', labelNames: ['tool', 'status'], registers: [registry]
});
export const toolCallDuration = new Histogram({
  name: 'mcp_tool_call_duration_seconds', help: 'MCP tool invocation duration', labelNames: ['tool'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10], registers: [registry]
});
