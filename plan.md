# 个人网站 AI 看板娘改造计划

## 1. 目标

将当前基于 `OhMyLive2D` 的仓库改造成一个适合嵌入个人网站的 AI 看板娘组件。

第一阶段目标如下：

- 保留原有看板娘展示、换人、换装、休息能力
- 将右侧第 4 个按钮从 `info/about` 改为 `聊天`
- 点击聊天按钮后，在看板娘头顶弹出聊天气泡
- 支持用户输入消息并通过后端代理接口请求 AI 回复
- 支持短上下文会话
- 在 `tests/vue-app` 中提供一套完整演示

## 2. 仓库结构理解

### 根目录

- `package.json`：workspace 根脚本，负责构建、demo、文档和测试示例启动
- `pnpm-workspace.yaml`：声明 `docs/**`、`packages/**`、`tests/**` 三类工作区
- `README (1).md`：上游项目原始说明
- `README.md`：当前项目需求说明

### packages

- `packages/oh-my-live2d`
  - 核心运行时包
  - `src/modules` 为主要实现：
    - `stage.ts`：舞台容器和滑入滑出
    - `models.ts`：模型加载、换人、换装、动作触发
    - `menus.ts`：右侧按钮菜单
    - `tips.ts`：头顶提示气泡
    - `status-bar.ts`：侧边状态条
    - `oml2d.ts`：实例协调层和公开 API
  - `src/config`：默认配置与全局样式
  - `src/types`：对外类型和 options 定义
- `packages/vite-plugin`
  - 提供 Vite 插件接入方式
- `packages/vuepress-plugin`
  - 提供 VuePress 插件接入方式

### tests

- `tests/vue-app`
  - 当前最适合承载第一版完整聊天演示
  - 已接入 `oh-my-live2d` workspace 包

### docs

- VitePress 文档站
- 适合后续在核心能力稳定后补文档，不作为第一阶段主战场

## 3. 已确定的实现方案

### 3.1 核心交互

- 保留原有 `Tips` 模块职责：欢迎语、闲置提示、复制提示
- 新增独立 `Chat` 模块负责聊天 UI、消息状态和接口请求
- 聊天气泡挂载在舞台区域内部，视觉位置与原提示框保持一致
- 聊天打开时暂停 `Tips` 播放
- 聊天关闭时恢复 `Tips`

### 3.2 菜单改造

默认按钮顺序调整为：

1. 休息
2. 换装
3. 换人
4. 聊天

说明：

- 删除原有 `About` 默认按钮
- 新增 `icon-chat`
- 聊天按钮为开关行为，再次点击可关闭聊天框

### 3.3 会话行为

- 点击聊天按钮后显示输入框和欢迎语
- 空消息不允许发送
- 发送中禁用输入和发送按钮
- 请求成功后在气泡中展示最近一轮问答
- 缺少 `apiEndpoint` 时显示“请先配置聊天接口”
- 请求失败时在气泡和状态条同步提示错误

### 3.4 模型切换规则

- 切换模型：关闭聊天框并清空聊天历史
- 切换衣服：保留当前聊天历史
- 进入休息：关闭聊天框

## 4. 公共接口设计

### 4.1 新增 options

在 `Options` 中新增：

```ts
chat?: {
  disable?: boolean
  apiEndpoint?: string
  headers?: Record<string, string>
  systemPrompt?: string
  maxHistory?: number
  placeholder?: string
  greeting?: string
  sendLabel?: string
}
```

默认值：

- `disable: false`
- `maxHistory: 6`
- `sendLabel: '发送'`

### 4.2 新增实例方法

- `openChat()`
- `closeChat()`
- `toggleChat()`
- `sendChatMessage(message: string)`
- `clearChatHistory()`

### 4.3 新增事件

- `onChatOpen(fn)`
- `onChatClose(fn)`
- `onChatReply(fn)`
- `onChatError(fn)`

## 5. 后端接口约定

前端固定使用：

- `POST chat.apiEndpoint`

请求体：

```json
{
  "message": "本轮用户输入",
  "messages": [
    { "role": "system", "content": "可选 system prompt" },
    { "role": "user", "content": "历史用户消息" },
    { "role": "assistant", "content": "历史回复" }
  ],
  "character": "当前角色名",
  "page": "当前页面 URL"
}
```

响应体：

```json
{
  "reply": "AI 回复内容"
}
```

说明：

- 第一版不做流式输出
- `character` 优先取模型 `name`
- 未命名模型回退为 `model-${index}`

## 6. Demo 方案

第一阶段演示放在 `tests/vue-app`：

- 提供右侧聊天按钮的真实交互
- 提供 Mock API，便于本地无后端时验证
- 提供是否启用 Mock API 的切换
- 提供“打开聊天框”和“发送示例消息”辅助按钮

## 7. 环境与验证

推荐基线：

- Node 20 LTS
- pnpm 10.x

实际执行：

- 安装依赖：`pnpm install`
- 核心构建：`pnpm -F oh-my-live2d build`
- Vue 示例构建：`pnpm -F vue-app build`
- 本地示例启动：`pnpm test:vue`
- 核心 demo 启动：`pnpm demo`

## 8. 下一步扩展

第一阶段完成后，建议继续做：

- 增加流式输出和打字机效果
- 将回复类型映射到动作和表情
- 增加可配置角色设定
- 支持第三方站点更轻量的嵌入配置
- 补充 README 与 docs 文档
