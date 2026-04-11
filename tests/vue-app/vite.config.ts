import type { IncomingMessage, ServerResponse } from 'node:http'
import { fileURLToPath, URL } from 'node:url'

import type { Connect, PluginOption, ViteDevServer } from 'vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'

const chatMockPlugin = (): PluginOption => ({
  name: 'chat-mock-plugin',
  configureServer(server: ViteDevServer) {
    server.middlewares.use(
      '/api/live2d-chat',
      (req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
        if (req.method !== 'POST') {
          next()
          return
        }

        let body = ''

        req.on('data', (chunk: Buffer) => {
          body += chunk.toString()
        })

        req.on('end', () => {
          const payload = body ? JSON.parse(body) : {}
          const character = payload.character || '看板娘'
          const message = payload.message || '你好'
          const historyCount = Array.isArray(payload.messages) ? payload.messages.length : 0
          const reply = `${character} 已收到你的消息：“${message}”。当前上下文共 ${historyCount} 条，这里是来自 mock 接口的演示回复。`

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ reply }))
        })
      }
    )
  }
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), VueDevTools(), chatMockPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
