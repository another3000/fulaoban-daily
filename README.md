# 亿万富翁导师 · WEALTH MENTOR（GitHub Pages）

纯静态日报站：首页日历 + 列表，按分组浏览「富老板一课」。无需 npm / 构建。

## 仓库与 Pages 设置（owner: `another3000`）

1. 把本目录推到 GitHub 仓库（例如 `another3000/wealth-mentor` 或 `another3000/fulaoban`）。
2. Repo **Settings → Pages**：
   - Source: **Deploy from a branch**
   - Branch: `main`（或 `master`）
   - Folder: `/ (root)`
3. 数分钟后打开：`https://another3000.github.io/<repo>/`

本站根目录即 `index.html`，适合 **root** 发布。若以后放到 `/docs`，把 Pages Folder 改成 `/docs`，并把整个站点移入 `docs/`。

## 目录结构

```
index.html                 # 首页：品牌头、分组 Tab、日历、列表
assets/site.css            # 深金 / 海军蓝品牌样式
assets/site.js             # 读 manifest，渲染日历与列表
content/manifest.json      # 全部文章索引（数据源）
posts/<group-slug>/YYYY-MM-DD.html
README.md
```

当前分组 slug：`fulaoban` → 显示名「富老板」。

## 已收录课次

| 日期 | 课次 | 标题 |
|------|------|------|
| 2026-10-19 | 2 | 谁能批预算，谁才是真买家 |
| 2026-10-20 | 3 | 报价锚点：三档菜单先抬价 |
| 2026-10-21 | 4 | 止损线与让步阶梯 |
| 2026-10-22 | 5 | 预付与里程碑：先收钱再开工 |

**说明：** 课次 1（约 2026-10-18 · 结果包）当时未留下独立报刊 HTML，本站从 10/19 起收录。若补回第 1 课，按下方「新增一篇」流程加入即可。

## 新增一篇课（每日例行）

1. 写好报刊 HTML，存为：
   `posts/fulaoban/YYYY-MM-DD.html`
   （页头保留「返回财富日历」链接；可用现有课页当模板。）
2. 在 `content/manifest.json` 的 `posts` 数组里追加一条（或插到合适位置；首页会按 `date` 倒序）：

```json
{
  "id": "fulaoban-YYYY-MM-DD",
  "date": "YYYY-MM-DD",
  "title": "富老板一课 · M/D｜标题",
  "group": "富老板",
  "group_slug": "fulaoban",
  "path": "posts/fulaoban/YYYY-MM-DD.html",
  "lesson": 6,
  "vol": "VOL.01 NO.06",
  "blurb": "一句话导读，出现在首页列表。"
}
```

3. `git add` → `commit` → `push`；Pages 自动更新。本地可直接打开 `index.html`（若 `fetch` 被浏览器挡，用任意静态服务器，例如 `python3 -m http.server`）。

## 新分组

1. 建目录：`posts/<group-slug>/`
2. 在 `manifest.json` 的 `groups` 增加：

```json
{ "id": "xxx", "name": "显示名", "slug": "xxx", "description": "…" }
```

3. 该组文章的 `group` 用显示名，`group_slug` / `path` 对应该目录。首页 Tab 会自动出现。

## 本地预览

```bash
cd /path/to/this-repo
python3 -m http.server 8080
# 浏览器打开 http://127.0.0.1:8080/
```

## 设计约定

- 视觉：深海军蓝 + 香槟金，报刊感，非通用 Bootstrap。
- 数据：浏览器端读 `content/manifest.json`，无构建步骤。
- 时区文案：面向 Asia/Shanghai 读者；`date` 字段用 `YYYY-MM-DD` 日历日。
