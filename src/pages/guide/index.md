---
layout: ../../layouts/MarkdownLayout.astro
title: 部署指南
description: 把梁相装进 DeepSeek Harness：安装、升级、卸载，以及香火怎么算。
eyebrow: 部署指南
aside: 装好后，页面边缘会出现「今日梁相」。升级和卸载都不会删账本。
sections:
  - href: '#install'
    label: 安装
  - href: '#upgrade'
    label: 升级
  - href: '#uninstall'
    label: 卸载
  - href: '#reset'
    label: 清空数据
  - href: '#incense'
    label: 香火
  - href: '#faq'
    label: 常见问题
---

# 部署指南

梁相是 DeepSeek Harness 的 WebUI 插件。当前版本 **v0.8.11-beta**，请安装 `dsh-liangxiang@beta`。

改插件前先退出 WebUI，做完再打开，并刷新一次。没有全局 `dsh` 时，把命令里的 `dsh` 换成 `npx --yes @deepseek-ai/dsh`。`web` 若不是你的 profile 名，换成实际名字。

<h2 id="install">安装</h2>

<h3 id="market">插件市场</h3>

打开 WebUI → **设置 → 插件市场** → 搜索 `liangxiang` → 安装。刷新后，页面边缘出现「今日梁相」即表示装好。

如果还没有插件市场：

```bash
npx --yes @deepseek-ai/dsh plugin --profile web add dshmarket
npx --yes @deepseek-ai/dsh web
```

再用上面的步骤搜索安装。用 DSH Desktop 时，先看下面的 [Desktop](#desktop)。

![在插件市场搜索 liangxiang](/guide/dshmarket-search-liangxiang.jpg)

也已列入 [1024 Store](https://deepseek1024.com/) 和 [awesome-deepseek-harness](https://github.com/Dominic789654/awesome-deepseek-harness)。

<h3 id="cli">命令行</h3>

```bash
npx --yes @deepseek-ai/dsh plugin --profile web add dsh-liangxiang@beta
npx --yes @deepseek-ai/dsh web
```

已有全局 `dsh` 时，把开头换成 `dsh` 即可。不要运行 `npm i dsh-liangxiang`，那不会进入 DSH。不要写成 `@0.8.0`。

国内 npm 慢时：`npm config set registry https://registry.npmmirror.com`

<h3 id="tarball">本地安装包</h3>

从 [Releases](https://github.com/liang-today/dsh-liangxiang/releases) 下载 `.tgz`，进入该目录后必须写成 `./文件名`：

```bash
export DSH_HOME="$HOME/.dsh"
cd "$HOME/Desktop/liangxiang"
dsh plugin --profile web add ./dsh-liangxiang-0.8.11-beta.tgz
dsh web
```

<h3 id="desktop">DSH Desktop</h3>

Desktop 读的是自己的家目录。先退出 Desktop，再在 PowerShell 里：

```powershell
$env:DSH_HOME = "$env:APPDATA\dsh-desktop\harness"
$env:PATH = "$env:DSH_HOME\.desktop-bin;$env:PATH"
dsh plugin --profile web add dsh-liangxiang@beta
```

然后打开 Desktop，刷新一次。macOS 若家目录不在 `~/.dsh`，先在 Desktop 的设置里确认 harness 路径，再 `export DSH_HOME=那个路径`。

<h2 id="upgrade">升级</h2>

退出 WebUI，再执行和安装相同的命令，仍然写 `@beta`。账本不会被删掉。

如果界面还是旧版本，先卸载再安装：

```bash
npx --yes @deepseek-ai/dsh plugin --profile web remove dsh-liangxiang
npx --yes @deepseek-ai/dsh plugin --profile web add dsh-liangxiang@beta
npx --yes @deepseek-ai/dsh web
```

<h2 id="uninstall">卸载</h2>

```bash
dsh plugin --profile web remove dsh-liangxiang
```

只拿走插件，不会删除本机账本，也不会清浏览器里的位置和偏好。

<h2 id="reset">清空数据</h2>

这会丢掉本机身份、离线玩法和界面偏好。已经交到社区的票还在。

1. 退出 WebUI。
2. 删除账本：

```bash
rm -f ~/.dsh/storages/liangxiang.json ~/.dsh/storages/liangxiang_local.json
```

3. 重新打开 WebUI，在控制台执行：

```js
localStorage.removeItem('liangxiang:badge-position:v2')
localStorage.removeItem('liangxiang:welcome:v2')
localStorage.removeItem('liangxiang:sound:level')
location.reload()
```

macOS 用 Chrome / Edge 时按 <kbd>⌘</kbd> <kbd>⌥</kbd> <kbd>J</kbd>；Windows 按 <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>J</kbd>。只想把入口拖回画面，执行第一行即可。

<h2 id="incense">香火</h2>

按 DeepSeek Harness 的 **Input + Output Token** 折算。默认每 **50,000 Pro 当量**凝成一炷。一炷可夯可拉。

| 模型 | 权重 | 大约需要 |
|---|---:|---:|
| V4-Pro | ×1 | 50,000 Token |
| V4-Flash / 其他 | ×0.5 | 100,000 Token |

<span id="troubleshooting"></span>
<h2 id="faq">常见问题</h2>

**提示没有 `dsh` 命令**  
用 `npx --yes @deepseek-ai/dsh`，不必先全局安装。

**报 `ERR_PNPM_FETCH_404`**  
本地包要写成 `./dsh-liangxiang-0.8.11-beta.tgz`。走网上安装请写 `dsh-liangxiang@beta`。

**设置里找不到插件市场**  
先退出 WebUI，执行 `dsh plugin --profile web add dshmarket`，再打开并刷新。

**Desktop 里命令成功，但没有「今日梁相」**  
插件装进了默认的 `~/.dsh`，Desktop 不读那里。按 [Desktop](#desktop) 设好家目录再装一次。

**页面上没有入口**  
确认安装和启动用了同一个 profile。退出后重开，再强制刷新。

**入口被拖出画面**  
打开控制台，执行：

```js
localStorage.removeItem('liangxiang:badge-position:v2')
```

**显示「无法连接天庭」**  
浏览器打开 [api.liang.today/v1/health](https://api.liang.today/v1/health)。能打开但插件仍连不上时，检查代理、防火墙和系统时间。可在案牍改用离线模式。

**香火一直是 0**  
第一炷需要 50,000 Pro 当量，用量到了会自己更新。

仍未解决时，到 [插件仓库](https://github.com/liang-today/dsh-liangxiang) 开 Issue。写明系统、Node / DSH 版本和已经脱敏的错误，不要附 API key 或完整日志。
