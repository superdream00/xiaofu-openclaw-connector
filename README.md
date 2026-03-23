# 🦞 XiaoFu-OpenClaw Connector

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![NPM Version](https://img.shields.io/npm/v/xiaofu-openclaw-connector.svg)](https://www.npmjs.com/package/xiaofu-openclaw-connector)

> **将小芙助手 (XiaoFu Assistant) 进化为 OpenClaw 的原生前端外壳。**

`xiaofu-openclaw-connector` 是一个连接桌面端 AI 助手与 **OpenClaw** 的高性能桥梁。它利用 WebSocket 双向通信与独特的 **静默握手 (Silent Auth)** 技术，让您的 Agent 交互体验瞬间变得丝滑且安全。

---

## ✨ 核心特性

- 🛡️ **静默握手 (Silent Auth)**: 无需手动复制 Key。服务端自动生成随机 Token 并写入系统缓存目录，客户端自动读取并建立信任。
- 📡 **双向实时同步**: 基于 WebSocket，支持流式输出 (Streaming) 的实时渲染与指令下发。
- 📦 **npx 一键零配置安装**: 只需一条指令，即可完成 OpenClaw 插件的自动化部署。
- 🦾 **自动化重连**: 具备指数退避 (Exponential Backoff) 重连机制，确保链路永不断开。

---

## 🚀 快速开始

在您的 **OpenClaw 项目根目录** 下，执行以下指令：

```bash
npx xiaofu-openclaw-connector
```

该命令将自动：
1. 检测您的 OpenClaw 工作区环境。
2. 将 `xiaofu_channel` 插件部署到您的 `pulgins/` 或 `channels/` 目录。
3. 自动为您安装 `ws` 等运行依赖。

安装完成后，请在 `openclaw.json` 中配置并重启服务：

```json
"plugins": {
  "entries": {
    "xiaofu_channel": { "enabled": true }
  }
}
```

---

## 🔒 安全架构 (Silent Auth)

不同于传统的硬编码密钥，本连接器采用动态手印机制：
1. **XiaoFu Server**: 启动时随机生成 32 位 Token，并监听随机端口。
2. **手印生成**: 将鉴权信息写入本地安全目录（如 `%APPDATA%/.xiaofu_agent_auth.json`）。
3. **Silent Handshake**: OpenClaw 插件启动时会自动寻找该手印并完成 WebSocket 连接鉴权。

---

## 🛠️ 技术栈

- **Language**: TypeScript (Pure Node.js)
- **Protocol**: JSON over WebSocket
- **Discovery**: Local Filesystem Handshake
- **Installer**: Node.js CLI with `npx` Support

---

## 🤝 贡献与反馈

欢迎提交 Issue 或 Pull Request 来完善这个连接器！

- **GitHub**: [sangfor-ai/xiaofu-openclaw-connector](https://github.com/sangfor-ai/xiaofu-openclaw-connector)
- **Author**: Sangfor AI Team

---

© 2026 XiaoFu-OpenClaw Team. Released under the [MIT License](LICENSE).
