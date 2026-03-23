import { WebSocketServer, WebSocket } from 'ws';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { AuthPayload, WsMessage } from '../shared/protocol';

/**
 * 🦞 XiaoFu WebSocket Server
 * 职责: 监听 Agent 请求，实时渲染 UI，并负责生成本地静默握手文件
 */
export class XiaoFuWsServer {
  private wss: WebSocketServer | null = null;
  private currentToken: string = '';
  private authFilePath: string;

  constructor() {
    // 鉴权文件存放在用户家目录的隐藏文件中
    this.authFilePath = path.join(os.homedir(), '.xiaofu_agent_auth.json');
  }

  /**
   * 启动服务端
   * @param port 指定端口，0 表示自动分配
   */
  public async start(port: number = 0): Promise<void> {
    // 1. 生成随机的高强度 Token
    this.currentToken = this.generateToken(32);

    // 2. 实例化 WS Server
    this.wss = new WebSocketServer({ port });

    this.wss.on('listening', () => {
      const address: any = this.wss?.address();
      const actualPort = address.port;
      const wsUrl = `ws://127.0.0.1:${actualPort}`;

      console.log(`🚀 [XiaoFu Server] WebSocket 正在运行: ${wsUrl}`);
      console.log(`🔐 [XiaoFu Server] 令牌已就绪: ${this.currentToken}`);

      // 3. 写入本地静默握手文件 (Silent Auth Handshake)
      const payload: AuthPayload = {
        wsUrl,
        secureToken: this.currentToken,
        appVersion: '0.18.0' // 预定义版本
      };
      
      try {
        fs.writeFileSync(this.authFilePath, JSON.stringify(payload, null, 2));
        console.log(`✨ [XiaoFu Server] 静默鉴权文件已更新: ${this.authFilePath}`);
      } catch (err) {
        console.error(`❌ [XiaoFu Server] 写入鉴权文件失败: ${err}`);
      }
    });

    this.wss.on('connection', (ws: WebSocket, req) => {
      // 4. 强力鉴权校验 (Silent Auth Enforcement)
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const token = url.searchParams.get('token');

      if (token !== this.currentToken) {
        console.warn(`⚠️ [XiaoFu Server] 拦截到非法连接请求，令牌错误: ${token}`);
        ws.terminate();
        return;
      }

      console.log('✅ [XiaoFu Server] OpenClaw Channel 已成功通过静默握手接入！');

      ws.on('message', (rawData) => {
        try {
          const msg: WsMessage = JSON.parse(rawData.toString());
          this.handleInboundMessage(ws, msg);
        } catch (e) {
          console.error('❌ [XiaoFu Server] 消息解析失败:', e);
        }
      });
    });
  }

  /**
   * 处理来自 OpenClaw 的入站消息
   */
  private handleInboundMessage(ws: WebSocket, msg: WsMessage) {
    console.log(`📥 [XiaoFu Server] 收到消息 [${msg.type}]:`, msg.data);
    
    // 这里根据消息类型决定 UI 更新逻辑
    if (msg.type === 'chat') {
       // 更新聊天视图...
    }
  }

  /**
   * 生成随机令牌
   */
  private generateToken(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
       token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }
}
