/**
 * 🦞 XiaoFu-OpenClaw 共享通信协议 (Shared Protocol)
 * 版本: 1.0.0
 * 职责: 定义 WebSocket 双向传输的 JSON 格式与鉴权负载
 */

/**
 * WebSocket 消息包装接口
 */
export interface WsMessage {
  type: 'auth' | 'chat' | 'log' | 'status' | 'error' | 'ack';
  data: any;
  timestamp: number;
  messageId?: string;
}

/**
 * 静默握手 (Silent Auth) 鉴权负载
 * 该对象将被写入本地的 .xiaofu_agent_auth.json
 */
export interface AuthPayload {
  wsUrl: string;       // 例如: ws://127.0.0.1:18080
  secureToken: string; // 动态生成的随机令牌
  appVersion: string;  // 小芙助手版本
}

/**
 * 示例消息格式:
 * {
 *   "type": "chat",
 *   "data": { "role": "user", "content": "你好" },
 *   "timestamp": 1711180000000
 * }
 */
