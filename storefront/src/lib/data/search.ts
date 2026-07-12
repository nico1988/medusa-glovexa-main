"use server"

import { HttpTypes } from "@medusajs/types"
import { sdk } from "@/lib/config"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion } from "./regions"

/**
 * Full-text product search backed by MeiliSearch.
 *
 * Goes through the backend's `@rokmohar/medusa-plugin-meilisearch` store route
 * (`GET /store/meilisearch/products`), which resolves the MeiliSearch hits back
 * into full Medusa products — including `calculated_price` for the region — so
 * results render with the same `ProductPreview` component as the rest of the
 * store. This keeps the MeiliSearch key on the backend; the browser never talks
 * to MeiliSearch directly.
 */
export const searchProducts = async ({
  query,
  countryCode,
  limit = 24,
  offset = 0,
}: {
  query: string
  countryCode: string
  limit?: number
  offset?: number
}): Promise<{ products: HttpTypes.StoreProduct[]; count: number }> => {
  const trimmed = query?.trim()

  if (!trimmed) {
    return { products: [], count: 0 }
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return { products: [], count: 0 }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/meilisearch/products`,
      {
        method: "GET",
        query: {
          query: trimmed,
          limit,
          offset,
          // region_id drives calculated_price; the endpoint rejects currency_code.
          region_id: region.id,
          fields: "*variants.calculated_price",
        },
        headers,
        next,
      }
    )
    .then(({ products, count }) => ({
      products: products ?? [],
      count: count ?? 0,
    }))
    .catch(() => ({ products: [], count: 0 }))
}
