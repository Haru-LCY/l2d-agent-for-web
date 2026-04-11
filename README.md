# AI Live2D Web Assistant

基于 `OhMyLive2D` 二次开发的 Web AI 看板娘项目。

当前仓库已经完成这些能力：

- 右侧菜单支持 `休息 / 换装 / 换人 / 聊天`
- 点击聊天按钮后，在看板娘头顶打开蓝色对话气泡
- 气泡内部可直接输入文本，长内容向上增长，不遮挡角色
- 支持短上下文会话
- `tests/vue-app` 已接入本地聊天代理接口 `/api/live2d-chat`
- 本地开发时可直接转发到 DeepSeek；未配置 key 时会自动回退到 mock

## 运行

先安装依赖：

```bash
pnpm install
```

启动完整示例：

```bash
pnpm test:vue
```

启动核心包 demo：

```bash
pnpm demo
```

## DeepSeek 接入

### API Key 放在哪

把你的 DeepSeek 配置写到：

`tests/vue-app/.env.local`

你可以先复制模板：

```bash
cp tests/vue-app/.env.example tests/vue-app/.env.local
```

然后编辑 `tests/vue-app/.env.local`：

```env
DEEPSEEK_API_KEY=sk-your-deepseek-api-key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_TEMPERATURE=0.7
```

### 每个变量的作用

- `DEEPSEEK_API_KEY`
  DeepSeek 的 API Key，必填。没有它就不会请求真实模型。
- `DEEPSEEK_BASE_URL`
  DeepSeek 接口基地址，默认是 `https://api.deepseek.com`
- `DEEPSEEK_MODEL`
  使用的模型名，默认 `deepseek-chat`
- `DEEPSEEK_TEMPERATURE`
  回复随机度，默认 `0.7`

### 当前代理是怎么工作的

浏览器不会直接拿你的 API Key 请求 DeepSeek。

当前本地开发流程是：

1. 前端只请求 `POST /api/live2d-chat`
2. `tests/vue-app/vite.config.ts` 中的本地中间件读取 `.env.local`
3. 如果检测到 `DEEPSEEK_API_KEY`，就由本地 Vite 服务转发到 DeepSeek
4. 如果没有检测到 key，就自动返回 mock 回复

这样做的好处是：

- 前端代码里不暴露 API Key
- 本地可以直接验证对话效果
- 后续部署时也可以沿用同样的接口协议

## 当前聊天接口协议

前端固定请求：

```http
POST /api/live2d-chat
```

请求体：

```json
{
  "message": "用户这次输入的内容",
  "messages": [
    { "role": "system", "content": "system prompt" },
    { "role": "user", "content": "历史消息" },
    { "role": "assistant", "content": "历史回复" }
  ],
  "character": "hk416",
  "page": "当前页面 URL"
}
```

响应体：

```json
{
  "reply": "AI 回复内容"
}
```

## 你现在怎么验收 DeepSeek 接入

1. 配置 `tests/vue-app/.env.local`
2. 运行 `pnpm test:vue`
3. 打开终端输出的本地地址
4. 点击看板娘右侧的聊天按钮
5. 输入一句话并发送

你应该看到：

- 页面中的“当前提供方”显示 `DeepSeek 代理`
- 看板娘头顶气泡里出现真实模型回复
- 页面左侧“最近回复”同步更新

如果没配置 key：

- 页面中的“当前提供方”会显示 `Mock 回退`
- 聊天仍然能工作，但返回的是演示回复

## 代码位置

- 核心聊天 UI：
  `packages/oh-my-live2d/src/modules/chat.ts`
- 默认菜单与聊天配置：
  `packages/oh-my-live2d/src/config/config.ts`
- 聊天气泡样式：
  `packages/oh-my-live2d/src/config/style.ts`
- 本地 DeepSeek 代理：
  `tests/vue-app/vite.config.ts`
- 演示页面：
  `tests/vue-app/src/components/Oml2d.vue`

## 说明

当前仓库里的 DeepSeek 代理只存在于本地开发用的 Vite 中间件里。

如果你之后要部署到自己的个人网站，生产环境也需要提供一个同协议的后端接口，例如：

- `/api/live2d-chat`

由你的服务端去持有 DeepSeek API Key，并转发请求到 DeepSeek。

## License

[MIT](./LICENSE)
