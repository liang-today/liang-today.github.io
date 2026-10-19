---
layout: ../../layouts/MarkdownLayout.astro
title: 关于梁相
description: 梁相的故事、命名、开源仓库与设计原则。
eyebrow: 关于
aside: 一个从 DeepSeek Harness 使用中长出来的每日社区玩法。
sections:
  - href: '#story'
    label: 梁相的含义
  - href: '#names'
    label: 命名体系
  - href: '#open-source'
    label: 社区与开源
  - href: '#principles'
    label: 设计原则
---

# 关于梁相

**众香成势，梁子显相。梁相还得梁人出！**

梁相是一个 DeepSeek Harness 社区玩法。每天一道梁案，大家在使用模型的过程中凝成香火，投下一炷“夯”或“拉”；众人的选择汇成梁位，显出今日梁子。日终之后，结果收入梁祠。

刚装上备 10 炷，对话还能继续攒。点一下一炷，长按 1.5 秒倾炉。同一台机器当天重装，不会再领一份见面礼。梁祠里的日梁、周梁、月梁都记五行香客。

可在梁相案牍开启日终上香：DSH 运行时，于 23:59 按限额尽量倾炉；右键夯或拉，只设置默认方向，不会立即投票。默认关闭，手动上香优先。

输入＋输出 Token 按固定倍率凝香：Pro 类 ×1，Flash 类与其他模型 ×0.5。默认 Pro 每 50,000 Token 一炷，Flash 与其他模型每 100,000 Token 一炷。

<h2 id="story">梁相的含义</h2>

**梁相**是众香汇成梁位后，梁子在当日呈现的形相。“相”既指梁子的可见状态，也指众人选择形成的当日结果；“梁”连接梁子、梁位与梁祠，构成完整的命名主轴。

英文标识 **liangxiang** 延续中文读音，主域名 **liang.today** 将品牌落在“今日一案、日终入祠”的每日节奏上。

```text
今日开梁案
→ 众人用 DeepSeek Harness 凝香表态
→ 众香汇成梁位
→ 梁子依势显相
→ 日终结果收入梁祠
```

<h2 id="names">命名体系</h2>

| 层级 | 名称 |
|---|---|
| 产品品牌 | 梁相 |
| 英文标识 | liangxiang |
| 主域名 | liang.today |
| 悬浮入口 | 今日梁相 |
| 今日主题 | 今日梁案 |
| 中央角色 | 梁子 |
| 核心数字 | 梁位 |
| 投入资源 | 香火 |
| 个人进度 | 香火环 |
| 历史空间 | 梁祠 |
| 历史结果 | 日梁 / 周梁 / 月梁 |

<h2 id="open-source">社区与开源</h2>

梁相由独立社区发起。公开仓库统一收在 **liang-today** 组织：

| 仓库 | 内容 |
|---|---|
| [`liang-today/dsh-liangxiang`](https://github.com/liang-today/dsh-liangxiang) | 插件、文档、测试与发行包 |
| [`liang-today/liang-today.github.io`](https://github.com/liang-today/liang-today.github.io) | 官网 `liang.today` |

本项目为独立创作，与 DeepSeek 及其关联主体不存在官方关系。

**当前公开版为 v1.2.0**：新增小难梁、轻落短句与可选的 23:59 自动倾炉，适配新版 DSH。

Desktop 在 **插件 → 添加插件** 输入 **`dsh-liangxiang`** 后安装并启用；安装和升级步骤见[安装指南](/guide/#desktop)。也可从 [npm](https://www.npmjs.com/package/dsh-liangxiang) 或 [GitHub Releases](https://github.com/liang-today/dsh-liangxiang/releases) 查看发行信息。

社区目录：[dsh-market](https://dshmarket.com/) · [1024 Store](https://deepseek1024.com/) · [awesome-deepseek-harness](https://github.com/Dominic789654/awesome-deepseek-harness)。

欢迎从个人 fork 提交改进：插件 PR 统一投向主仓 `dev`，通过检查与维护者审阅后集成；详见[贡献指南](https://github.com/liang-today/dsh-liangxiang/blob/main/CONTRIBUTING.md)。

感谢 **XChen446、Ritanlisa、xunxiaoQ**，以及每一位提出建议、修复问题和参与测试的社区贡献者。

<h2 id="principles">设计原则</h2>

### 现代编年志 × 克制梁祠

界面以现代桌面产品为底：清晰层级、稳定信息密度与克制的中性色。日历、编年与少量朱印提供识别，暖金和朱红用于重点标记。

### 玩法轻松，事实清楚

- 投票只有夯与拉，一炷就是一票。
- 梁位是社区参与者的夯率，不构成民调，也不代表任何个人或机构立场。
- 五行香客表示至少成功投过一次的参与者数量，不等于实名人数。
- 官网只提供说明与演示，不处理真实投票。

### 热闹留给梁子，秩序留给系统

梁子的上下弹跳可以荒诞，投票与归档保持清楚。个人香火与全局梁位在画面上相遇，在计算中始终分开。

---

品牌使用或媒体引用，请保持“梁相 / liangxiang / liang.today”三者一致，并注明这是非官方社区项目。
