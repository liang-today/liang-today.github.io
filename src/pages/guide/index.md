---
layout: ../../layouts/MarkdownLayout.astro
title: 部署指南
description: 梁相的 npm、GitHub Release、源码三条路径：安装、升级、卸载，以及常见问题处理。
eyebrow: 安装、升级与卸载
aside: 优先 npm 远程拉包；也可使用 GitHub 安装包或源码。
sections:
  - href: '#install'
    label: 安装、升级、卸载
  - href: '#incense'
    label: 香火怎么算
  - href: '#troubleshooting'
    label: 按系统排障
  - href: '#reinstall'
    label: 仍显示旧版本时
---

# 部署指南

梁相是 DeepSeek Harness WebUI 插件。需要 Node.js 22.19+（推荐 24）和已安装的 DSH。

每次操作都先**完全退出 WebUI**，做完再启动，并刷新浏览器一次。升级、卸载都不会删除香火账本。`web` 若不是你的 profile，换成实际名字。

全局装过 DSH 就写 `dsh`；否则把 `dsh` 整段换成 `npx --yes @deepseek-ai/dsh`。启动 WebUI 也一样：`dsh web` 或 `npx --yes @deepseek-ai/dsh web`。

> 当前 npm 公开包仍是 `dsh-liangxiang@0.8.0`。发新包之前，`@beta` 升不到源码里的更新。

<h2 id="install">安装、升级、卸载</h2>

### npm（推荐，远程拉包）

安装和升级是同一条命令，DSH 会从 npm 拉取当前 `@beta`：

```bash
dsh plugin --profile web add dsh-liangxiang@beta
# 或
npx --yes @deepseek-ai/dsh plugin --profile web add dsh-liangxiang@beta
```

卸载：`dsh plugin --profile web remove dsh-liangxiang`

国内访问 npm 较慢时：

```bash
npm config set registry https://registry.npmmirror.com
```

社区后端 `https://api.liang.today` 在香港，由本机 DSH 直连。连不上时不会卡住整个 WebUI。

### GitHub Release / 本地 tarball

前往[Releases](https://github.com/liang-today/dsh-liangxiang/releases) 或使用桌面分发包。先进入安装包所在目录，再写 **`./文件名.tgz`**。少写 `./` 时 pnpm 会去 npm 拉这个文件名并报 `ERR_PNPM_FETCH_404`。不要写 `dsh-liangxiang@0.8.3-beta`（公开 npm 还没有这个版本）。子命令是 `plugin add`，不是 `web add`。

```bash
export DSH_HOME="$HOME/.dsh"
cd "$HOME/Desktop/liangxiang"
npx --yes @deepseek-ai/dsh plugin --profile web add ./dsh-liangxiang-0.8.3-beta.tgz
```

卸载：`dsh plugin --profile web remove dsh-liangxiang`

### 源码

使用独立开发 profile，不改日常 DSH。Windows 请在 Git Bash 或 WSL 中执行。

```bash
git clone https://github.com/liang-today/dsh-liangxiang.git
cd dsh-liangxiang
pnpm install && pnpm run dev:install && pnpm run dev:web   # 安装
git pull && pnpm install && pnpm run dev:install           # 升级
pnpm run dev:uninstall                                     # 卸载
```

默认开发地址 `http://127.0.0.1:3080`。

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

没有全局 `dsh` 时改用 `npx --yes @deepseek-ai/dsh`，不必先 `npm i -g`。关闭并重新打开终端，使新安装的命令行路径生效。

**本地安装包报 ERR_PNPM_FETCH_404**

日志里如果出现 `GET https://registry.npmjs.org/dsh-liangxiang-0.8.3-beta.tgz`，说明少写了 `./`，pnpm 去 npm 找这个名字了。先 `cd` 到包所在目录：

```bash
export DSH_HOME="$HOME/.dsh"
cd "$HOME/Desktop/liangxiang"
npx --yes @deepseek-ai/dsh plugin --profile web add ./dsh-liangxiang-0.8.3-beta.tgz
```

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

<h2 id="reinstall">仍显示旧版本时</h2>

先卸载再按上面的路径重装一次：

```bash
dsh plugin --profile web remove dsh-liangxiang
dsh plugin --profile web add dsh-liangxiang@beta
# 或 npx --yes @deepseek-ai/dsh plugin --profile web add ./dsh-liangxiang-0.8.3-beta.tgz
```

GitHub 包把第二条换成 `add ./dsh-liangxiang-<version>.tgz`。源码用 `pnpm run dev:uninstall && pnpm run dev:install`。然后重启 WebUI 并强制刷新浏览器。

问题仍未解决时，请在[插件仓库](https://github.com/liang-today/dsh-liangxiang)提交 Issue，附上操作系统、Node/DSH 版本、profile 名称与已经脱敏的错误提示。公开内容中请勿包含 API key、口令或完整日志。
