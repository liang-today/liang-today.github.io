---
layout: ../../layouts/MarkdownLayout.astro
title: 部署指南
description: 梁相的 Release 安装、源码安装，以及 Windows、macOS、Linux 的常见问题处理方法。
eyebrow: 安装与恢复
aside: 先选择 Release 或源码安装；遇到问题，再查看对应操作系统。
sections:
  - href: '#install'
    label: 选择安装方式
  - href: '#incense'
    label: 香火怎么算
  - href: '#troubleshooting'
    label: 按系统排障
  - href: '#reinstall'
    label: 重新安装
---

# 部署指南

梁相是 DeepSeek Harness WebUI 插件，支持 Windows、macOS 与 Linux。正式发布后优先使用 **Release 安装**；当前预览版本可以通过 **源码安装**体验。

> 梁相目前为 0.6.0 RC，公开 Release 尚未发布。

<h2 id="install">选择安装方式</h2>

### 方式一：Release 安装（正式发布后推荐）

1. 前往[插件 Releases 页面](https://github.com/NiYa193/dsh-liang-meter/releases)，下载 `dsh-liangxiang-<version>.tgz`。
2. 关闭正在运行的 DeepSeek Harness WebUI。
3. 将安装包加入日常使用的 profile。`<profile>` 替换为你的 profile 名称：

```bash
dsh plugin --profile <profile> add ./dsh-liangxiang-<version>.tgz
dsh --profile <profile> --dump-config
```

4. 配置中出现 `dsh-liangxiang` 后，重新启动 WebUI。
5. 页面边缘出现“今日梁相”入口，即表示安装完成。

### 方式二：源码安装（当前可用）

需要 Node.js 22.19+（推荐 Node 24）与 pnpm 10+。

```bash
git clone https://github.com/NiYa193/dsh-liang-meter.git
cd dsh-liang-meter
corepack enable
pnpm install
pnpm run verify
pnpm run dev:install
pnpm run dev:web
```

默认访问地址为 `http://127.0.0.1:3080`。这套安装会使用独立的开发 profile，不会改动日常使用的 DeepSeek Harness profile。

Windows 用户请在 Git Bash 或 WSL 中运行源码安装命令。

<h2 id="incense">香火怎么算</h2>

梁相按 DeepSeek Harness 提供的 **Input Token + Output Token**凝香。默认每累计 **50,000 Pro 当量**获得一炷香。

| 模型 | 折算权重 | 每炷大约需要 |
|---|---:|---:|
| V4-Pro | ×1 | 50,000 Token |
| V4-Flash | ×0.5 | 100,000 Token |
| 其他模型 | ×0.5 | 100,000 Token |

一炷香可以投一次“夯”或“拉”。两个方向共用同一份香火。

<h2 id="troubleshooting">按系统排障</h2>

### Windows

**入口没有出现**

1. 完全关闭 WebUI 窗口和所有正在运行 DeepSeek Harness 的终端。
2. 在 PowerShell 查看当前 profile：

```powershell
dsh --profile <profile> --dump-config
```

3. 确认配置中包含 `dsh-liangxiang`，随后重新启动 WebUI。
4. 页面仍未更新时，执行一次浏览器强制刷新。

**源码安装命令无法运行**

源码安装脚本需要 Git Bash 或 WSL。先在对应终端确认以下命令可用：

```bash
node --version
pnpm --version
dsh --version
```

### macOS

**终端找不到 Node、pnpm 或 dsh**

```bash
command -v node
command -v pnpm
command -v dsh
```

关闭并重新打开终端，使新安装的命令行路径生效。Apple Silicon 与 Intel 环境请使用同一套 Node 安装路径。

**插件已安装但入口没有出现**

```bash
dsh --profile <profile> --dump-config
```

确认启动 WebUI 时使用的 profile 与安装插件时一致，然后完全退出并重新启动 WebUI。

### Linux

**配置正确但页面没有加载插件**

```bash
id
dsh --profile <profile> --dump-config
```

确认安装插件与启动 WebUI 使用同一系统用户、同一 profile。通过 systemd 或容器运行时，重启对应服务或容器后再刷新页面。

### 三个平台都适用

**入口被拖到屏幕外**

在浏览器开发者工具中执行：

```js
localStorage.removeItem('liangxiang:badge-position:v1')
```

这只恢复悬浮入口的位置，不会改变香火或投票结果。

**显示“未连上梁相服务”**

在浏览器打开 `https://api.liang.today/v1/health`。能够看到服务状态但插件仍无法连接时，请检查本机代理、防火墙与系统时间。

**香火一直是 0**

第一炷需要 50,000 Pro 当量；V4-Flash 与其他模型大约需要 100,000 原始 Token。用量达到门槛后，香火会自动更新。

<h2 id="reinstall">重新安装</h2>

当覆盖安装后仍显示旧版本时，先完整卸载，再安装目标版本：

```bash
dsh plugin --profile <profile> remove dsh-liangxiang
dsh plugin --profile <profile> add ./dsh-liangxiang-<version>.tgz
dsh --profile <profile> --dump-config
```

源码环境可以运行：

```bash
pnpm run dev:uninstall
pnpm run dev:install
```

重新安装完成后，完全退出并重新启动 WebUI，再执行一次浏览器强制刷新。

问题仍未解决时，请在[插件仓库](https://github.com/NiYa193/dsh-liang-meter)提交 Issue，附上操作系统、Node/DSH 版本、profile 名称与已经脱敏的错误提示。公开内容中请勿包含 API key、口令或完整日志。
