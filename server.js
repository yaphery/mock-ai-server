require('dotenv').config()
const express = require('express')
const cors = require('cors')
const OpenAI = require('openai').default
const swaggerUi = require('swagger-ui-express')
const { createOpenApiSpec } = require('./swagger')

const app = express()
app.use(cors({
  exposedHeaders: ['X-Session-Id'],
}))
app.use(express.json())

const openai = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: process.env.DASHSCOPE_BASE_URL,
})

const sessions = new Map()
// 结构: Map<sessionId, Array<{role, content}>>

const spec = createOpenApiSpec()
app.get('/openapi.json', (req, res) => res.json(spec))
app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec))

/**
 * @openapi
 * /health:
 *   get:
 *     summary: 健康检查
 *     responses:
 *       200:
 *         description: 服务正常
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
app.get('/health', (req, res) => res.json({ status: 'ok' }))

/**
 * @openapi
 * /api/ai/chat:
 *   post:
 *     summary: 调用 AI 聊天（千问流式输出）
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
 *                 description: 用户发送的消息
 *               sessionId:
 *                 type: string
 *                 description: 会话 ID（可选，不传则自动生成）
 *     responses:
 *       200:
 *         description: 流式文本输出
 *         headers:
 *           X-Session-Id:
 *             schema:
 *               type: string
 *             description: 本次会话的 Session ID
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       500:
 *         description: AI 服务出错
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
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
