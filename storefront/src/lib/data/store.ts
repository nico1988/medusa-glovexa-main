"use server"

import { sdk } from "@/lib/config"
import { getCacheOptions } from "./cookies"

export type StoreInfo = {
  id: string
  name: string
}

// Fetches the store's public branding info (name) from the backend so the
// storefront doesn't hardcode the store name. Falls back to null on error so
// callers can render a sensible default without crashing the page.
export const retrieveStore = async (): Promise<StoreInfo | null> => {
  const next = {
    ...(await getCacheOptions("store")),
  }

  return sdk.client
    .fetch<{ store: StoreInfo }>(`/store/store-info`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ store }) => store)
    .catch(() => null)
}
