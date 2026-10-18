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

推送 `main` 后，GitHub Actions 自动构建并部署。正文页面位于 `src/pages/**/*.md`；视觉和交互集中在 Astro 布局、首页与 `src/styles/global.css`。

构建会优先同步社区后端快照。后端暂时不可用时，保留线上已发布的最后一份有效快照；线上快照也不可用时再使用仓库内的有效快照，不用假 `WAITING` 覆盖已知结果。

品牌与产品契约以插件仓库的 `AGENTS.md` 和 `docs/140-liangxiang-brand.md` 为准。当前官网不处理真实投票或 Token，只做产品介绍和本地交互演示。

安装入口统一指向 `/guide/`：Desktop 优先使用官方原生「插件 → 发现」，首次启用和索引前置条件在折叠说明中交代；Cmd / Web 单独说明 profile 命令。公开版本信息跟随已发布版本，不随候选分支提前更新。
