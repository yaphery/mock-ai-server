# Mock AI Server

模拟公司 Java 后端的 AI 接口，真实调用阿里云千问（Qwen）流式接口。

## 快速开始

### 1. 配置环境变量

复制 `.env` 并填入你的 API 密钥：

```
PORT=3000
DASHSCOPE_API_KEY=<your-api-key>
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动服务

```bash
npm start
# 或
node server.js
```

## API 接口

### POST /api/ai/chat

调用千问模型进行流式对话。

**请求体**：

```json
{
  "message": "你好，请介绍一下自己",
  "sessionId": "optional-session-id"
}
```

**响应**：

- `Content-Type: text/plain; charset=utf-8`（流式输出）
- 响应头 `X-Session-Id`：本次会话 ID（新会话时自动生成）

### GET /health

健康检查接口，返回 `{ "status": "ok" }`。

## OpenAPI / Swagger

### 查看 Swagger UI

启动服务后，访问：

```
http://localhost:3000/docs
```

### 获取 OpenAPI JSON

```
http://localhost:3000/openapi.json
```

### 导出 contract/openapi.json

在服务运行的情况下，执行：

```bash
npm run export:openapi
```

该命令会从 `http://localhost:${PORT}/openapi.json` 拉取最新的 OpenAPI 规范，并写入 `contract/openapi.json`。
