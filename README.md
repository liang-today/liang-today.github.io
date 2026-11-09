# 梁相官网

[`liang.today`](https://liang.today) 的 Astro 静态站，托管在 GitHub Pages。

## 本地开发

```bash
pnpm install
pnpm run dev
```

## 发布前检查

```bash
pnpm run test
pnpm run check
pnpm run build
```

插件开发使用个人 fork，PR 投向插件主仓 `main`，经 CI 与维护者审阅后集成，见[贡献指南](https://github.com/liang-today/dsh-liangxiang/blob/main/CONTRIBUTING.md)。官网改动同样使用个人 fork 的工作分支验证和发起审阅，正式发布经维护者批准后合入 `main`；推送 `main` 会触发 GitHub Actions 构建部署。正文页面位于 `src/pages/**/*.md`；视觉和交互集中在 Astro 布局、首页与 `src/styles/global.css`。

构建会优先同步社区后端快照。后端暂时不可用时，保留线上已发布的最后一份有效快照；线上快照也不可用时再使用仓库内的有效快照，不用假 `WAITING` 覆盖已知结果。

品牌与产品契约以插件仓库的 `AGENTS.md` 和 `docs/140-liangxiang-brand.md` 为准。当前官网不处理真实投票或 Token，只做产品介绍和本地交互演示。

安装入口统一指向 `/guide/`：Desktop 使用官方原生「插件 → 添加插件」，输入完整包名并安装、启用，提供三步图解；Cmd / Web 单独说明 profile 命令。公开版本信息跟随已发布版本，不随候选分支提前更新。

官网介绍2.0.0在线钱包、梁股三盘与浅蓝水景，三张产品图为同一安装包的功能示例，依次主UI、梁股、梁祠；历史MP4不在首页自动播放。

首页打开时读取公开快照，可见页面每秒刷新，不创建插件身份或读取钱包。请求显式带当前梁子策略能力；梁位、头像、称呼、规则高亮与导出卡来自同一校验后的快照，保留历史策略，使用整数票数截断六位小数。隐藏页面暂停请求，恢复立即同步；错误保留最后有效结果，不伪造零票。

下载分享卡在浏览器生成2400×1260 PNG，固定点击时的快照与时间；社交平台预览图由Pages构建生成并标注时间。开发预览通过Vite的只读公共接口代理连接，部署后的浏览器直接读取API。正式上线前须在反向代理仅为`GET /v1/snapshot`及其OPTIONS预检启用CORS，允许`x-liangxiang-liangzi-policy`；不开放个人或写入接口，不发送凭据。

功能与文案经审核后发布；本地预览不加载访问统计，生产构建保留原GoatCounter端点。
