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

const openai = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: process.env.DASHSCOPE_BASE_URL,
})

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mock AI Server',
      version: '1.0.0',
      description: '模拟公司 Java 后端的 AI 接口，真实调用千问（Qwen）流式接口',
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 3000}` }],
  },
  apis: ['./server.js'],
})

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get('/api-json', (req, res) => res.json(swaggerSpec))

const sessions = new Map()
// 结构: Map<sessionId, Array<{role, content}>>

/**
 * @openapi
 * /api/ai/chat:
 *   post:
 *     summary: 发送消息并获取 AI 流式回复
 *     description: 将用户消息发送给千问模型，以流式（chunked）方式返回 AI 回复文本。响应头 X-Session-Id 包含本次会话 ID。
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
 *                 description: 用户输入的消息内容
 *                 example: 你好，请介绍一下自己
 *               sessionId:
 *                 type: string
 *                 description: 会话 ID（可选，不传则由服务端生成）
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: AI 流式文本回复
 *         headers:
 *           X-Session-Id:
 *             description: 本次会话 ID
 *             schema:
 *               type: string
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 你好！我是通义千问，有什么可以帮你的？
 *       500:
 *         description: AI 服务调用失败
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
