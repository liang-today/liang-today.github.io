---
layout: ../../layouts/MarkdownLayout.astro
title: 部署指南
description: 梁相的安装、升级、卸载、清空本地数据，以及常见问题排障。
eyebrow: 部署指南
aside: 先退出 WebUI，再改插件。升级和卸载都不会删账本。
sections:
  - href: '#install'
    label: 安装
  - href: '#upgrade'
    label: 升级
  - href: '#uninstall'
    label: 卸载
  - href: '#reset'
    label: 清空本地数据
  - href: '#incense'
    label: 香火怎么算
  - href: '#console'
    label: 打开控制台
  - href: '#troubleshooting'
    label: 排障
---

# 部署指南

梁相是 DeepSeek Harness WebUI 插件。需要 Node.js `22.19+`（推荐 24），以及已经能打开的 DSH。

**每次改插件前，先完全退出 WebUI。** 做完再启动，并强制刷新一次页面。`web` 若不是你的 profile，换成实际名字。

全局装过 DSH 就写 `dsh`；否则把下面的 `dsh` 整段换成 `npx --yes @deepseek-ai/dsh`。

> 当前版本 **v0.8.8-beta**。远程安装请写 `dsh-liangxiang@beta`，不要写 `@0.8.0`。

<h2 id="install">安装</h2>

页面边缘出现「今日梁相」，即表示装好。

### npm（推荐）

```bash
npx --yes @deepseek-ai/dsh plugin --profile web add dsh-liangxiang@beta
npx --yes @deepseek-ai/dsh web
```

已全局安装 `dsh` 时，把开头换成 `dsh` 即可。不要运行 `npm i dsh-liangxiang`：那只会装进当前目录的 `node_modules`，不会进入 DSH。不要钉死某一号。

装好后，案牍会连接社区后端 `https://api.liang.today`。国内 npm 慢时：`npm config set registry https://registry.npmmirror.com`

### 本地安装包

先进入包所在目录，必须写 **`./文件名.tgz`**。少写 `./` 时，pnpm 会把文件名当成 npm 包名去拉并报 404。走 npm 请写 `dsh-liangxiang@beta`。子命令是 `plugin add`，不是 `web add`。

```bash
export DSH_HOME="$HOME/.dsh"
cd "$HOME/Desktop/liangxiang"
dsh plugin --profile web add ./dsh-liangxiang-0.8.8-beta.tgz
dsh web
```

安装包来自 [Releases](https://github.com/liang-today/dsh-liangxiang/releases) 或桌面分发目录。

### 源码

独立开发 profile，不改日常 DSH。Windows 请用 Git Bash 或 WSL。

```bash
git clone https://github.com/liang-today/dsh-liangxiang.git
cd dsh-liangxiang
pnpm install && pnpm run dev:install && pnpm run dev:web
```

默认地址 `http://127.0.0.1:3080`。

<h2 id="upgrade">升级</h2>

先完全退出 WebUI。升级不会删除香火账本。

`@beta` 偶尔装不到最新，两个原因都在 pnpm，不在插件：

- `plugin add` 只把命令转给 pnpm，pnpm 会把解析到的精确号写进 profile（`@beta` 变成 `0.8.5-beta`）；下次再 `add @beta` 就报 Already up to date。
- pnpm 11 有 24 小时冷静期：发布不足一天的新版本会被跳过，退回上一个够龄版本。

解决方式：让 profile 一直跟踪浮动 `beta`，并把本包排除出冷静期——0.8.6 起插件启动时自动完成。已经钉死的机器先卸再装一次；想在新版本发布当天就装上，从 GitHub Release 拿 `.tgz` 装一次即可（启动后同样切回 `@beta`）。

安装和升级都写 `@beta`，不要钉某一号。若以前装过本地包或旧精确号，先卸再装：

```bash
export DSH_HOME="$HOME/.dsh"
npx --yes @deepseek-ai/dsh plugin --profile web remove dsh-liangxiang
npx --yes @deepseek-ai/dsh plugin --profile web add dsh-liangxiang@beta
npx --yes @deepseek-ai/dsh web
```

已全局安装 `dsh` 时，把开头换成 `dsh` 即可。装完强制刷新。插件启动后会把 profile 依赖改成浮动的 `beta`，并排除 pnpm 11 对新年份的 24 小时冷静期。若还没启动过带此逻辑的版本，也可自己在 `$DSH_HOME/profiles/web/pnpm-workspace.yaml` 加上：

```yaml
minimumReleaseAgeExclude:
  - dsh-liangxiang
```

然后再执行一次 `add @beta`。

<h2 id="uninstall">卸载</h2>

```bash
dsh plugin --profile web remove dsh-liangxiang
```

源码开发：`pnpm run dev:uninstall`

卸载只拿走插件，**不会**删除 `~/.dsh/storages` 里的账本，也不会清浏览器偏好。

<h2 id="reset">清空本地数据</h2>

这会丢掉本机身份、离线玩法和界面偏好。社区已经收下的票仍留在服务器，不会被这条命令抹掉。

1. 完全退出 WebUI。
2. 删除本机账本：

```bash
rm -f ~/.dsh/storages/liangxiang.json ~/.dsh/storages/liangxiang_local.json
```

3. 重新打开 WebUI，按[打开控制台](#console)，执行：

```js
localStorage.removeItem('liangxiang:badge-position:v2')
localStorage.removeItem('liangxiang:welcome:v2')
localStorage.removeItem('liangxiang:sound:level')
location.reload()
```

只想把入口拖回画面，只执行第一行即可。

<h2 id="incense">香火怎么算</h2>

按 DeepSeek Harness 的 **Input + Output Token** 折算。默认每 **50,000 Pro 当量**凝成一炷。一炷可夯可拉，两边共用。

| 模型 | 权重 | 大约需要 |
|---|---:|---:|
| V4-Pro | ×1 | 50,000 Token |
| V4-Flash / 其他 | ×0.5 | 100,000 Token |

<h2 id="console">打开控制台</h2>

先让 DeepSeek Harness 网页处于最前，再按快捷键。打开后点 **Console / 控制台**，再粘贴命令。

| 系统 | Chrome / Edge | Firefox | Safari |
|---|---|---|---|
| macOS | <kbd>⌘</kbd> <kbd>⌥</kbd> <kbd>J</kbd> | <kbd>⌘</kbd> <kbd>⌥</kbd> <kbd>K</kbd> | 先打开「开发」菜单，再 <kbd>⌘</kbd> <kbd>⌥</kbd> <kbd>C</kbd> |
| Windows / Linux | <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>J</kbd> | <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>K</kbd> | — |

Safari 需先到「设置 → 高级」勾选「在菜单栏中显示开发菜单」。`F12` 在 Windows 上通常也能打开开发者工具。

<h2 id="troubleshooting">排障</h2>

### 安装失败

**报 `ERR_PNPM_FETCH_404`**  
本地包被当成了 npm 名字。先 `cd` 到包目录，写成 `./dsh-liangxiang-0.8.8-beta.tgz`。走 npm 请写 `dsh-liangxiang@beta`，不要把本地文件名当成包名。

**提示没有 `dsh` 命令**  
改用 `npx --yes @deepseek-ai/dsh`，不必先全局安装。

**写成了 `dsh web add …`**  
`web` 是启动界面。安装用 `plugin add`。

**npm 下不动**  

```bash
npm view dsh-liangxiang@beta version
```

能返回版本号再装。否则检查网络、代理，或改用 npmmirror。

### 打不开或页面是黑的

**`EADDRINUSE … 3080`**  
旧的 DSH 还占着端口。先打开 `http://127.0.0.1:3080/`；打不开就结束旧进程再启动。

```bash
lsof -nP -iTCP:3080 -sTCP:LISTEN
```

**端口在听，网页却是空的 / 400**  
多半是跑了一夜的旧进程。停掉后重新 `dsh web`。

**源码脚本在 Windows 跑不起来**  
换 Git Bash 或 WSL，并确认 `node`、`pnpm` 可用。

### 入口不对

**配置里有插件，页面没有入口**  
确认安装和启动用了同一个 profile、同一个系统用户。完全退出后重启，再强制刷新。

```bash
dsh --profile web --dump-config
```

**入口被拖出画面**  
打开控制台，执行：

```js
localStorage.removeItem('liangxiang:badge-position:v2')
```

**案牍仍显示旧版本（例如 `v0.8.3-beta`）**  
profile 里钉着旧精确号或本地 `.tgz`。只重复 `add @beta` 会显示 Already up to date。按[升级](#upgrade)先 `remove` 再 `add`，两条命令都要带 `export DSH_HOME="$HOME/.dsh"`。然后重启并强制刷新。

### 连不上社区

**显示「无法连接天庭」**  
浏览器打开 `https://api.liang.today/v1/health`。能看到状态但插件仍连不上时，检查代理、防火墙和系统时间。连不上不会卡住整个 WebUI，可在案牍改用离线模式。

### 香火与打梁

**香火一直是 0**  
第一炷需要 50,000 Pro 当量。用量到了会自动更新，不必重装。

仍未解决时，到 [插件仓库](https://github.com/liang-today/dsh-liangxiang) 开 Issue。写明系统、Node / DSH 版本、profile 名称和已经脱敏的错误。不要附 API key、口令或完整日志。
