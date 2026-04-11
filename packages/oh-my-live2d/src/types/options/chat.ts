export interface ChatOptions {
  /**
   * 是否禁用聊天能力
   * @default false
   */
  disable?: boolean;

  /**
   * 后端代理接口地址
   */
  apiEndpoint?: string;

  /**
   * 附加请求头
   */
  headers?: Record<string, string>;

  /**
   * system prompt
   */
  systemPrompt?: string;

  /**
   * 参与拼接上下文的历史消息条数
   * @default 6
   */
  maxHistory?: number;

  /**
   * 输入框占位文案
   */
  placeholder?: string;

  /**
   * 聊天框打开时的欢迎语
   */
  greeting?: string;

  /**
   * 发送按钮文案
   * @default '发送'
   */
  sendLabel?: string;
}
