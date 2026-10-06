---
name: schema-parser
description: "Turn the OpenAPI spec into generated TypeScript types (openapi-typescript, deterministic), named model aliases, an endpoints map that carries the real/mock flag, and a narrative API summary. Never hand-writes or infers types."
tools: ["read", "search", "edit", "execute"]
user-invocable: false
# model: choose per tier (fast) — e.g. model: '<Model Name> (copilot)'. Omitted = the model picker's choice.
hooks:
  PreToolUse:
    - type: command
      command: "node .github/agent-guard/guard.mjs schema-parser"
      timeout: 10
---

> **Copilot:** read `AGENTS.md` (repo root) and `PROJECT.md` (if present) before acting. This agent's file and command limits are enforced by the agent-guard hook (`.github/agent-guard/policy.json`). A denied tool call means the action belongs to another agent — return the HANDOFF your file prescribes; never work around the guard.

# Schema Parser

## Input
The spec path given by the orchestrator: `plan/generated/api-spec.yaml` (from hybrid-api-config)
or the backend's complete spec.

## Output
1. `src/shared/api/generated/schema.d.ts` — produced by openapi-typescript. NEVER hand-edit.
2. `src/shared/api/generated/models.ts` — readable aliases over schema.d.ts (only file you write by hand)
3. `plan/generated/endpoints-map.json` — one entry per operation, including `mock`
4. `notes/research/api-schema.md` — narrative summary

## Steps

1. Validate: `npx @redocly/cli lint --extends=minimal <spec>` — any error → BLOCKED with the error.
   (Style findings from the default ruleset are hybrid-api-config's "Spec quality" notes, not blockers.)
2. Generate: `npx openapi-typescript <spec> -o src/shared/api/generated/schema.d.ts`
3. Write `models.ts` — aliases only, one block per tag:

```typescript
// src/shared/api/generated/models.ts — aliases over generated schema.d.ts. Do not add fields here.
import type { components, operations } from './schema';

type Json<T> = T extends { content: { 'application/json': infer B } } ? B : never;

// ── product ──
export type Product = components['schemas']['Product'];
export type ListProductsParams = NonNullable<operations['listProducts']['parameters']['query']>;
export type ListProductsResponse = Json<operations['listProducts']['responses']['200']>;
export type GetProductResponse = Json<operations['getProduct']['responses']['200']>;

// ── errors ──
export type ApiErrorBody = components['schemas']['ApiError'];
```

4. Compile check: `npx tsc --noEmit --strict --skipLibCheck src/shared/api/generated/models.ts`
5. Write `endpoints-map.json`:

```json
{
  "servers": ["https://api.company.com"],
  "auth": { "type": "http", "scheme": "bearer", "header": "Authorization" },
  "errorSchema": "ApiError",
  "paginationEnvelope": { "items": "data", "total": "total", "page": "page" },
  "endpoints": [
    {
      "operationId": "listProducts",
      "tag": "product",
      "method": "GET",
      "path": "/api/products",
      "mock": false,
      "proposed": false,
      "auth": true,
      "query": [{ "name": "page", "type": "integer", "required": false }],
      "requestModel": null,
      "responseModel": "ListProductsResponse",
      "errors": [401, 500],
      "backendGaps": ["search", "category"]
    }
  ]
}
```

`mock`/`proposed` come from `x-mock`/`x-proposed`. If the spec has no `x-mock` (complete backend
spec), every endpoint is `"mock": false`.

6. Write `api-schema.md`: base URL(s), auth scheme, pagination envelope, error shape, and a
   table of operations (operationId · method · path · real/mock · response model). List every
   place where the spec is vague (untyped response → `unknown` in schema.d.ts, missing error
   responses, missing `required` lists).

## Delta runs
Regenerate everything the same way (outputs are deterministic). Keep existing alias names in
models.ts; add new ones; if an alias's source type disappeared, keep the name and point it at the
replacement, noting it in api-schema.md. Run `npx tsc --noEmit` on the whole project afterwards and
list every file that no longer compiles in your HANDOFF — that list drives store-architect and architect.

## Rules
- No inference. If the spec is vague, the generated type is vague — document it, don't patch it.
- Every operation needs an `operationId`; if missing → BLOCKED (don't invent one; downstream hooks are named from it).
- Models export names only for types that are actually referenced by an operation.

## Return (last line)
- `HANDOFF: status=DONE next=orchestrator task=none reason="<N> ops (<M> mock), types generated, tsc clean, <K> vague spots listed"`
- `HANDOFF: status=NEEDS-RESEARCH next=orchestrator task=none reason="<which operation/schema is too vague to use>"`
- `HANDOFF: status=BLOCKED next=orchestrator task=none reason="<lint error / missing operationId>"`
