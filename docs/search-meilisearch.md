# 产品搜索：MeiliSearch 接入

> 状态：已实现并本地验证 — 2026-07-12

商城的产品全文搜索由 **MeiliSearch** 提供，后端通过 `@rokmohar/medusa-plugin-meilisearch` 建索引，前端走轻量 server action 调用插件的 store 路由。浏览器不直接连 MeiliSearch，搜索密钥只留在后端。

## 架构

```
用户在导航栏搜索框输入 → 跳转 /[countryCode]/search?q=...
  → (RSC) searchProducts()  [storefront/src/lib/data/search.ts]
    → GET /store/meilisearch/products   (Medusa 后端 + publishable key)
      → 插件用 MeiliSearch 取候选 id + 排序，再用 query.graph 回填成完整 Medusa 商品
        （含当前 region 的 calculated_price）
  → 用现有 ProductPreview 组件渲染结果网格
```

- **后端索引**：插件订阅商品事件（创建/更新/删除）自动增量索引；启动时 loader 创建索引并应用 settings。
- **前端复用**：`/store/meilisearch/products` 返回的是完整 Medusa 商品（带价格），所以搜索结果和普通商品列表用同一套 `ProductPreview`。

## 本地启动

```bash
# 1) 起 MeiliSearch（仓库根目录）
docker compose up -d meilisearch          # http://localhost:7700

# 2) 后端配置（backend/.env，已按 .env.template 配好）
#    MEILISEARCH_HOST=http://127.0.0.1:7700
#    MEILISEARCH_API_KEY=masterKey_dev
#    ⚠️ MEILISEARCH_HOST 为空时插件不加载（测试环境即如此，保持 hermetic）

# 3) 启动/重启后端 —— 新增插件后必须“完整重启”，
#    仅热重载不会注册插件的 API 路由（否则 /store/meilisearch/* 会 404）
cd backend && pnpm dev

# 4) 首次把已有商品灌入索引（订阅器只对新事件生效）
#    Admin UI 触发，或调用同步接口：
curl -X POST http://localhost:9000/admin/meilisearch/sync \
  -H "Authorization: Bearer <ADMIN_JWT>"

# 5) 前端
cd storefront && pnpm dev                 # http://localhost:8000
```

## 验证（已跑通）

```bash
# 直接查 MeiliSearch
curl -H "Authorization: Bearer masterKey_dev" \
  -X POST http://localhost:7700/indexes/products/search \
  -H 'Content-Type: application/json' -d '{"q":"nitrile"}'

# 走后端 store 路由（storefront 用的就是这个）
curl -H "x-publishable-api-key: <PK>" \
  "http://localhost:9000/store/meilisearch/products?query=nitrile&region_id=<REGION_ID>"
# → 返回 5 个 nitrile 手套，带 region 价格
```

## 改动清单

**后端**
- `backend/medusa-config.ts` — 条件加载插件（`MEILISEARCH_HOST` 存在才加载），配置 `products` 索引的 searchable/displayed/filterable 字段。
- `backend/.env` / `.env.template` — 新增 `MEILISEARCH_HOST` / `MEILISEARCH_API_KEY`。
- 依赖：`@rokmohar/medusa-plugin-meilisearch`、`meilisearch`。

**前端**
- `storefront/src/lib/data/search.ts` — `searchProducts()` server action（调用 `/store/meilisearch/products`）。
- `storefront/src/modules/layout/components/search-bar/index.tsx` — 导航栏可用搜索框（客户端组件，回车跳搜索页）。
- `storefront/src/modules/layout/templates/nav/index.tsx` — 用 `SearchBar` 替换原来的 disabled 输入框。
- `storefront/src/app/[countryCode]/(main)/search/page.tsx` — 搜索结果页。
- 前端**无新增依赖**（走 SDK fetch，不直连 MeiliSearch）。

**根目录**
- `docker-compose.yml` — MeiliSearch v1.10 服务。

## 生产注意

- 用一个足够长的随机 `MEILI_MASTER_KEY`；给前端/公开侧只发**搜索专用 key**（scoped search-only key），绝不下发 master key。本方案前端本就不接触密钥（走后端），已规避此风险。
- Worker 模式：插件订阅器需要 `shared`（默认）或独立 worker 实例；**不要**设 `MEDUSA_WORKER_MODE=server`，否则事件不触发、索引不更新。
- 商品需为 `published` 才会进入 store 搜索（草稿商品被排除）。

## 待办 / 可选增强

- 商品列表页 `refinement-list/search-in-results` 组件目前仍是 disabled（“在当前结果内筛选”，语义不同），可后续接同一搜索。
- 可加类目索引（插件支持 `categories`）做分面过滤，或前端换 `react-instantsearch` 做输入即搜/facet。
