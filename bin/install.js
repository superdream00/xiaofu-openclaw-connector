#!/usr/bin/env node

/**
 * 🦞 XiaoFu OpenClaw Channel 一键安装程序 (Installer)
 * 职责: 将插件文件自动分发至用户的 OpenClaw 目录，并处理环境依赖
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n🚀 [XiaoFu Installer] 正在为您的一键部署开启“小芙原生外壳”模型...\n');

// 1. 定位当前工作目录 (用户的 OpenClaw 根路径)
const targetRoot = process.cwd();
const targetPackageJson = path.join(targetRoot, 'package.json');

if (!fs.existsSync(targetPackageJson)) {
  console.error('❌ 错误: 未能在当前目录找到 OpenClaw 的 package.json。请在 OpenClaw 根目录下运行此命令！');
  process.exit(1);
}

// 2. 检测 OpenClaw 插件目录
const channelsDir = path.join(targetRoot, 'channels');
const pluginsDir = path.join(targetRoot, 'plugins');

let deployDir = '';
if (fs.existsSync(channelsDir)) {
  deployDir = path.join(channelsDir, 'xiaofu_channel');
} else if (fs.existsSync(pluginsDir)) {
  deployDir = path.join(pluginsDir, 'xiaofu_channel');
} else {
  // 兜底创建新的 plugins 目录
  deployDir = path.join(targetRoot, 'plugins', 'xiaofu_channel');
}

console.log(`📡 [XiaoFu Installer] 部署目标已确定: ${deployDir}`);

// 3. 执行文件拷贝
try {
  if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir, { recursive: true });
  }

  // 计算源文件路径 (基于本 npm 包的根路径)
  const srcChannel = path.join(__dirname, '../openclaw-channel/XiaoFuChannel.ts');
  const srcProtocol = path.join(__dirname, '../shared/protocol.ts');
  
  // 拷贝插件主体
  fs.copyFileSync(srcChannel, path.join(deployDir, 'XiaoFuChannel.ts'));
  
  // 拷贝协议文件 (放置在插件内部的 shared 下)
  const targetShared = path.join(deployDir, 'shared');
  if (!fs.existsSync(targetShared)) {
    fs.mkdirSync(targetShared, { recursive: true });
  }
  fs.copyFileSync(srcProtocol, path.join(targetShared, 'protocol.ts'));

  console.log('✅ [XiaoFu Installer] 插件文件已成功同步！');
} catch (err) {
  console.error(`❌ [XiaoFu Installer] 文件拷贝失败: ${err.message}`);
  process.exit(1);
}

// 4. 处理依赖项 (确保用户 OpenClaw 项目中有 ws)
console.log('📦 [XiaoFu Installer] 正在为您补齐 WebSocket 运行依赖...');
try {
  execSync('npm install ws', { stdio: 'inherit', cwd: targetRoot });
  console.log('✅ [XiaoFu Installer] 依赖项已成功就绪！');
} catch (err) {
  console.warn('⚠️ [XiaoFu Installer] 自动安装依赖失败，请手动执行: npm install ws');
}

console.log('\n🎉 [XiaoFu Installer] 恭喜！安装已完成。');
console.log('👉 请在您的 OpenClaw 配置文件中启用 "xiaofu_channel" 插件并重启。');
console.log('👉 更多信息请访问: https://github.com/sangfor-ai/xiaofu-openclaw-connector\n');
