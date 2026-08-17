---
layout: ../../layouts/MarkdownLayout.astro
title: 隐私与边界
description: 梁相采集什么、不采集什么，以及当前社区软信任模式能够保证和不能保证的事项。
eyebrow: 隐私与信任
aside: 只传计数，不传内容；软信任不是匿名或实名证明。
sections:
  - href: '#never'
    label: 永不采集
  - href: '#processed'
    label: 实际处理
  - href: '#authority'
    label: 信任边界
  - href: '#controls'
    label: 用户控制
  - href: '#website'
    label: 官网说明
---

# 隐私与边界

梁相的基本原则是：**只处理玩法所需的最小计数，不接触对话内容。** 下面描述的是 0.6.0 RC 的当前实现，而不是未来承诺。

<h2 id="never">永不采集、永不出网</h2>

- prompt、模型回复与 reasoning 内容
- 源码、文件内容、会话记录
- API key、provider secret 与其他凭据
- 用户名、邮箱、手机号或实名信息
- 会话 ID 与 Token 高水位明细

文件路径只可能出现在本机诊断日志中，不应随社区请求发送，也不应写入服务器日志。

<h2 id="processed">实际处理的数据</h2>

| 数据 | 用途 | 是否出网 |
|---|---|---|
| provider-reported Token 四桶合计后的整数 | 凝香 | 作为整数声明出网 |
| 每会话 Token 高水位 | 防止重复累计 | 否，仅本机 |
| `inst-` / `lk_` 假名安装标识 | 幂等、账本与独立安装统计 | 是 |
| 业务日、梁案 ID、夯/拉、请求 ID | 完成一次投票 | 是 |
| 徽章位置 | 记住悬浮入口 | 否，仅浏览器 |

假名安装标识由梁相自己生成，不复用 DSH 的匿名遥测标识。它可以被重置或复制，因此既不是实名，也不构成强匿名保证。

<h2 id="authority">当前信任边界</h2>

社区后端能够保证：

- 同一安装不会把香火花成负数；
- 相同请求 ID 的重试不会再次扣香或再次记票；
- 并发争抢最后一炷时最多接受一次；
- 梁位、称呼与梁子来自同一版本快照；
- 日梁、周梁、月梁按原始票数加权并幂等封存。

社区后端**不能**保证：

- 安装背后是真人、唯一用户或固定设备；
- 本机声明的 Token 用量一定真实；
- 梁位代表真实民意、全网观点或梁文锋本人立场。

因此当前模式叫 **community soft-trust / 社区软信任**，不应称为 secure、verified、一人一票或可信公投。

<h2 id="controls">用户可以控制什么</h2>

### 完全不连接社区节点

首次欢迎页选择“改用本地”，或设置：

```bash
LIANGXIANG_BACKEND_URL=local
```

Host 会进入 `LOCAL_FAKE_DEV`，投票和香火只用于本机演示。

### 重置入口位置

```js
localStorage.removeItem('liangxiang:badge-position:v1')
```

### 重铸安装身份

源码环境可运行 `pnpm run reset:identity`。这会在下次启动生成新身份，但不会把旧服务器记录迁移到新身份；设备指纹已绑定时还可能需要按身份恢复流程等待或解绑定。

<h2 id="website">官网说明</h2>

`liang.today` 是托管在 GitHub Pages 的静态说明站：

- 首页的夯/拉按钮只在浏览器内修改演示数字，不发送到社区后端；
- 官网没有登录、投票、Token 采集或数据库；
- 站点源码公开在 [`liang-today/liang-today.github.io`](https://github.com/liang-today/liang-today.github.io)；
- GitHub Pages 作为托管平台可能按其自身政策处理访问日志，详见 GitHub 的隐私声明。

---

发现隐私或安全问题时，请通过插件仓库的安全联系方式报告；不要在公开 Issue 中附上密钥、完整日志、安装私钥或其他敏感信息。
