<script setup lang="ts">
import { loadOml2d, type Oml2dEvents, type Oml2dMethods, type Oml2dProperties } from 'oh-my-live2d'
import { onMounted, ref } from 'vue'

type Oml2dInstance = Oml2dProperties & Oml2dMethods & Oml2dEvents

const oml2dRef = ref<HTMLElement>()
const requestState = ref('点击看板娘右侧第四个按钮，打开聊天框。')
const lastReply = ref('暂无回复')
const currentEndpoint = ref('/api/live2d-chat')
const currentProvider = ref(__DEMO_CHAT_MODE__ === 'deepseek' ? 'DeepSeek 代理' : 'Mock 回退')

let oml2d: Oml2dInstance | undefined

const syncApiEndpoint = () => {
  if (!oml2d) {
    return
  }

  oml2d.options.chat ||= {}
  oml2d.options.chat.apiEndpoint = '/api/live2d-chat'
  currentEndpoint.value = '/api/live2d-chat'
  requestState.value =
    __DEMO_CHAT_MODE__ === 'deepseek'
      ? '已检测到 DeepSeek API Key，当前请求会走本地代理再转发到 DeepSeek。'
      : '未检测到 DeepSeek API Key，当前将自动回退到 mock 回复。'
}

const openChat = () => {
  oml2d?.openChat()
}

const sendSampleMessage = () => {
  void oml2d?.sendChatMessage('请先介绍一下你自己，并告诉我你能做什么。')
}

onMounted(() => {
  oml2d = loadOml2d({
    parentElement: oml2dRef.value,
    dockedPosition: 'right',
    mobileDisplay: true,
    models: [
      {
        name: 'hk416',
        path: 'https://model.hacxy.cn/HK416-1-normal/model.json',
        scale: 0.08,
        position: [0, 60],
        mobilePosition: [0, 80],
        stageStyle: {
          height: 450
        }
      },
      {
        name: 'pio',
        path: 'https://model.hacxy.cn/Pio/model.json',
        scale: 0.4,
        position: [0, 50],
        stageStyle: {
          height: 300
        },
        mobilePosition: [0, 80]
      }
    ],
    tips: {
      idleTips: {
        wordTheDay: false,
        message: ['点一下聊天按钮，我们聊聊天。', '你也可以切换角色或换装。'],
        interval: 12000
      }
    },
    chat: {
      apiEndpoint: '/api/live2d-chat',
      systemPrompt:
        '你是一位适合挂在个人网站上的 Live2D AI 看板娘，说话自然、简短、友好，优先帮助用户了解站点和与你互动。',
      greeting: '你好呀，我已经准备好聊天了。',
      placeholder: '输入你想说的话...',
      sendLabel: '发送'
    }
  })

  oml2d.onChatOpen(() => {
    requestState.value = '聊天框已打开。'
  })

  oml2d.onChatClose(() => {
    requestState.value = '聊天框已关闭。'
  })

  oml2d.onChatReply((reply) => {
    lastReply.value = reply
    requestState.value = '已收到回复。'
  })

  oml2d.onChatError((message) => {
    requestState.value = message
  })

  syncApiEndpoint()
})
</script>

<template>
  <section class="demo-shell">
    <div class="demo-copy">
      <p class="eyebrow">AI Live2D Demo</p>
      <h2>面向个人网站的可对话看板娘</h2>
      <p class="summary">
        这个示例把原本的 About
        按钮替换成了聊天按钮。点击看板娘右侧第四个按钮后，头顶会弹出输入气泡，消息通过后端代理接口发送。
      </p>
      <div class="status-grid">
        <div>
          <span class="label">请求状态</span>
          <p>{{ requestState }}</p>
        </div>
        <div>
          <span class="label">当前提供方</span>
          <p>{{ currentProvider }}</p>
        </div>
        <div>
          <span class="label">当前接口</span>
          <p>{{ currentEndpoint }}</p>
        </div>
        <div>
          <span class="label">最近回复</span>
          <p>{{ lastReply }}</p>
        </div>
      </div>
      <div class="controls">
        <button type="button" @click="openChat">打开聊天框</button>
        <button type="button" @click="sendSampleMessage">发送示例消息</button>
      </div>
    </div>
    <div class="demo-stage" ref="oml2dRef"></div>
  </section>
</template>

<style scoped>
.demo-shell {
  display: grid;
  gap: 2rem;
  grid-template-columns: minmax(280px, 1fr) 360px;
  align-items: center;
}

.demo-copy {
  display: grid;
  gap: 1rem;
}

.eyebrow {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #0f766e;
}

h2 {
  margin: 0;
  font-size: clamp(2rem, 3vw, 3rem);
  line-height: 1.05;
  color: #0f172a;
}

.summary {
  margin: 0;
  font-size: 1rem;
  line-height: 1.7;
  color: #334155;
}

.status-grid {
  display: grid;
  gap: 0.9rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.status-grid div {
  min-height: 118px;
  padding: 1rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 14px 32px rgba(148, 163, 184, 0.16);
}

.label {
  display: inline-block;
  margin-bottom: 0.55rem;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #0891b2;
}

.status-grid p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #0f172a;
  word-break: break-word;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  align-items: center;
}

.controls button {
  border: none;
  border-radius: 999px;
  padding: 0.75rem 1rem;
  background: #0f766e;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.demo-stage {
  position: relative;
  min-height: 560px;
  border-radius: 28px;
  background: radial-gradient(circle at top, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0) 52%),
    linear-gradient(180deg, rgba(12, 74, 110, 0.08) 0%, rgba(12, 74, 110, 0.02) 100%);
  overflow: visible;
}

@media (max-width: 960px) {
  .demo-shell {
    grid-template-columns: 1fr;
  }

  .status-grid {
    grid-template-columns: 1fr;
  }

  .demo-stage {
    min-height: 420px;
  }
}
</style>
