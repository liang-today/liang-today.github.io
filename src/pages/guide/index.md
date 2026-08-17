---
layout: ../../layouts/MarkdownLayout.astro
title: 部署指南
description: 梁相的 Release 安装、源码开发安装，以及 Windows、macOS、Linux 的排障与安全重置方法。
eyebrow: 安装与恢复
aside: 先选择 Release 或开发模式；遇到异常，再进入对应操作系统的处理区。
sections:
  - href: '#install'
    label: 选择安装方式
  - href: '#incense'
    label: 香火怎么算
  - href: '#troubleshooting'
    label: 按系统排障
  - href: '#reset'
    label: 安全重置
---

# 部署指南

梁相是 DeepSeek Harness WebUI 插件，当前版本为 **0.6.0 RC**。安装只分两种：正式发布后优先使用 **Release 模式**；参与开发或提前体验时使用 **开发模式**。

> 当前尚未发布公开 GitHub Release。现在要安装，请直接使用开发模式；Release 区已经按未来正式包的使用方式写好。

<h2 id="install">选择安装方式</h2>

### 方式一：Release 模式（正式发布后推荐）

适合只想使用梁相、不需要修改源码的用户。

1. 在[插件仓库的 Releases 页面](https://github.com/NiYa193/dsh-liang-meter/releases)下载 `dsh-liangxiang-<version>.tgz`。
2. 关闭正在运行的 DeepSeek Harness WebUI。
3. 将安装包加入你实际使用的 profile：

```bash
dsh plugin --profile <profile> add ./dsh-liangxiang-<version>.tgz
dsh --profile <profile> --dump-config
```

4. 在配置输出中确认只有 `dsh-liangxiang`，然后重新启动 WebUI。
5. 页面边缘应出现以当前梁子状态为图标的“今日梁相”入口。

升级时先移除旧包，再安装新包，避免旧进程或旧 bundle 继续驻留：

```bash
dsh plugin --profile <profile> remove dsh-liangxiang
dsh plugin --profile <profile> add ./dsh-liangxiang-<new-version>.tgz
```

`dsh-liangbiao` 是旧技术包名。如果配置中仍有它，也应精确移除；不要直接删除整个 profile。

### 方式二：开发模式（当前可用）

适合从源码体验、调试或参与开发。需要 Node.js 22.19+（推荐 Node 24）和 pnpm 10+。

```bash
git clone https://github.com/NiYa193/dsh-liang-meter.git
cd dsh-liang-meter
corepack enable
pnpm install
pnpm run verify
pnpm run dev:install
pnpm run dev:web
```

默认打开 `http://127.0.0.1:3080`。开发脚本使用仓库内独立的 `.dsh-home` 与 `liangxiang-dev` profile，不会修改你日常使用的 DeepSeek Harness 配置。

Windows 请在 **Git Bash 或 WSL** 中运行仓库里的开发脚本；普通安装、卸载与配置检查命令仍可在 PowerShell 中运行。

开发环境需要卸载时：

```bash
pnpm run dev:uninstall
```

<h2 id="incense">香火怎么算</h2>

梁相使用 DeepSeek Harness 提供的 **Input Token + Output Token**。默认每累计 **50,000 Pro 当量**凝成一炷香。

| 模型 | 折算权重 | 大约需要的原始 Token |
|---|---:|---:|
| V4-Pro | ×1 | 50,000 / 炷 |
| V4-Flash | ×0.5 | 100,000 / 炷 |
| 其他或无法识别的模型 | ×0.5 | 100,000 / 炷 |

一炷香就是一次“夯”或“拉”。两个方向共用同一份个人香火，不会分别记账。

<h2 id="troubleshooting">按系统排障</h2>

无论使用哪个系统，先完成三项快速检查：

```bash
node --version
dsh --version
dsh --profile <profile> --dump-config
```

Node 版本应满足 22.19+；有效配置应包含 `dsh-liangxiang`，且不应同时残留 `dsh-liangbiao`。

### Windows

**仍显示旧版本或旧入口**

1. 关闭 WebUI 窗口，以及所有运行 `dsh web` 的 PowerShell、命令提示符、Git Bash 或 WSL 终端。
2. 在 PowerShell 精确移除新旧包名：

```powershell
dsh plugin --profile <profile> remove dsh-liangxiang
dsh plugin --profile <profile> remove dsh-liangbiao
dsh --profile <profile> --dump-config
```

3. 重新安装目标版本并完全重启 WebUI；页面仍旧时执行一次浏览器强制刷新。

**所有工具调用都报 `reading 'prepare'`**

这通常意味着 profile 里重复安装了 DeepSeek Harness 自带的 WebUI 包。在插件源码目录运行：

```powershell
node .\scripts\assert-profile-modules.mjs <DSH_HOME>\profiles\<profile>
```

若报告 `@deepseek-ai/dsh-web-app` 被重复安装，只移除这个精确依赖，然后重启 WebUI；不要删除整个 profile。

### macOS

**终端找不到 `dsh` 或 `pnpm`**

先关闭并重开终端，让新安装的 Node 与 Corepack 路径生效，再检查：

```bash
command -v node
command -v pnpm
command -v dsh
```

Apple Silicon 与 Intel 机器不要混用两套 Node 安装路径。确认 `node`、`pnpm`、`dsh` 来自同一套环境后，再重新安装插件。

**插件已安装但入口不出现**

```bash
dsh --profile <profile> --dump-config
curl -I http://127.0.0.1:<webui>/plugins/dsh-liangxiang/client.js
```

配置应包含插件，资源请求应返回 `200`。否则通常是启动了另一个 profile，或旧 WebUI 进程尚未退出。

### Linux

**配置正确但页面仍加载不到插件**

先确认启动 WebUI 的用户、安装插件的用户和 profile 一致：

```bash
id
dsh --profile <profile> --dump-config
curl -I http://127.0.0.1:<webui>/plugins/dsh-liangxiang/client.js
```

使用 systemd 或容器启动 DeepSeek Harness 时，还要确认服务实际继承了同一个 `DSH_HOME` 与 profile。修改后重启对应用户服务或容器，不要只刷新浏览器。

### 三个平台都适用

**入口可能被拖到屏幕外**：在浏览器开发者工具中执行下列一行，只重置悬浮入口位置，不会清除香火或投票：

```js
localStorage.removeItem('liangxiang:badge-position:v1')
```

**面板显示未连上服务**：先确认其他网页可以访问 `https://api.liang.today/v1/health`。社区节点正常而插件仍失败时，优先检查本机代理、防火墙与系统时间。

**香火一直是 0**：第一炷需要 50,000 Pro 当量；Flash 与其他模型需要约 100,000 原始 Token。先确认当天确实产生了足够用量。

<h2 id="reset">安全重置</h2>

按问题选择最小范围的重置，不要把“清缓存”理解成删除整个 DeepSeek Harness 配置。

| 目的 | 操作 | 不会影响 |
|---|---|---|
| 重置悬浮位置 | 删除 `liangxiang:badge-position:v1` | 香火、身份、投票 |
| 卸载开发插件 | `pnpm run dev:uninstall` | 其他 profile |
| 重铸本机安装身份 | `pnpm run reset:identity` | 已产生的 Token 水位与社区历史 |
| 清本地演示账本 | `pnpm run reset:staging -- --local` | 社区节点数据 |

重铸身份后不会自动继承旧身份在社区节点上的关联。若看到 `409 device_conflict`，应按插件仓库的身份恢复流程处理，不要反复制造新身份绕过限制。

仍无法恢复时，请在[插件仓库](https://github.com/NiYa193/dsh-liang-meter)提交问题，并附上操作系统、Node/DSH 版本、profile 名称与已脱敏的错误信息；不要公开 API key、社区口令、安装私钥或完整日志。
