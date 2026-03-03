# mock-ai-server

A lightweight Express (v5) server that proxies streaming chat-completion requests to the Qwen (DashScope) API, simulating a company Java back-end AI endpoint.

## Getting started

### Prerequisites

- Node.js 18+
- A DashScope API key

### Install dependencies

```bash
npm install
```

### Environment variables

Create a `.env` file at the project root (copy from `.env.example` if it exists):

```
DASHSCOPE_API_KEY=your_api_key_here
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
PORT=3000
```

### Start the server

```bash
node server.js
```

---

## API

### `POST /api/ai/chat`

Send a chat message and receive a **streaming** plain-text reply.

**Request body** (`application/json`):

| Field       | Type   | Required | Description                                                      |
|-------------|--------|----------|------------------------------------------------------------------|
| `message`   | string | ✅        | The user's chat message.                                         |
| `sessionId` | string | ❌        | Session ID to continue an existing conversation. Auto-generated if omitted. |

**Response headers**:

| Header          | Description                          |
|-----------------|--------------------------------------|
| `X-Session-Id`  | Session ID for the current conversation. |

**Response** (`200 text/plain`): Chunked streaming text of the AI reply.

---

## OpenAPI / Swagger

### Swagger UI

Interactive API documentation is available at:

```
http://localhost:3000/docs
```

### OpenAPI JSON spec

The raw OpenAPI 3.0 spec is served at:

```
http://localhost:3000/openapi.json
```

### Export OpenAPI spec to file

With the server running, execute:

```bash
npm run export:openapi
```

This fetches the spec from the running server and writes it to `contract/openapi.json`. You can override the server base URL with the `SERVER_URL` environment variable:

```bash
SERVER_URL=http://localhost:4000 npm run export:openapi
```

The generated `contract/openapi.json` can be consumed by front-end tooling to auto-generate TypeScript types or API clients (e.g. `openapi-typescript`, `openapi-generator`).
