# Mock AI Server

模拟公司 Java 后端的 AI 接口，真实调用阿里云通义千问（Qwen）流式 API。

## 环境要求

- Node.js >= 18

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env` 并填写密钥：

```bash
cp .env .env.local
```

在 `.env` 中配置：

```
PORT=3000
DASHSCOPE_API_KEY=your_api_key_here
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
```

### 3. 启动服务

```bash
npm start
```

服务默认监听 `http://localhost:3000`。

---

## API 接口

### POST /api/ai/chat

发送消息，以流式（chunked transfer）方式返回 AI 文本回复。

**请求体（JSON）：**

| 字段        | 类型   | 必填 | 说明                             |
|-------------|--------|------|----------------------------------|
| `message`   | string | ✅   | 用户输入的消息内容               |
| `sessionId` | string | ❌   | 会话 ID（不传则服务端自动生成） |

**响应：**

- `Content-Type: text/plain; charset=utf-8`（流式）
- 响应头 `X-Session-Id`：本次会话 ID

**示例：**

```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "你好，请介绍一下自己"}'
```

---

## Swagger UI / OpenAPI

| 路径        | 说明                         |
|-------------|------------------------------|
| `/docs`     | Swagger UI 交互式文档界面    |
| `/api-json` | OpenAPI 3.0 JSON 规范文件    |

启动服务后访问：<http://localhost:3000/docs>

---

## 导出 OpenAPI JSON（供前端生成 client/types）

先启动服务，再运行：

```bash
npm run export:openapi
```

脚本会从 `http://localhost:3000/api-json` 拉取规范并写入 `contract/openapi.json`。

若服务监听在非默认端口，可通过环境变量指定：

```bash
PORT=4000 npm run export:openapi
```

生成的文件路径：`contract/openapi.json`

---

## 项目结构

```
mock-ai-server/
├── server.js                  # Express 服务入口
├── scripts/
│   └── export-openapi.mjs     # 导出 OpenAPI JSON 的脚本
├── contract/
│   └── openapi.json           # 生成的 OpenAPI 规范（由脚本写入）
├── package.json
└── .env                       # 环境变量配置
```
