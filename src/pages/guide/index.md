---
layout: ../../layouts/MarkdownLayout.astro
title: 安装指南
description: 在 DeepSeek Harness Desktop 的插件市场安装梁相，或使用 Cmd / Web 命令行安装、升级和卸载。
eyebrow: 安装指南
aside: Desktop 优先用内置插件市场，无需安装 Node.js 或输入命令。当前公开版是 v1.2.0。
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

1. **打开添加插件**：在 DSH 侧栏点 **插件**，再点右上角 **添加插件**。
2. **输入完整包名**：输入 **`dsh-liangxiang`**，点击 **安装**。搜索时同样使用完整包名。
3. **立即启用**：安装完成后点 **立即启用**；页面边缘出现「今日梁相」即完成。若提示刷新或重启，按提示操作。

![第一步：打开插件并点击添加插件](/guide/desktop-add-plugin.jpg)

![第二步：输入完整包名 dsh-liangxiang 并安装](/guide/desktop-package-name.jpg)

![第三步：安装完成后立即启用](/guide/desktop-enable-plugin.jpg)

*安装后可在「梁相案牍 → 当前版本」核对版本。*

以上流程无需命令行、额外市场插件或索引配置。已有「发现」或社区市场入口时，同样搜索完整包名 `dsh-liangxiang`。

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

已经使用社区 `dshmarket` 的 Cmd / Web 用户，也可以在 **设置 → 插件市场** 搜索完整包名 `dsh-liangxiang`。新版 DSH 自带插件管理，不必为了安装梁相再装一个市场插件。

<h2 id="upgrade">升级与卸载</h2>
<span id="uninstall"></span>

### Desktop

1. 在 **插件 → 已安装** 中卸载梁相。
2. 点 **添加插件**，输入 **`dsh-liangxiang`**，安装并启用新版。
3. 在 **梁相案牍 → 当前版本** 核对版本和更新说明。

本机香火与梁祠记录保留，请保留 DSH 数据目录。当前官方插件入口对社区插件采用卸载后重装的更新方式，见 [DSH 官方说明](https://github.com/deepseek-ai/deepseek-harness/blob/687f282e8625c6b8d11ff58211a90524be2e4317/docs/upgrade-guide/v0.2.1-alpha.2/plugin-install-over-installed/guide.md)。

**日终上香（可选）**：在梁相案牍点击整格开关，悬停可看 23:59 时刻与运行条件；右键夯或拉设置默认方向。默认关闭，DSH 运行时按限额尽量上香，浏览器可以关闭。

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

检查网络连接；仍无法连接时，可启用代理软件的 TUN 模式，或在 DSH 主目录的 `$DSH_HOME/.env` 中配置 HTTP 代理，保存后完全退出并重启 DSH：

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

当前公开版是 v1.2.0。发行包也可从 [GitHub Releases](https://github.com/liang-today/dsh-liangxiang/releases) 下载，例如 `dsh-liangxiang-1.2.0.tgz`。
