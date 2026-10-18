---
layout: ../../layouts/MarkdownLayout.astro
title: 安装指南
description: 在 DeepSeek Harness Desktop 的插件市场安装梁相，或使用 Cmd / Web 命令行安装、升级和卸载。
eyebrow: 安装指南
aside: Desktop 优先用内置插件市场，无需安装 Node.js 或输入命令。当前公开版是 v1.1.6。
sections:
  - href: '#desktop'
    label: Desktop 安装
  - href: '#cli'
    label: Cmd / Web 安装
  - href: '#upgrade'
    label: 升级与卸载
  - href: '#proxy'
    label: 在线连接与代理
  - href: '#notes'
    label: 遇到问题
---

# 安装指南

梁相是 DeepSeek Harness 插件。推荐使用 [DeepSeek 官方 Desktop](https://www.deepseek.com/zh/harness/)，直接在应用里安装。完成后，页面边缘出现「今日梁相」即可开始。

<h2 id="desktop">Desktop：在插件市场安装</h2>
<span id="market"></span>

1. **打开市场**：在 DSH 侧栏打开 **插件 → 发现**。
2. **搜索梁相**：输入 `梁相` 或 `liangxiang`。
3. **点击安装**：核对包名为 `dsh-liangxiang`，确认安装，完成后选择 **立即启用**。如 DSH 提示需要重启，再重启应用。

<details>
<summary>第一次使用，没有「发现」或搜不到梁相？</summary>

在 **插件 → 实验性插件 → 更多** 中开启 **自定义插件市场**，再进入「发现」。官方市场不预置索引源；空白页需要先添加你信任、且收录梁相的市场索引，具体见 [DSH 官方市场说明](https://deepseek-harness.github.io/deepseek-harness/guide/plugin-market)。

也可以直接在 **插件 → 添加插件** 输入 `dsh-liangxiang`，点击 **安装**，完成后选择 **立即启用**。这同样使用 DSH 内置安装流程，无需命令行。

若你使用的社区 Desktop 显示 **设置 → 插件市场**，可以在该入口搜索相同包名。不同 Desktop 的菜单和运行时可能不同，请以所用应用的说明为准。

</details>

Desktop 的插件由应用自己的 `desktop` profile 管理。不要把下面的 `web` 命令用于 Desktop，也不要用 npm 版 DSH 命令修改它。

<h2 id="cli">Cmd / Web：命令行安装</h2>

这部分适用于从终端运行的 DSH Web。先按 [DSH 官方说明](https://github.com/deepseek-ai/deepseek-harness#run) 准备运行环境，退出正在运行的 WebUI，再执行：

```bash
dsh plugin --profile web add dsh-liangxiang
dsh web
```

没有全局 `dsh` 命令时：

```bash
npx --yes @deepseek-ai/dsh plugin --profile web add dsh-liangxiang
npx --yes @deepseek-ai/dsh web
```

安装和启动必须使用同一个 profile；自定义 profile 请把 `web` 换成实际名称。不要运行 `npm i dsh-liangxiang`，它不会把插件加入 DSH profile。

已经使用社区 `dshmarket` 的 Cmd / Web 用户，也可以在 **设置 → 插件市场** 搜索 `liangxiang`。新版 DSH 自带插件管理，不必为了安装梁相再装一个市场插件。

<h2 id="upgrade">升级与卸载</h2>
<span id="uninstall"></span>

### Desktop

在 **插件 → 已安装** 打开梁相，按所用市场的提示更新。若没有更新按钮，先卸载梁相，再按上面的市场或「添加插件」流程重新安装。升级后可在 **梁相案牍 → 当前版本** 核对版本和更新说明。

卸载同样在插件页面完成。卸载插件不会自动删除本机梁相账本；不要额外删除 DSH 的数据目录。

### Cmd / Web

退出 WebUI，执行更新命令后重新启动。`@latest` 指向当前公开正式版，不会自动安装候选版。

```bash
dsh plugin --profile web add dsh-liangxiang@latest
dsh web
```

卸载：

```bash
dsh plugin --profile web remove dsh-liangxiang
```

没有全局命令时，同样将 `dsh` 换成 `npx --yes @deepseek-ai/dsh`。账本和梁祠记录会保留。

<h2 id="proxy">在线一直连不上？</h2>

在线模式需要 DSH 所在机器能连接梁相社区服务器。若一直无法连接，可以检查网络并尝试代理；包括福建在内的部分地区曾有连接不稳定反馈，具体仍取决于当地网络与运营商。

浏览器能访问网页，不代表 DSH 进程已经走代理。可在代理软件中使用 TUN 模式，或在 DSH 实际使用的 `$DSH_HOME/.env` 中配置 HTTP 代理，保存后完全退出并重新启动 DSH：

```dotenv
HTTPS_PROXY="http://127.0.0.1:7890"
HTTP_PROXY="http://127.0.0.1:7890"
```

将 `7890` 换成自己的 **HTTP 代理端口**；不要填 SOCKS 地址。配置应放在 DSH 主目录，不能放进项目的 `.env`。完整行为见 [DSH 官方网络代理说明](https://deepseek-harness.github.io/deepseek-harness/guide/network-proxy)。

连接恢复后，梁相会自动重连。离线模式是单独的本地玩法，与社区账本不合并；网络故障不会自动切换模式。

<h2 id="notes">遇到问题</h2>

- **安装后没有入口**：确认梁相已启用；按 DSH 提示刷新页面或重启。Cmd / Web 还需核对安装与启动使用同一个 profile。
- **安装提示不兼容**：先更新 DSH，并核对市场展示的兼容版本；不要直接忽略兼容性检查。
- **市场搜不到或下载失败**：先用 **插件 → 添加插件** 输入准确包名；无法读取注册表时，可在安装对话框检查安装源或参照上面的代理说明。
- **在线不可用**：先排查服务器连接，保留当前模式，等待自动重连；无需反复切换或重装插件。

仍未解决时，请到[插件仓库](https://github.com/liang-today/dsh-liangxiang/issues)提交 Issue。附上系统、DSH 版本和脱敏后的错误信息，不要提交 API key 或完整日志。

当前公开版是 v1.1.6。发行包也可从 [GitHub Releases](https://github.com/liang-today/dsh-liangxiang/releases) 下载，例如 `dsh-liangxiang-1.1.6.tgz`。
