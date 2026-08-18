---
layout: ../../layouts/MarkdownLayout.astro
title: 部署指南
description: 梁相的 npm 安装、GitHub Release 安装、源码自编译安装，以及 Windows、macOS、Linux 的常见问题处理方法。
eyebrow: 安装与恢复
aside: 优先使用 npm；也可选择 GitHub Release 或源码自编译。
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

梁相是 DeepSeek Harness WebUI 插件，支持 Windows、macOS 与 Linux。推荐通过 **npm 安装**；需要固定版本或离线安装时可使用 **GitHub Release**，需要修改或审查代码时可选择 **源码自编译安装**。

> 当前 npm 可安装版本：`dsh-liangxiang@0.8.0`。现阶段建议显式使用 `@beta` 安装。

<h2 id="install">选择安装方式</h2>

### 方式一：npm 安装（推荐）

需要 Node.js 22.19+（推荐 Node 24），并已安装 DeepSeek Harness。

1. 完全退出正在运行的 DeepSeek Harness WebUI。
2. 安装梁相并启动 DSH：

```bash
dsh plugin --profile web add dsh-liangxiang@beta
dsh web
```

3. 页面边缘出现“今日梁相”入口，即表示安装完成。

DSH 会从 npm registry 获取 `beta` 标签对应的版本。需要固定在指定版本时，将 `@beta` 替换为版本号，例如 `dsh-liangxiang@0.8.0`。

国内访问 npmjs 较慢或超时时，可改用 npmmirror：

```bash
npm config set registry https://registry.npmmirror.com
```

社区后端 `https://api.liang.today` 位于香港，由本机 DeepSeek Harness 直连。连不上时插件不会卡住整个 WebUI，几秒后进入主界面并提示“无法连接天庭”，随后自动重连。源码自编译依赖 GitHub，在内地不稳定时请优先使用 npm 安装。

### 方式二：GitHub Release 安装

这种方式适合保存离线安装包或固定版本。前往[插件 Releases 页面](https://github.com/liang-today/dsh-liangxiang/releases)，下载目标版本的 `dsh-liangxiang-<version>.tgz`；目标版本尚未提供安装包时，请使用 npm 安装。

1. 完全退出正在运行的 DeepSeek Harness WebUI。
2. 在安装包所在目录安装梁相并启动 DSH：

```bash
dsh plugin --profile web add ./dsh-liangxiang-<version>.tgz
dsh web
```

3. 页面边缘出现“今日梁相”入口，即表示安装完成。

### 方式三：源码自编译安装

这种方式面向需要阅读、修改或参与开发的用户。需要 Node.js 22.19+（推荐 Node 24）、pnpm 10+ 与 Git。

```bash
git clone https://github.com/liang-today/dsh-liangxiang.git
cd dsh-liangxiang
corepack enable
pnpm install
pnpm run verify
pnpm run dev:install
pnpm run dev:web
```

默认访问地址为 `http://127.0.0.1:3080`。源码自编译安装使用独立的开发 profile，不会改动日常使用的 DeepSeek Harness profile。

Windows 用户请在 Git Bash 或 WSL 中运行源码自编译命令。

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
dsh --profile web --dump-config
```

3. 确认配置中包含 `dsh-liangxiang`，随后重新启动 WebUI。
4. 页面仍未更新时，执行一次浏览器强制刷新。

**源码自编译命令无法运行**

源码自编译脚本需要 Git Bash 或 WSL。先在对应终端确认以下命令可用：

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
dsh --profile web --dump-config
```

确认启动 WebUI 时使用的 profile 与安装插件时一致，然后完全退出并重新启动 WebUI。

### Linux

**配置正确但页面没有加载插件**

```bash
id
dsh --profile web --dump-config
```

确认安装插件与启动 WebUI 使用同一系统用户、同一 profile。通过 systemd 或容器运行时，重启对应服务或容器后再刷新页面。

### 三个平台都适用

**npm 无法下载梁相**

```bash
npm view dsh-liangxiang@beta version
```

能够返回版本号时，表示 npm registry 可用。若命令报错，请检查网络、代理与 npm registry 设置，再重新执行安装命令。

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

当覆盖安装后仍显示旧版本时，完全退出 WebUI，先卸载旧版本，再从 npm 安装最新版本：

```bash
dsh plugin --profile web remove dsh-liangxiang
dsh plugin --profile web add dsh-liangxiang@beta
dsh web
```

使用 GitHub Release 安装包时，将第二条命令替换为：

```bash
dsh plugin --profile web add ./dsh-liangxiang-<version>.tgz
```

源码环境可以运行：

```bash
pnpm run dev:uninstall
pnpm run dev:install
```

重新安装完成后，完全退出并重新启动 WebUI，再执行一次浏览器强制刷新。

问题仍未解决时，请在[插件仓库](https://github.com/liang-today/dsh-liangxiang)提交 Issue，附上操作系统、Node/DSH 版本、profile 名称与已经脱敏的错误提示。公开内容中请勿包含 API key、口令或完整日志。
