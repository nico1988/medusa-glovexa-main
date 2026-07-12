import { QUOTE_MODULE } from "./src/modules/quote";
import { APPROVAL_MODULE } from "./src/modules/approval";
import { COMPANY_MODULE } from "./src/modules/company";
import { loadEnv, defineConfig, Modules } from "@medusajs/framework/utils";

loadEnv(process.env.NODE_ENV!, process.cwd());

// Product search is powered by MeiliSearch via @rokmohar/medusa-plugin-meilisearch.
// The plugin is only loaded when MEILISEARCH_HOST is configured, so environments
// without a search engine (e.g. the Jest test suites) boot without it.
const meilisearchPlugins = process.env.MEILISEARCH_HOST
  ? [
      {
        resolve: "@rokmohar/medusa-plugin-meilisearch",
        options: {
          config: {
            host: process.env.MEILISEARCH_HOST,
            apiKey: process.env.MEILISEARCH_API_KEY ?? "",
          },
          settings: {
            products: {
              type: "products",
              enabled: true,
              fields: [
                "id",
                "title",
                "description",
                "handle",
                "variant_sku",
                "thumbnail",
                "categories",
              ],
              indexSettings: {
                searchableAttributes: ["title", "description", "variant_sku"],
                displayedAttributes: [
                  "id",
                  "handle",
                  "title",
                  "description",
                  "variant_sku",
                  "thumbnail",
                ],
                filterableAttributes: ["id", "handle", "categories"],
              },
              primaryKey: "id",
            },
          },
        },
      },
    ]
  : [];

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  plugins: [...meilisearchPlugins],
  modules: {
    [COMPANY_MODULE]: {
      resolve: "./modules/company",
    },
    [QUOTE_MODULE]: {
      resolve: "./modules/quote",
    },
    [APPROVAL_MODULE]: {
      resolve: "./modules/approval",
    },
    [Modules.CACHE]: {
      resolve: "@medusajs/medusa/cache-inmemory",
    },
    [Modules.WORKFLOW_ENGINE]: {
      resolve: "@medusajs/medusa/workflow-engine-inmemory",
    },
  },
});
