---
layout: ../../layouts/MarkdownLayout.astro
title: 部署指南
description: 梁相 0.6.0 RC 的安装、Windows 彻底重装、本地开发、GitHub Pages 发布、故障诊断与安全重置指南。
eyebrow: 部署与恢复
aside: 从第一次安装到彻底重置；先确认场景，再执行对应命令。
sections:
  - href: '#release-status'
    label: 当前状态
  - href: '#plugin-install'
    label: 安装插件
  - href: '#windows-clean'
    label: Windows 彻底重装
  - href: '#local-mode'
    label: 本地演示
  - href: '#how-it-works'
    label: 数据口径
  - href: '#troubleshooting'
    label: 故障诊断
  - href: '#reset'
    label: 重置与恢复
  - href: '#pages-deploy'
    label: 官网发布
---

# 部署指南

梁相当前版本是 **`dsh-liangxiang 0.6.0` RC**。本页覆盖普通使用、开发调试和官网维护三种场景；命令中的 `<profile>` 请替换成你的 DSH profile 名称。

> 梁相仍处在社区软信任阶段，且依赖 Developer Preview 状态的 DSH。建议先在专用 profile 或本地模式中验证，再接入长期使用的环境。

<h2 id="release-status">当前状态</h2>

| 项目 | 当前值 |
|---|---|
| 插件包 | `dsh-liangxiang` |
| 版本 | `0.6.0` RC |
| DSH 基线 | `0.1.0-rc.6`，源码勘察基线为 `47f94385` |
| Node.js | DSH 要求 `^22.19.0` 或 `>=24` |
| 包管理器 | pnpm `>=10` |
| 许可证 | MIT |
| 发布状态 | 尚未发布 npm 或 GitHub Release；当前从源码构建 tarball |

开始前确认：

```bash
node --version
pnpm --version
dsh --version
```

如果 Node 仍是 20、22.18 或更早版本，先升级到 Node 22.19+；新环境优先使用 Node 24 LTS。

<h2 id="plugin-install">安装插件</h2>

### 方案 A：从源码启动专用开发环境

这是当前最稳妥、也是仓库测试覆盖最完整的路径：

```bash
git clone https://github.com/NiYa193/dsh-liang-meter.git
cd dsh-liang-meter
corepack enable
pnpm install
pnpm run dev:install
pnpm run dev:web
```

默认页面在 `http://127.0.0.1:3080`。右缘出现以当前梁子为图标的悬浮入口，悬停文案为“今日梁相”。终端应出现：

```text
[dsh-liangxiang] host half active
```

开发脚本默认使用仓库内的 `.dsh-home` 和 `liangxiang-dev` profile，不会改动真实的 `~/.dsh`。

### 方案 B：打包后安装到指定 profile

先在仓库根目录完成构建和打包：

```bash
pnpm install
pnpm run verify
pnpm run pack:tarball
```

产物应为 `dsh-liangxiang-0.6.0.tgz`。安装到自己的 profile：

```bash
dsh plugin --profile <profile> add ./dsh-liangxiang-0.6.0.tgz
dsh --profile <profile> --dump-config
```

有效配置中必须出现 `dsh-liangxiang`。然后按该 profile 的原有方式启动 DSH WebUI。

不要把 `@deepseek-ai/dsh-web-app` 手动装进 profile 的 `node_modules`；它是 DSH 内置 bundle。重复安装会产生两个模块实例，常见结果是所有工具调用都报 `Cannot read properties of undefined (reading 'prepare')`。

<h2 id="windows-clean">Windows 彻底重装</h2>

当 Windows 上仍显示旧版、旧入口或旧技术标识时，不要只覆盖安装。请在 PowerShell 中按以下顺序处理。

### 1. 停止正在运行的 DSH

先关闭 WebUI 窗口和所有运行 `dsh web` 的终端，确保旧 Host 与浏览器 bundle 不再驻留内存。

### 2. 同时移除新旧包名

```powershell
dsh plugin --profile <profile> remove dsh-liangxiang
dsh plugin --profile <profile> remove dsh-liangbiao
dsh --profile <profile> --dump-config
```

最后一条输出中不应再出现 `dsh-liangxiang` 或 `dsh-liangbiao`。若某个 `remove` 提示包不存在，可以继续。

### 3. 排除重复的 WebUI 依赖

在插件源码目录运行：

```powershell
node .\scripts\assert-profile-modules.mjs <DSH_HOME>\profiles\<profile>
```

如果报告 `@deepseek-ai/dsh-web-app` 被 profile 依赖遮蔽：

```powershell
pnpm --dir <DSH_HOME>\profiles\<profile> remove @deepseek-ai/dsh-web-app
```

只移除这一个精确依赖；不要删除整个 profile 或整个 DSH_HOME。

### 4. 重新构建并安装 0.6.0

```powershell
pnpm install
pnpm run verify
pnpm run pack:tarball
dsh plugin --profile <profile> add .\dsh-liangxiang-0.6.0.tgz
dsh --profile <profile> --dump-config
```

确认配置中只有 `dsh-liangxiang`，然后完全重启 WebUI。若页面仍像旧版，先执行一次浏览器强制刷新；这一步只清浏览器缓存，不清香火、安装标识或投票记录。

### 5. 验证加载的是新 bundle

将 `<webui>` 替换成实际端口：

```powershell
curl.exe -I http://127.0.0.1:<webui>/plugins/dsh-liangxiang/client.js
```

应返回 `200`。终端日志、网络路径和有效配置都必须使用 `liangxiang`；如果仍出现旧的 `/liangbiao/` 路径，说明旧进程或旧 profile 仍在工作。

<h2 id="local-mode">本地演示与社区模式</h2>

### 完全本地，不连接社区节点

欢迎页选择“改用本地”，或启动时显式设置：

```bash
LIANGXIANG_BACKEND_URL=local pnpm run dev:web
```

本地模式是 `LOCAL_FAKE_DEV`，适合演示界面、门槛和投票循环。增加测试香火：

```bash
pnpm run dev:credit
pnpm run dev:credit -- 9
```

### 自建本地后端

终端 A：

```bash
pnpm run build
LIANGXIANG_BACKEND_DB=.liangxiang-backend/dev.sqlite pnpm run backend:start
```

终端 B：

```bash
LIANGXIANG_BACKEND_URL=http://127.0.0.1:4180 pnpm run dev:web
```

一键在线链路冒烟：

```bash
pnpm run smoke:online
```

它会检查 Token claim、幂等重放、并发只接受一票、快照发布，并确认 `VERIFIED_PRODUCTION` 仍被门禁拒绝。

<h2 id="how-it-works">数据如何运转</h2>

有效 Token 是 provider 报告的 **Input + Output**。Input 包含 uncached、cache read 与 cache write；不再给缓存命中打 0.1 折扣，也不重复加入已经包含在 Output 中的 reasoning。

模型本地折算：

| 路由 model id | Pro 当量权重 |
|---|---:|
| `deepseek-v4-pro` | ×1 |
| `deepseek-v4-flash` | ×0.5 |
| 缺失、未知及其他模型 | ×0.5 |

默认 `50,000` Pro 当量凝成一炷。夯与拉共用同一库存，一次被接受的选择只消耗一炷。中央梁子只由全局夯率决定：

| 梁位 | 显相 |
|---|---|
| 零票 | 待开梁 |
| `< 50%` | 梁工 |
| `50% ≤ x < 70%` | 梁总 |
| `70% ≤ x < 85%` | 梁神 |
| `85% ≤ x < 95%` | 梁圣 |
| `≥ 95%` | 梁祖 |

梁位与梁子必须来自同一快照。页面显示六位小数并向下截断，避免视觉上越过尚未达到的门槛。

<h2 id="troubleshooting">故障诊断</h2>

### 悬浮入口不见了

1. 查看 `--dump-config` 是否包含 `dsh-liangxiang`。
2. 查看终端是否出现 `host half active`。
3. 请求 `/plugins/dsh-liangxiang/client.js` 是否返回 200。
4. 如果入口被拖到屏幕外，浏览器控制台执行：

```js
localStorage.removeItem('liangxiang:badge-position:v1')
```

这只重置入口位置。

### 工具调用报 `reading 'prepare'`

这通常是 profile 中存在第二份 DSH 内置包。运行：

```bash
node scripts/assert-profile-modules.mjs <DSH_HOME>/profiles/<profile>
```

按报告移除 profile 依赖中的 `@deepseek-ai/dsh-web-app`，保留 bundle 声明，然后重启 WebUI。

### 面板显示“未连上梁相服务”

```bash
curl http://127.0.0.1:<webui>/liangxiang/api/state
curl -m 5 https://api.liang.today/v1/health
```

第一条检查 Host，第二条检查社区节点。两者不是同一层：服务器本机 health 正常，不等于公网链路可达。

### 香火一直是 0

- 先确认当天确实产生了足够用量；默认第一炷需要 50,000 Pro 当量。
- 在线模式必须让 Host 与后端的 `LIANGXIANG_BUSINESS_TZ` 一致，否则跨业务日的声明会被诚实丢弃。
- 本地演示可用 `pnpm run dev:credit` 验证界面，不要伪装成真实 Token。

### 投票失败或返回 502

网络结果不确定时必须重试**同一个** `request_id`；换新 ID 可能导致再次扣香。客户端已经保留原请求 ID，不要通过刷新代码绕过幂等保护。

<h2 id="reset">重置与恢复</h2>

先决定你要重置什么。不同数据不应被“一键全删”混在一起。

| 目的 | 安全操作 | 保留什么 |
|---|---|---|
| 重置悬浮位置 | 删除 `liangxiang:badge-position:v1` | 所有账本与身份 |
| 卸载开发插件 | `pnpm run dev:uninstall` | profile 以外的数据 |
| 重铸本机安装身份 | `pnpm run reset:identity` | Token 水位、每日用量、票与聚合 |
| 清本地演示账本 | `pnpm run reset:staging -- --local` | 安装身份、Token 水位与每日用量 |
| 清自建后端 | 停服务、备份后删除指定 SQLite 文件 | 仅保留备份中的历史 |

重置身份会失去与旧服务端记录的关联；同一设备已绑定旧指纹时，新身份可能先收到 `409 device_conflict`。这不是缓存问题，应使用仓库的身份恢复流程或由服务器运营者在本机 CLI 解绑定，不能通过制造更多身份规避。

执行任何 SQLite 清空前，先复制数据库文件及其 `-wal`、`-shm` 文件，或使用 SQLite 在线一致性备份。不要在服务运行并接收写入时直接复制单个主文件。

<h2 id="pages-deploy">GitHub Pages 官网发布</h2>

官网源码位于 [`liang-today/liang-today.github.io`](https://github.com/liang-today/liang-today.github.io)，使用 Astro 静态输出：正文是 Markdown，首页交互是原生浏览器脚本，不需要服务器运行时。

### 本地预览

```bash
git clone git@github.com:liang-today/liang-today.github.io.git
cd liang-today.github.io
pnpm install --frozen-lockfile
pnpm run check
pnpm run build
pnpm run preview
```

构建产物在 `dist/`；不要手工提交 `dist`。

### GitHub 设置

仓库进入 **Settings → Pages**：

1. `Build and deployment` 的 Source 选择 **GitHub Actions**。
2. `Custom domain` 保持 `liang.today`。
3. DNS 稳定后启用 **Enforce HTTPS**。

每次推送 `main`，`.github/workflows/deploy.yml` 会构建并发布站点。`astro.config.mjs` 的 `site` 是 `https://liang.today`，组织根站不设置 `base`。

### Pages 发布失败

1. 在仓库 **Actions** 打开最近一次 `Deploy Liangxiang site`。
2. 若 build 失败，先在本地用同一 lockfile 执行 `pnpm install --frozen-lockfile && pnpm run build`。
3. 若 deploy 找不到 artifact，确认 build job 成功，deploy job 仍有 `pages: write` 与 `id-token: write` 权限。
4. 若 Actions 成功但域名显示旧页面，检查 Pages Source 是否仍是“Deploy from a branch”，并核对 Custom domain。
5. 若只在 `www` 或裸域失败，检查裸域四条 A 记录与 `www` CNAME；DNS 修好后无需反复修改 `CNAME` 文件。

### 回滚官网

找到最后一个确认正常的提交，然后创建一个**新的回滚提交**并推送；不要强推或改写 `main` 历史。推送后同一工作流会把旧内容重新构建为新的 Pages deployment。

---

更深的服务器架构、隐私清单与测试证据以[插件仓库文档](https://github.com/NiYa193/dsh-liang-meter/tree/main/docs)为准。官网只解释经过验证的当前能力，不携带社区口令、私钥或服务器凭据。
