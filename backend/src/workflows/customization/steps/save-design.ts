import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { CUSTOMIZATION_MODULE } from "../../../modules/customization"
import CustomizationModuleService from "../../../modules/customization/service"
import { DesignDocument } from "../../../modules/customization/lib/validate-design-document"

export type SaveDesignInput = {
  request_id: string
  design_id?: string | null
  template_id?: string | null
  name?: string | null
  design_document: DesignDocument
  preview_url?: string | null
  is_draft?: boolean
}

/**
 * Persists a design version for a request. Updating an existing draft edits it
 * in place; otherwise a new version is created and marked current (older
 * versions keep their history — PRD §12 data reproducibility).
 */
export const saveDesignStep = createStep(
  "save-design",
  async (input: SaveDesignInput, { container }) => {
    const service = container.resolve<CustomizationModuleService>(
      CUSTOMIZATION_MODULE
    )

    // design_document is free-form JSON; the typed shape is validated
    // separately by validateDesignDocument.
    const designDocument = input.design_document as Record<string, unknown>
    let design: { id: string; [key: string]: unknown }
    let createdId: string | null = null
    let updatedFrom: { id: string; [key: string]: unknown } | null = null

    if (input.design_id) {
      const before = await service.retrieveCustomizationDesign(input.design_id)
      design = await service.updateCustomizationDesigns({
        id: input.design_id,
        design_document: designDocument,
        preview_url: input.preview_url ?? before.preview_url,
        name: input.name ?? before.name,
        template_id: input.template_id ?? before.template_id,
        is_draft: input.is_draft ?? before.is_draft,
      })
      updatedFrom = before
    } else {
      const existing = await service.listCustomizationDesigns({
        request_id: input.request_id,
      })
      const nextVersion =
        existing.reduce((max, d) => Math.max(max, d.version ?? 0), 0) + 1

      // Demote previous current versions.
      for (const d of existing.filter((d) => d.is_current)) {
        await service.updateCustomizationDesigns({ id: d.id, is_current: false })
      }

      design = await service.createCustomizationDesigns({
        request_id: input.request_id,
        template_id: input.template_id ?? null,
        name: input.name ?? null,
        design_document: designDocument,
        preview_url: input.preview_url ?? null,
        version: nextVersion,
        is_current: true,
        is_draft: input.is_draft ?? true,
      })
      createdId = design.id
    }

    return new StepResponse({ design }, { createdId, updatedFrom })
  },
  async (revert, { container }) => {
    if (!revert) {
      return
    }
    const service = container.resolve<CustomizationModuleService>(
      CUSTOMIZATION_MODULE
    )
    if (revert.createdId) {
      await service.deleteCustomizationDesigns(revert.createdId)
    } else if (revert.updatedFrom) {
      const prev = revert.updatedFrom
      await service.updateCustomizationDesigns({
        id: prev.id,
        design_document: prev.design_document as Record<string, unknown>,
        preview_url: (prev.preview_url as string | null) ?? null,
        name: (prev.name as string | null) ?? null,
        is_draft: (prev.is_draft as boolean | undefined) ?? false,
      })
    }
  }
)
