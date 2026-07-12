import {
  PRODUCT_CUSTOMIZABLE_FLAG,
  PRODUCT_CUSTOMIZATION_MOQ,
  PRODUCT_CUSTOMIZATION_SETUP_FEE,
} from "../constants"

export type ProductCustomizationConfig = {
  isCustomizable: boolean
  moq: number
  setupFee: number | null
}

const toNumber = (v: unknown): number | null => {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

// Reads the customization config a product carries in its metadata (set by
// admin / the configure script). Kept in one place so the product page and the
// editor route agree on defaults.
export function getProductCustomization(
  metadata: Record<string, unknown> | null | undefined
): ProductCustomizationConfig {
  const isCustomizable =
    String(metadata?.[PRODUCT_CUSTOMIZABLE_FLAG] ?? "") === "true"
  return {
    isCustomizable,
    moq: toNumber(metadata?.[PRODUCT_CUSTOMIZATION_MOQ]) ?? 1,
    setupFee: toNumber(metadata?.[PRODUCT_CUSTOMIZATION_SETUP_FEE]),
  }
}
