"use server"

import { sdk } from "@/lib/config"
import { addToCart, getOrSetCart } from "@/lib/data/cart"
import { getAuthHeaders, getCacheOptions, getCacheTag } from "@/lib/data/cookies"
import {
  CUSTOMIZATION_CACHE_TAG,
  LINE_ITEM_CUSTOMIZATION_ID,
  LINE_ITEM_CUSTOMIZATION_MODE,
  LINE_ITEM_CUSTOMIZATION_PREVIEW,
} from "@/modules/customization/constants"
import {
  DesignDocument,
  DesignTemplate,
  SavedDesign,
} from "@/modules/customization/types"
import { revalidateTag } from "next/cache"

type TemplateResponse = { template: DesignTemplate | null }
type UploadResponse = {
  file: { id: string; url: string; filename: string; mime_type: string }
}
type SaveDesignResponse = { request_id: string; design: SavedDesign }
type LoadDesignResponse = {
  design: SavedDesign
  request: { id: string; product_id: string; mode: string; status: string }
}
type CustomizationResponse = {
  customization: {
    id: string
    status: string
    mode: string
    method: string
    quantity: number
    [key: string]: unknown
  }
}
type CustomizationsResponse = {
  customizations: CustomizationResponse["customization"][]
  count: number
}

// The product's design template, or null → storefront falls back to configurator.
export const getDesignTemplate = async (
  productId: string
): Promise<DesignTemplate | null> => {
  const next = { ...(await getCacheOptions("design-template")) }
  return sdk.client
    .fetch<TemplateResponse>(`/store/products/${productId}/design-template`, {
      method: "GET",
      headers: { ...(await getAuthHeaders()) },
      next,
    })
    .then((r) => r.template)
    .catch(() => null)
}

// Stores an image (artwork / preview export) via the File module. `dataBase64`
// must be the raw base64 payload (no data: URL prefix).
export const uploadCustomizationFile = async (input: {
  filename: string
  mimeType: string
  dataBase64: string
}): Promise<UploadResponse["file"]> => {
  return sdk.client
    .fetch<UploadResponse>(`/store/customizations/uploads`, {
      method: "POST",
      body: {
        filename: input.filename,
        mime_type: input.mimeType,
        data: input.dataBase64,
      },
      headers: { ...(await getAuthHeaders()) },
    })
    .then((r) => r.file)
}

// Saves / updates an editor design (draft). Creates a draft request on first save.
export const saveDesign = async (input: {
  request_id?: string | null
  design_id?: string | null
  product_id: string
  template_id?: string | null
  name?: string | null
  design_document: DesignDocument
  preview_url?: string | null
  is_draft?: boolean
}): Promise<SaveDesignResponse> => {
  return sdk.client.fetch<SaveDesignResponse>(
    `/store/customizations/designs`,
    {
      method: "POST",
      body: input,
      headers: { ...(await getAuthHeaders()) },
    }
  )
}

// Loads a saved design for re-editing.
export const loadDesign = async (
  designId: string
): Promise<LoadDesignResponse> => {
  return sdk.client.fetch<LoadDesignResponse>(
    `/store/customizations/designs/${designId}`,
    { method: "GET", headers: { ...(await getAuthHeaders()) } }
  )
}

// Finalizes a customization request (ready to add to cart / request a quote).
export const createCustomizationRequest = async (input: {
  mode: "configurator" | "editor"
  method: "logo" | "text" | "both"
  product_id: string
  variant_id?: string | null
  quantity: number
  moq: number
  color_count?: number
  print_technique?: string | null
  positions?: unknown
  text_content?: unknown
  pantone?: string | null
  notes?: string | null
  template_id?: string | null
  design_document?: DesignDocument | null
  preview_url?: string | null
  cart_id?: string | null
  company_id?: string | null
}): Promise<CustomizationResponse> => {
  return sdk.client
    .fetch<CustomizationResponse>(`/store/customizations`, {
      method: "POST",
      body: input,
      headers: { ...(await getAuthHeaders()) },
    })
    .finally(async () => {
      revalidateTag(await getCacheTag(CUSTOMIZATION_CACHE_TAG))
    })
}

export const listCustomizations =
  async (): Promise<CustomizationsResponse> => {
    const next = { ...(await getCacheOptions(CUSTOMIZATION_CACHE_TAG)) }
    return sdk.client.fetch<CustomizationsResponse>(`/store/customizations`, {
      method: "GET",
      headers: { ...(await getAuthHeaders()) },
      next,
    })
  }

// Orchestrates ordering a customized item: ensure a cart, persist the request
// (linked to the cart), then add a line item carrying the customization refs.
export const addCustomizationToCart = async (input: {
  countryCode: string
  variantId: string
  quantity: number
  moq: number
  mode: "configurator" | "editor"
  method: "logo" | "text" | "both"
  product_id: string
  template_id?: string | null
  color_count?: number
  print_technique?: string | null
  positions?: unknown
  text_content?: unknown
  notes?: string | null
  design_document?: DesignDocument | null
  preview_url?: string | null
}): Promise<{ customizationId: string }> => {
  const cart = await getOrSetCart(input.countryCode)
  if (!cart) {
    throw new Error("Could not create a cart for the customization")
  }

  const { customization } = await createCustomizationRequest({
    mode: input.mode,
    method: input.method,
    product_id: input.product_id,
    variant_id: input.variantId,
    quantity: input.quantity,
    moq: input.moq,
    color_count: input.color_count,
    print_technique: input.print_technique ?? null,
    positions: input.positions,
    text_content: input.text_content,
    notes: input.notes ?? null,
    template_id: input.template_id ?? null,
    design_document: input.design_document ?? null,
    preview_url: input.preview_url ?? null,
    cart_id: cart.id,
  })

  await addToCart({
    variantId: input.variantId,
    quantity: input.quantity,
    countryCode: input.countryCode,
    metadata: {
      [LINE_ITEM_CUSTOMIZATION_ID]: customization.id,
      [LINE_ITEM_CUSTOMIZATION_PREVIEW]: input.preview_url ?? null,
      [LINE_ITEM_CUSTOMIZATION_MODE]: input.mode,
    },
  })

  return { customizationId: customization.id }
}

export const respondToProof = async (
  customizationId: string,
  input: { proof_id: string; action: "approve" | "reject"; comment?: string }
): Promise<{ success: boolean; status: string }> => {
  return sdk.client
    .fetch<{ success: boolean; status: string }>(
      `/store/customizations/${customizationId}/proof-response`,
      {
        method: "POST",
        body: input,
        headers: { ...(await getAuthHeaders()) },
      }
    )
    .finally(async () => {
      revalidateTag(await getCacheTag(CUSTOMIZATION_CACHE_TAG))
    })
}
