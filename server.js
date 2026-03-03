require('dotenv').config()
const express = require('express')
const cors = require('cors')
const OpenAI = require('openai').default
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

const app = express()
app.use(cors({
  exposedHeaders: ['X-Session-Id'],
}))
app.use(express.json())

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mock AI Server',
      version: '1.0.0',
      description: 'Mock AI server that proxies streaming chat completions via Qwen (DashScope).',
    },
  },
  apis: [__filename],
})

app.get('/openapi.json', (req, res) => {
  res.json(swaggerSpec)
})

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

const openai = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: process.env.DASHSCOPE_BASE_URL,
})

const sessions = new Map()
// 结构: Map<sessionId, Array<{role, content}>>

/**
 * @openapi
 * /api/ai/chat:
 *   post:
 *     summary: Send a chat message and receive a streaming AI reply
 *     description: >
 *       Proxies the request to the Qwen (DashScope) streaming API.
 *       The response is streamed as plain text chunks.
 *       A session ID is returned in the `X-Session-Id` response header so
 *       the client can maintain conversation history across requests.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: The user's chat message.
 *                 example: Hello, who are you?
 *               sessionId:
 *                 type: string
 *                 description: >
 *                   Optional session identifier to continue an existing
 *                   conversation. If omitted a new session is created.
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       '200':
 *         description: Streamed plain-text AI reply
 *         headers:
 *           X-Session-Id:
 *             schema:
 *               type: string
 *             description: Session ID for the current conversation.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Hello! I am a helpful assistant.
 *       '500':
 *         description: AI service error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: AI 服务出错
 */
// 模拟公司 Java 后端的 AI 接口，真实调用千问流式接口
app.post('/api/ai/chat', async (req, res) => {
  const { message, sessionId: clientSessionId } = req.body
  const sessionId = clientSessionId ?? crypto.randomUUID()
  console.log('前端传来的问题：', message, '| sessionId:', sessionId)

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Transfer-Encoding', 'chunked')
  res.setHeader('X-Session-Id', sessionId)

  const history = sessions.get(sessionId) ?? []
  const messages = [
    { role: 'system', content: 'You are a helpful assistant.' },
    ...history,
    { role: 'user', content: message },
  ]

  try {
    const stream = await openai.chat.completions.create({
      model: 'qwen-plus',
      stream: true,
      messages,
    })

    let assistantReply = ''
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content
      if (text) {
        res.write(text)
        assistantReply += text
      }
    }

    history.push({ role: 'user', content: message })
    history.push({ role: 'assistant', content: assistantReply })
    sessions.set(sessionId, history)
    res.end()
  } catch (error) {
    console.error('千问接口调用失败：', error.message)
    res.status(500).end('AI 服务出错')
  }
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`服务已启动：http://localhost:${port}`)
})
