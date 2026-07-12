"use server"

import { sdk } from "@/lib/config"
import { getCacheOptions } from "./cookies"

export type StoreInfo = {
  id: string
  name: string
}

// How often (in seconds) the storefront re-fetches the store name. The store
// name changes rarely and only from the admin, and there is no storefront
// mutation to trigger tag revalidation, so we use time-based revalidation
// instead of `force-cache` — otherwise an admin change would never propagate.
const STORE_REVALIDATE_SECONDS = 60

// Fetches the store's public branding info (name) from the backend so the
// storefront doesn't hardcode the store name. Falls back to null on error so
// callers can render a sensible default without crashing the page.
export const retrieveStore = async (): Promise<StoreInfo | null> => {
  const next = {
    ...(await getCacheOptions("store")),
    revalidate: STORE_REVALIDATE_SECONDS,
  }

  return sdk.client
    .fetch<{ store: StoreInfo }>(`/store/store-info`, {
      method: "GET",
      next,
    })
    .then(({ store }) => store)
    .catch(() => null)
}
