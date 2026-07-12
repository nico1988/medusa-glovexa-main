import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { CUSTOMIZATION_MODULE } from "../../../modules/customization"
import CustomizationModuleService from "../../../modules/customization/service"
import {
  CustomizationMethod,
  CustomizationMode,
} from "../../../modules/customization/types"
import { DesignDocument } from "../../../modules/customization/lib/validate-design-document"

export type CreateCustomizationRequestInput = {
  mode: CustomizationMode
  method: CustomizationMethod
  product_id: string
  variant_id?: string | null
  customer_id?: string | null
  quantity: number
  moq: number
  color_count?: number
  print_technique?: string | null
  positions?: unknown
  text_content?: unknown
  pantone?: string | null
  notes?: string | null
  // editor output
  template_id?: string | null
  design_document?: DesignDocument | null
  preview_url?: string | null
}

/**
 * Persists a customization_request (and, for editor mode, its first design
 * version). Compensation deletes both so a failed workflow leaves no orphans.
 */
export const createCustomizationRequestStep = createStep(
  "create-customization-request",
  async (input: CreateCustomizationRequestInput, { container }) => {
    const service = container.resolve<CustomizationModuleService>(
      CUSTOMIZATION_MODULE
    )

    const request = await service.createCustomizationRequests({
      mode: input.mode,
      method: input.method,
      status: "submitted",
      product_id: input.product_id,
      variant_id: input.variant_id ?? null,
      customer_id: input.customer_id ?? null,
      quantity: input.quantity,
      moq: input.moq,
      color_count: input.color_count ?? 1,
      print_technique: input.print_technique ?? null,
      positions: (input.positions ?? null) as Record<string, unknown> | null,
      text_content: (input.text_content ?? null) as
        | Record<string, unknown>
        | null,
      pantone: input.pantone ?? null,
      notes: input.notes ?? null,
    })

    let design: { id: string } | null = null
    if (input.mode === "editor" && input.design_document) {
      design = await service.createCustomizationDesigns({
        request_id: request.id,
        template_id: input.template_id ?? null,
        // design_document is free-form JSON; the typed shape is validated
        // separately by validateDesignDocument.
        design_document: input.design_document as Record<string, unknown>,
        preview_url: input.preview_url ?? null,
        version: 1,
        is_current: true,
        is_draft: false,
      })
    }

    return new StepResponse(
      { request, design },
      { requestId: request.id, designId: design?.id ?? null }
    )
  },
  async (revert, { container }) => {
    if (!revert) {
      return
    }
    const service = container.resolve<CustomizationModuleService>(
      CUSTOMIZATION_MODULE
    )
    if (revert.designId) {
      await service.deleteCustomizationDesigns(revert.designId)
    }
    await service.deleteCustomizationRequests(revert.requestId)
  }
)
