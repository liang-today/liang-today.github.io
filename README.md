# 梁相官网

[`liang.today`](https://liang.today) 的 Astro 静态站，托管在 GitHub Pages。

## 本地开发

```bash
pnpm install
pnpm run dev
```

## 发布前检查

```bash
pnpm run check
pnpm run build
```

推送 `main` 后，GitHub Actions 自动构建并部署。正文页面位于 `src/pages/**/*.md`；视觉和交互集中在 Astro 布局、首页与 `src/styles/global.css`。

品牌与产品契约以插件仓库的 `AGENTS.md` 和 `docs/140-liangxiang-brand.md` 为准。当前官网不处理真实投票或 Token，只做产品介绍和本地交互演示。
