---
layout: ../../layouts/MarkdownLayout.astro
title: 隐私与边界
description: 梁相如何保护对话内容、处理必要计数，以及社区玩法当前的信任边界。
eyebrow: 隐私边界
aside: 只传玩法所需的计数，不传对话、代码与文件内容。
sections:
  - href: '#private'
    label: 不会采集
  - href: '#needed'
    label: 必要数据
  - href: '#trust'
    label: 信任边界
  - href: '#choice'
    label: 本地选择
  - href: '#console'
    label: 打开控制台
  - href: '#website'
    label: 官网说明
---

# 隐私与边界

梁相只处理凝香和投票所需的最小计数，**不会接触对话内容**。

<h2 id="private">不会采集</h2>

- prompt、模型回复与 reasoning 内容
- 源码、文件内容和会话记录
- API key、密钥与其他凭据
- 用户名、邮箱、手机号或实名信息
- 本机文件路径

文件路径只会用于本机错误提示，不会发送到社区服务，也不会出现在社区服务器日志中。

<h2 id="needed">必要数据</h2>

| 数据 | 用途 | 是否发送到社区服务 |
|---|---|---|
| 折算后的 Token 总量 | 计算个人香火 | 是，仅发送整数计数 |
| 随机生成的参与标识 | 记录香火与投票次数 | 是 |
| 业务日期、今日梁案、夯或拉 | 完成一次投票 | 是 |
| 悬浮入口位置 | 记住你的界面偏好 | 否，仅保存在浏览器中 |

参与标识不包含实名资料，也不复用 DeepSeek Harness 的遥测标识。它用于维持同一安装下的香火和投票记录，不能证明背后是真人或唯一设备。

<h2 id="trust">信任边界</h2>

社区服务能够保证：香火不会被花成负数；网络重试不会重复扣香；多人同时争用最后一炷时只会接受一次；页面上的梁位与梁子来自同一份结果；完成的日梁、周梁和月梁不会被改写。

当前社区玩法无法证明每个安装都对应唯一真人，也无法独立核验每台电脑报告的 Token 用量。因此，梁位是梁相社区的趣味参与结果，不是实名投票或民意调查，也不代表任何个人或机构立场。

<h2 id="choice">本地选择</h2>

首次打开梁相时可改用本地：凝香与投票都留在本机，不连接社区。以后仍可在梁相案牍切换。

卸载插件不会删除本机账本。要清空身份、离线玩法或入口位置，见[部署指南 · 清空本地数据](/guide/#reset)。

<h2 id="console">打开控制台</h2>

恢复入口位置、重看欢迎页等命令，要在 DeepSeek Harness 网页的控制台里执行。

| 系统 | Chrome / Edge | Firefox | Safari |
|---|---|---|---|
| macOS | <kbd>⌘</kbd> <kbd>⌥</kbd> <kbd>J</kbd> | <kbd>⌘</kbd> <kbd>⌥</kbd> <kbd>K</kbd> | 先打开「开发」菜单，再 <kbd>⌘</kbd> <kbd>⌥</kbd> <kbd>C</kbd> |
| Windows / Linux | <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>J</kbd> | <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>K</kbd> | — |

Safari 需先到「设置 → 高级」勾选「在菜单栏中显示开发菜单」。只恢复入口位置：

```js
localStorage.removeItem('liangxiang:badge-position:v2')
```

<h2 id="website">官网说明</h2>

`liang.today` 是梁相的公开说明与演示网站。首页的夯拉演示只改变当前浏览器中的数字；网站没有登录、真实投票、Token 采集或用户数据库。

官网用 [GoatCounter](https://www.goatcounter.com/) 统计每日访客和页面浏览，便于了解传播效果。它不设置 cookie、不识别个人，也不与插件的香客或安装身份合并。统计数据留在 GoatCounter，不进入社区后端 `api.liang.today`。后台地址为 [`stats.liang.today`](https://stats.liang.today/)（GoatCounter 自定义域名）；`fangcc.goatcounter.com` 仍然可用。

官网源码在 [`liang-today/liang-today.github.io`](https://github.com/liang-today/liang-today.github.io)；插件源码在 [`liang-today/dsh-liangxiang`](https://github.com/liang-today/dsh-liangxiang)。

---

发现隐私或安全问题时，请通过[插件仓库](https://github.com/liang-today/dsh-liangxiang)反馈。公开内容中不要附上 API key、口令或未经脱敏的完整日志。
