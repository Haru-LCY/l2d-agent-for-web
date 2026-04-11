export type EventFn = (...arg) => void | Promise<void>;
export type EventType = 'load' | 'hit' | 'stageSlideIn' | 'stageSlideOut' | 'chatOpen' | 'chatClose' | 'chatReply' | 'chatError';
export type LoadEventFn = (status: 'loading' | 'success' | 'fail') => void | Promise<void>;
