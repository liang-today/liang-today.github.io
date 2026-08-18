---
layout: ../../layouts/MarkdownLayout.astro
title: 隐私与边界
description: 梁相如何保护对话内容、处理必要计数，以及社区玩法当前的信任边界。
eyebrow: 隐私与信任
aside: 只传玩法所需的计数，不传对话、代码与文件内容。
sections:
  - href: '#private'
    label: 不会采集
  - href: '#needed'
    label: 必要数据
  - href: '#trust'
    label: 信任边界
  - href: '#choice'
    label: 用户选择
  - href: '#website'
    label: 官网说明
---

# 隐私与边界

梁相只处理凝香和投票所需的最小计数，**不会接触对话内容**。

<h2 id="private">这些内容不会被采集</h2>

- prompt、模型回复与 reasoning 内容
- 源码、文件内容和会话记录
- API key、密钥与其他凭据
- 用户名、邮箱、手机号或实名信息
- 本机文件路径

文件路径只会用于本机错误提示，不会发送到社区服务，也不会出现在社区服务器日志中。

<h2 id="needed">玩法需要哪些数据</h2>

| 数据 | 用途 | 是否发送到社区服务 |
|---|---|---|
| 折算后的 Token 总量 | 计算个人香火 | 是，仅发送整数计数 |
| 随机生成的参与标识 | 记录香火与投票次数 | 是 |
| 业务日期、今日梁案、夯或拉 | 完成一次投票 | 是 |
| 悬浮入口位置 | 记住你的界面偏好 | 否，仅保存在浏览器中 |

参与标识不包含实名资料，也不复用 DeepSeek Harness 的遥测标识。它用于维持同一安装下的香火和投票记录，不能证明背后是真人或唯一设备。

<h2 id="trust">社区玩法能保证什么</h2>

社区服务能够保证：香火不会被花成负数；网络重试不会重复扣香；多人同时争用最后一炷时只会接受一次；页面上的梁位与梁子来自同一份结果；完成的日梁、周梁和月梁不会被改写。

当前社区玩法无法证明每个安装都对应唯一真人，也无法独立核验每台电脑报告的 Token 用量。因此，梁位是梁相社区的趣味参与结果，不是实名投票或民意调查，也不代表任何个人或机构立场。

<h2 id="choice">你可以选择本地体验</h2>

首次打开梁相时选择“改用本地”，凝香与投票都会留在本机，不连接社区服务。以后仍可在设置中切换。

悬浮入口被拖出视野时，可以在浏览器开发者工具中运行下面一行，只恢复入口位置，不会改变香火或投票结果：

```js
localStorage.removeItem('liangxiang:badge-position:v1')
```

<h2 id="website">官网说明</h2>

`liang.today` 是梁相的公开说明与演示网站。首页的夯拉演示只改变当前浏览器中的数字；网站没有登录、真实投票、Token 采集或用户数据库。

官网源码可在 [`liang-today/liang-today.github.io`](https://github.com/liang-today/liang-today.github.io) 查看。

---

发现隐私或安全问题时，请通过[插件仓库](https://github.com/liang-today/dsh-liangxiang)反馈。公开内容中不要附上 API key、口令或未经脱敏的完整日志。
