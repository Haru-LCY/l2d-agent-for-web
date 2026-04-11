import type { Events } from './events.js';
import type { OhMyLive2D } from './oml2d.js';
import type { Tips } from './tips.js';
import { ELEMENT_ID } from '../config/index.js';
import type { ChatHistoryMessage, ChatRequestMessage } from '../types/common.js';
import type { DefaultOptions } from '../types/index.js';
import { createElement } from '../utils/index.js';

export class Chat {
  element?: HTMLElement;
  private displayElement?: HTMLElement;
  private latestUserElement?: HTMLElement;
  private statusElement?: HTMLElement;
  private formElement?: HTMLFormElement;
  private inputElement?: HTMLTextAreaElement;
  private submitElement?: HTMLButtonElement;
  private messages: ChatHistoryMessage[] = [];
  private loading = false;
  private opened = false;

  constructor(
    private options: DefaultOptions,
    private oml2d: OhMyLive2D,
    private events: Events,
    private tips: Tips
  ) {}

  private get disabled(): boolean {
    return this.options.chat.disable;
  }

  private get chatMessages(): ChatHistoryMessage[] {
    return [...this.messages];
  }

  private get character(): string {
    return this.options.models[this.oml2d.modelIndex]?.name || `model-${this.oml2d.modelIndex}`;
  }

  reload(stageElement: HTMLElement): void {
    this.unmount();
    this.create();
    this.mount(stageElement);
    this.render();
  }

  create(): void {
    if (this.disabled) {
      return;
    }

    this.element = createElement({ id: ELEMENT_ID.chat, tagName: 'div', className: 'oml2d-chat' });
    this.displayElement = createElement({ id: 'oml2d-chat-display', tagName: 'div', className: 'oml2d-chat-display' });
    this.latestUserElement = createElement({ id: 'oml2d-chat-latest-user', tagName: 'div', className: 'oml2d-chat-latest-user' });
    this.statusElement = createElement({ id: 'oml2d-chat-status', tagName: 'div', className: 'oml2d-chat-status' });
    this.formElement = document.createElement('form');
    this.formElement.className = 'oml2d-chat-form';
    this.inputElement = document.createElement('textarea');
    this.inputElement.className = 'oml2d-chat-input';
    this.inputElement.rows = 1;
    this.submitElement = document.createElement('button');
    this.submitElement.className = 'oml2d-chat-send';
    this.submitElement.type = 'submit';
    this.submitElement.textContent = this.options.chat.sendLabel || '发送';

    this.inputElement.addEventListener('input', () => {
      this.resizeInput();
    });

    this.inputElement.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        this.formElement?.requestSubmit();
      }
    });

    this.formElement.append(this.inputElement, this.submitElement);
    this.formElement.addEventListener('submit', (event) => {
      event.preventDefault();
      void this.sendMessage(this.inputElement?.value || '');
    });

    this.element.append(this.displayElement, this.latestUserElement, this.statusElement, this.formElement);
  }

  mount(stageElement: HTMLElement): void {
    if (this.element) {
      stageElement.append(this.element);
    }
  }

  unmount(): void {
    this.element?.remove();
  }

  open(): void {
    if (this.disabled || !this.element) {
      return;
    }

    this.opened = true;
    this.tips.disable();
    this.tips.idlePlayer?.stop();
    this.render();
    this.events.emit('chatOpen');
    setTimeout(() => {
      this.inputElement?.focus();
    }, 0);
  }

  close(): void {
    if (!this.opened) {
      return;
    }

    this.opened = false;
    this.loading = false;
    this.tips.enable();
    this.tips.clear();
    this.tips.idlePlayer?.start();
    this.render();
    this.events.emit('chatClose');
  }

  toggle(): void {
    if (this.opened) {
      this.close();
    } else {
      this.open();
    }
  }

  clearHistory(): void {
    this.messages = [];
    this.render();
  }

  async sendMessage(message: string): Promise<void> {
    const content = message.trim();

    if (this.disabled || !content || this.loading) {
      return;
    }

    if (!this.opened) {
      this.open();
    }

    this.messages.push({ role: 'user', content });

    if (this.inputElement) {
      this.inputElement.value = '';
    }

    const apiEndpoint = this.options.chat.apiEndpoint?.trim();

    if (!apiEndpoint) {
      this.addAssistantMessage('请先配置聊天接口');
      this.events.emit('chatError', '请先配置聊天接口');
      this.oml2d.statusBarPopup('请先配置聊天接口', 2500, this.oml2d.options.statusBar.errorColor);

      return;
    }

    this.loading = true;
    this.render();
    this.oml2d.statusBarOpen('思考中...');

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.options.chat.headers || {})
        },
        body: JSON.stringify({
          message: content,
          messages: this.buildRequestMessages(),
          character: this.character,
          page: window.location.href
        })
      });

      if (!response.ok) {
        throw new Error(`聊天接口请求失败: ${response.status}`);
      }

      const data = (await response.json()) as { reply?: string };
      const reply = data.reply?.trim();

      if (!reply) {
        throw new Error('聊天接口返回内容为空');
      }

      this.addAssistantMessage(reply);
      this.events.emit('chatReply', reply, this.chatMessages);
      this.oml2d.statusBarPopup('回复完成', 1200);
    } catch (error) {
      const messageText = error instanceof Error ? error.message : '聊天请求失败，请稍后重试';

      this.addAssistantMessage(messageText);
      this.events.emit('chatError', messageText);
      this.oml2d.statusBarPopup(messageText, 2500, this.oml2d.options.statusBar.errorColor);
    } finally {
      this.loading = false;
      this.render();
    }
  }

  private buildRequestMessages(): ChatRequestMessage[] {
    const requestMessages: ChatRequestMessage[] = [];
    const systemPrompt = this.options.chat.systemPrompt?.trim();

    if (systemPrompt) {
      requestMessages.push({ role: 'system', content: systemPrompt });
    }

    requestMessages.push(...this.messages.slice(-this.options.chat.maxHistory));

    return requestMessages;
  }

  private addAssistantMessage(content: string): void {
    this.messages.push({ role: 'assistant', content });
    this.render();
  }

  private resizeInput(): void {
    if (!this.inputElement) {
      return;
    }

    this.inputElement.style.height = 'auto';
    this.inputElement.style.height = `${Math.min(this.inputElement.scrollHeight, 132)}px`;
  }

  private get latestAssistantMessage(): string {
    return [...this.messages].reverse().find((message) => message.role === 'assistant')?.content || '';
  }

  private get latestUserMessage(): string {
    return [...this.messages].reverse().find((message) => message.role === 'user')?.content || '';
  }

  private get displayMessage(): string {
    if (this.loading) {
      return '思考中...';
    }

    return this.latestAssistantMessage || this.options.chat.greeting || '你好呀，想聊点什么？';
  }

  private render(): void {
    if (
      !this.element ||
      !this.displayElement ||
      !this.latestUserElement ||
      !this.statusElement ||
      !this.inputElement ||
      !this.submitElement
    ) {
      return;
    }

    this.element.style.display = this.opened ? 'flex' : 'none';
    this.inputElement.placeholder = this.options.chat.placeholder || '和我聊聊吧...';
    this.inputElement.disabled = this.loading;
    this.submitElement.disabled = this.loading;
    this.submitElement.textContent = this.loading ? '发送中' : this.options.chat.sendLabel || '发送';
    this.statusElement.textContent = this.loading ? '思考中...' : this.latestAssistantMessage ? '回复完成后可继续输入' : '';
    this.displayElement.textContent = this.displayMessage;
    this.latestUserElement.textContent = this.latestUserMessage ? `你：${this.latestUserMessage}` : '';
    this.latestUserElement.style.display = this.latestUserMessage ? 'block' : 'none';
    this.resizeInput();

    if (!this.opened) {
      return;
    }
  }
}
