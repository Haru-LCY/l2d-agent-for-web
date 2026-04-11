import type { IncomingMessage, ServerResponse } from 'node:http'
import { fileURLToPath, URL } from 'node:url'

import type { Connect, PluginOption, ViteDevServer } from 'vite'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'

type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

type ChatPayload = {
  message?: string
  messages?: ChatMessage[]
  character?: string
  page?: string
}

type ChatProxyEnv = {
  DEEPSEEK_API_KEY?: string
  DEEPSEEK_BASE_URL?: string
  DEEPSEEK_MODEL?: string
  DEEPSEEK_TEMPERATURE?: string
}

const createMockReply = (payload: ChatPayload): string => {
  const character = payload.character || '看板娘'
  const message = payload.message || '你好'
  const historyCount = Array.isArray(payload.messages) ? payload.messages.length : 0

  return `${character} 已收到你的消息：“${message}”。当前上下文共 ${historyCount} 条，这里是来自 mock 接口的演示回复。`
}

const parseJsonBody = async (req: IncomingMessage): Promise<ChatPayload> => {
  let body = ''

  await new Promise<void>((resolve, reject) => {
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString()
    })

    req.on('end', () => resolve())
    req.on('error', reject)
  })

  return body ? (JSON.parse(body) as ChatPayload) : {}
}

const requestDeepSeek = async (payload: ChatPayload, env: ChatProxyEnv): Promise<string> => {
  const apiKey = env.DEEPSEEK_API_KEY?.trim()

  if (!apiKey) {
    return createMockReply(payload)
  }

  const baseUrl = (env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '')
  const model = env.DEEPSEEK_MODEL || 'deepseek-chat'
  const temperature = Number(env.DEEPSEEK_TEMPERATURE || '0.7')
  const messages =
    payload.messages && payload.messages.length
      ? payload.messages
      : [{ role: 'user', content: payload.message || '你好' }]

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature,
      messages
    }),
    signal: AbortSignal.timeout(30000)
  })

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
    error?: { message?: string }
  }

  if (!response.ok) {
    throw new Error(data.error?.message || `DeepSeek 请求失败: ${response.status}`)
  }

  const reply = data.choices?.[0]?.message?.content?.trim()

  if (!reply) {
    throw new Error('DeepSeek 返回内容为空')
  }

  return reply
}

const chatProxyPlugin = (env: ChatProxyEnv): PluginOption => ({
  name: 'chat-mock-plugin',
  configureServer(server: ViteDevServer) {
    server.middlewares.use(
      '/api/live2d-chat',
      (req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
        if (req.method !== 'POST') {
          next()
          return
        }

        void parseJsonBody(req)
          .then((payload) => requestDeepSeek(payload, env))
          .then((reply) => {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ reply }))
          })
          .catch((error: unknown) => {
            const message = error instanceof Error ? error.message : '聊天代理请求失败'

            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: message }))
          })
      }
    )
  }
})

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '') as ChatProxyEnv

  return {
    plugins: [vue(), VueDevTools(), chatProxyPlugin(env)],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    define: {
      __DEMO_CHAT_MODE__: JSON.stringify(env.DEEPSEEK_API_KEY ? 'deepseek' : 'mock')
    }
  }
})
