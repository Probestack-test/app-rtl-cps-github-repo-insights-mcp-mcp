# Git Repo Insights

Generated with the stable MCP TypeScript SDK 2.4.0 for protocol 2026-07-28.

Run `npm install && npm run build && npm start`. Diagnostics use stderr for stdio safety.

## Testing

Run `npm test` for the generated Vitest suite. For CI reports, run `npm test -- --reporter=junit --outputFile.junit=test-results.xml --coverage --coverage.reporter=lcov --coverage.reporter=text-summary`. The HTTP protocol tests exercise a spawned server process; V8 coverage measures modules imported in the Vitest worker, including the catalog and server modules exercised by unit tests, but does not include the spawned HTTP process.

## Environment variables

Set these before starting the server (see `.env.example` for the blank list).

| Variable | Required for | Where it comes from |
| --- | --- | --- |
| `UPSTREAM_BASE_URL` | Every HTTP-bound tool | The target API's base URL (https://api.github.com). |
