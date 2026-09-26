---
layout: ../../layouts/MarkdownLayout.astro
title: 部署指南
description: 用命令行或 dshmarket 把梁相装进 DeepSeek Harness，并完成升级或卸载。
eyebrow: 部署指南
aside: 两种安装方式，一条升级命令。当前公开版是 v1.1.6。
sections:
  - href: '#cli'
    label: 命令行
  - href: '#market'
    label: dshmarket
  - href: '#upgrade'
    label: 升级
  - href: '#uninstall'
    label: 卸载
  - href: '#proxy'
    label: 代理
  - href: '#notes'
    label: 遇到问题
---

# 部署指南

梁相是 DeepSeek Harness 的 WebUI 插件。安装前请退出 WebUI；安装完成后重新启动，页面边缘出现「今日梁相」即表示成功。

<h2 id="cli">命令行安装</h2>

在实际使用的 `web` profile 中添加梁相：

```bash
dsh plugin --profile web add dsh-liangxiang
dsh web
```

没有全局 `dsh` 命令时：

```bash
npx --yes @deepseek-ai/dsh plugin --profile web add dsh-liangxiang
npx --yes @deepseek-ai/dsh web
```

如果你的 profile 不叫 `web`，请换成实际名称。不要运行 `npm i dsh-liangxiang`，它不会把插件加入 DSH profile。

<h2 id="market">通过 dshmarket 安装</h2>

已有插件市场时，打开 **设置 → 插件市场**，搜索 `liangxiang`，然后点击安装。

如果尚未安装插件市场：

```bash
dsh plugin --profile web add dshmarket
dsh web
```

重新进入设置，在插件市场搜索 `liangxiang` 即可。

<h2 id="upgrade">升级</h2>

退出 WebUI，重新执行安装命令即可跟随 npm `latest`。不必先卸载，梁相账本和梁祠记录都会保留。

```bash
dsh plugin --profile web add dsh-liangxiang
```

dshmarket 用户也可以在插件市场点击检查更新。

<h2 id="uninstall">卸载</h2>

```bash
dsh plugin --profile web remove dsh-liangxiang
```

卸载只移除插件，不会自动删除本机梁相账本。

<h2 id="proxy">需要代理时</h2>

在 `$DSH_HOME/.env` 为 Node（DSH 全局）添加代理配置。`7890` 换成自己的代理端口，保存后重新启动 DSH。Desktop 写入它实际使用的 `DSH_HOME`。

```bash
HTTPS_PROXY = "http://127.0.0.1:7890"
HTTP_PROXY = "http://127.0.0.1:7890"
NODE_USE_ENV_PROXY = "1"
```

<h2 id="notes">遇到问题</h2>

- 页面没有出现入口：确认安装和启动使用的是同一个 profile，然后重启 WebUI 并强制刷新。
- DSH Desktop：命令必须指向 Desktop 实际使用的 `DSH_HOME`，不要误装到默认 `~/.dsh`。
- `dshmarket` 与当前 DSH 不兼容时：先移除不兼容的市场版本，再用上面的命令行方式直接安装梁相。

仍未解决时，请到[插件仓库](https://github.com/liang-today/dsh-liangxiang)提交 Issue。附上系统、DSH 版本和脱敏后的错误信息，不要提交 API key 或完整日志。

当前公开版是 v1.1.6。发行包也可从 [GitHub Releases](https://github.com/liang-today/dsh-liangxiang/releases) 下载，例如 `dsh-liangxiang-1.1.6.tgz`。
