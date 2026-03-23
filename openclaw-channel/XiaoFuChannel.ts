import { WebSocket } from 'ws';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { AuthPayload, WsMessage } from '../shared/protocol';

/**
 * 🦞 XiaoFu OpenClaw Channel 插件
 * 职责: 读取本地静默握手文件，连接小芙助手 Server，接管 Agent 的 Ingress/Egress
 */
export default class XiaoFuChannel {
  private ws: WebSocket | null = null;
  private authFilePath: string;
  private isConnected: boolean = false;
  private reconnectDelay: number = 2000; // 重试延迟

  constructor() {
    this.authFilePath = path.join(os.homedir(), '.xiaofu_agent_auth.json');
  }

  /**
   * 启动 Channel 插件
   */
  public async start(): Promise<void> {
    console.log('📡 [OpenClaw Channel] 小芙原生外壳插件正在初始化...');
    this.tryConnect();
  }

  /**
   * 尝试读取鉴权文件并建立连接
   */
  private tryConnect(): void {
    if (this.isConnected) return;

    if (!fs.existsSync(this.authFilePath)) {
      console.warn(`⏳ [OpenClaw Channel] 尚未发现静默鉴权文件，5s 后重新扫描...`);
      setTimeout(() => this.tryConnect(), 5000);
      return;
    }

    try {
      // 1. 读取 Silent Auth 手印
      const configStr = fs.readFileSync(this.authFilePath, 'utf8');
      const auth: AuthPayload = JSON.parse(configStr);

      // 2. 建立加密连接
      const wsUrlWithToken = `${auth.wsUrl}?token=${auth.secureToken}`;
      console.log(`🔗 [OpenClaw Channel] 正在通过静默握手连接小芙助手: ${auth.wsUrl}`);
      
      this.ws = new WebSocket(wsUrlWithToken);

      this.ws.on('open', () => {
        this.isConnected = true;
        this.reconnectDelay = 2000; // 重置延迟
        console.log('✅ [OpenClaw Channel] 小芙原生外壳已成功挂载！');
      });

      this.ws.on('message', (data) => {
        try {
          const msg: WsMessage = JSON.parse(data.toString());
          this.onServerMessage(msg);
        } catch (e) {
          console.error('❌ [OpenClaw Channel] 消息解析解析错误:', e);
        }
      });

      this.ws.on('close', () => {
        this.isConnected = false;
        console.warn(`⚠️ [OpenClaw Channel] 连接断开，正在尝试重连...`);
        this.handleReconnect();
      });

      this.ws.on('error', (err) => {
        console.error(`❌ [OpenClaw Channel] 通信异常:`, err.message);
      });

    } catch (e) {
      console.error('❌ [OpenClaw Channel] 加载鉴权文件失败:', e);
      this.handleReconnect();
    }
  }

  /**
   * 指数退避重连逻辑
   */
  private handleReconnect(): void {
    const delay = Math.min(this.reconnectDelay, 30000); // 最大 30 秒
    this.reconnectDelay *= 1.5;
    setTimeout(() => this.tryConnect(), delay);
  }

  /**
   * 处理来自小芙 Server 的消息 (入站 Ingress)
   */
  private onServerMessage(msg: WsMessage) {
    if (msg.type === 'chat') {
       console.log('📥 [OpenClaw Channel] 收到 UI 指令:', msg.data.content);
       // 此处将指令转发给 OpenClaw Agent 核心...
    }
  }

  /**
   * 发送消息到小芙 Server (出站 Egress)
   */
  public sendToServer(type: WsMessage['type'], data: any) {
    if (this.ws && this.isConnected) {
      const msg: WsMessage = {
        type,
        data,
        timestamp: Date.now()
      };
      this.ws.send(JSON.stringify(msg));
    }
  }
}
