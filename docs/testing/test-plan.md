# 测试方案与场景清单（Test Plan）

> 状态：初始化 v0.1 — 2026-07-12
> 覆盖：Medusa 后端 (`backend/`) + Next.js 商城 (`storefront/`)

本项目是两个独立 npm 工程，测试也**分前后端两套体系**。本文件是场景总账：记录「已有基础设施 / 已初始化的场景 / 待补充的场景」，作为后续补测试的路线图。

---

## 0. 关键约定：测试放哪里

**后端测试必须放在 Jest 已配置的位置**（`backend/jest.config.js` 决定），否则跑不到——不要新建游离的顶层目录：

| 类型 | 命令 | testMatch |
|------|------|-----------|
| HTTP 集成 | `pnpm test:integration:http` | `integration-tests/http/**/*.spec.ts` |
| 模块集成 | `pnpm test:integration:modules` | `src/modules/*/__tests__/**/*.ts` |
| 单元 | `pnpm test:unit` | `src/**/__tests__/**/*.unit.spec.ts` |

**前端**此前无任何测试设施，本次新增：`storefront/jest.config.js` + `pnpm test`。
- 单元测试与被测文件就近放 `src/**/__tests__/`（Next/Jest 惯例）。
- 端到端 (Playwright) 预留 `storefront/test/e2e`（本次未引入）。

---

## 1. 后端 (backend)

### 1.1 现有基础设施
- Jest + `@medusajs/test-utils`（`medusaIntegrationTestRunner`，`inApp: true`）。
- 复用工具：`integration-tests/utils/` — `admin.ts`（建管理员/客户 + 鉴权头）、`store.ts`（publishable key + store 头）、`seeder.ts`（region/salesChannel/product/cart 播种）。
- **前置依赖**：HTTP 集成测试需要可用的 **Postgres 测试库**与 `.env.test`；CI 未就绪前需本地起库再跑。

### 1.2 已有场景（仓库既存）
| 文件 | 覆盖 |
|------|------|
| `integration-tests/http/companies/companies.spec.ts` | 公司 CRUD / 员工 |
| `integration-tests/http/quotes/quotes.spec.ts` | Store 侧询价流程 |
| `integration-tests/http/admin/quotes/quotes.spec.ts` | Admin 侧询价管理 |

### 1.3 本次初始化的场景
| 文件 | 覆盖 | 状态 |
|------|------|------|
| `integration-tests/http/store/store-info/store-info.spec.ts` | 自定义 `GET /store/store-info`：① 返回 `store.id`/`store.name`；② 无 publishable key 被拒 | 新增（未在本机跑，需 Postgres） |

### 1.4 待补充场景（建议优先级）
- **Approval 模块**（当前完全无测试）：
  - `store/carts/:id/approvals` 发起审批、`admin/approvals` 审批/拒绝的状态流转。
  - 公司 `approval-settings` 开关对下单流程的影响。
  - 模块级：`src/modules/approval/__tests__/` 用 `moduleIntegrationTestRunner` 测审批状态机。
- **Company 模块**：spending limit（消费额度）在下单/审批中的边界（额度内/超额）。
- **Quote 模块**：报价金额、消息往来、接受报价转订单。
- **Module Links**：`company-carts` / `order-company` 关联在 `query.graph` 下可读。

---

## 2. 前端 (storefront)

### 2.1 本次新增基础设施
- `storefront/jest.config.js`：`@swc/jest` 转译 TS/TSX、`@/*` → `src/*` 路径映射、node 环境。
- 命令：`pnpm test` / `pnpm test:watch`。
- 依赖：`jest` `@types/jest` `@swc/jest` `@swc/core`（dev）。
- **范围**：当前只测**纯逻辑**（`src/lib/util`），无需运行后端。

### 2.2 本次初始化的场景（✅ 全部通过，34 用例）
| 文件 | 被测 | 场景要点 |
|------|------|----------|
| `src/lib/util/__tests__/money.spec.ts` | `convertToLocale` | USD/EUR 格式化、显式 locale(de-DE)、小数位覆盖、缺币种回退；已规避 ICU 空格陷阱 |
| `src/lib/util/__tests__/get-precentage-diff.spec.ts` | `getPercentageDiff` | 折扣百分比、无差异、涨价为负 |
| `src/lib/util/__tests__/isEmpty.spec.ts` | `isEmpty`/`isObject`/`isArray` | 空值矩阵（null/undefined/{}/[]/""/空白）与非空 |
| `src/lib/util/__tests__/get-checkout-step.spec.ts` | `getCheckoutStep` | 结算步骤状态机 6 分支（收货→账单→配送→联系→支付→完成 null） |
| `src/lib/util/__tests__/check-spending-limit.spec.ts` | `checkSpendingLimit` 等 | B2B 消费额度：时间窗计算、窗口内订单求和、超额判定 |

### 2.3 待补充场景
- **纯逻辑**：`sort-products`（按价/时间排序）、`compare-addresses`、`get-cart-approval-status`、`map-approvals-by-cart-id`、`convert-cart-to-csv`。
- **组件测试**（需新增 `jest-environment-jsdom` + `@testing-library/react`）：购物车数量/合计、询价按钮显隐、审批状态徽标。
- **数据层** `src/lib/data/*.ts`（server actions）：以 mock SDK 校验缓存标签、错误回退（`.catch()`）——需要模块级 mock，属集成层。
- **E2E**（预留 `test/e2e`，Playwright）：登录 → 加购 → 提交询价 → 审批 全链路。

---

## 3. 未来：手套定制功能的测试锚点

配合 `docs/glove-customization-prd.md`，定制功能落地时应补：
- **后端**：定制项校验（MOQ/色数/可印区约束）workflow 单测；`save-design` 对 `design_document` 的可印区/DPI 校验；定制项进询价的 link 读写。
- **前端**：编辑器纯逻辑（坐标归一化、可印区越界判定、DPI 计算）优先做**单元测试**（与画布渲染解耦，便于测）；配置器表单校验；`design_document` 序列化/反序列化可复现。
- **约定**：把可测的几何/校验逻辑抽成纯函数放 `src/modules/customization/lib/`，与 Konva/R3F 渲染层分离——这样核心规则能被单测覆盖，而不必驱动 WebGL。

---

## 4. 如何运行

```bash
# 前端（可直接跑，无需后端）
cd storefront && pnpm test

# 后端（需 Postgres 测试库 + .env.test）
cd backend && pnpm test:integration:http
cd backend && pnpm test:integration:modules
cd backend && pnpm test:unit
```
