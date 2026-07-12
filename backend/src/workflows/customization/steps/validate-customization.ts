import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import {
  DesignDocument,
  PrintArea,
  validateDesignDocument,
} from "../../../modules/customization/lib/validate-design-document"

export type ValidateCustomizationInput = {
  quantity: number
  moq: number
  color_count?: number
  design_document?: DesignDocument | null
  print_areas?: PrintArea[] | null
  max_colors?: number
}

/**
 * Server-authoritative validation (PRD §12): MOQ, color count and — for editor
 * output — that every element sits inside its safe print area. No side effects,
 * so no compensation is needed. Returns any non-blocking warnings (e.g. low DPI).
 */
export const validateCustomizationStep = createStep(
  "validate-customization",
  async (input: ValidateCustomizationInput) => {
    const errors: string[] = []
    let warnings: string[] = []

    if (input.quantity < input.moq) {
      errors.push(
        `Quantity ${input.quantity} is below the minimum order quantity of ${input.moq}`
      )
    }

    if (
      input.max_colors &&
      input.color_count &&
      input.color_count > input.max_colors
    ) {
      errors.push(
        `Selected ${input.color_count} colors exceeds the ${input.max_colors}-color limit`
      )
    }

    if (input.design_document && input.print_areas) {
      const result = validateDesignDocument(
        input.design_document,
        input.print_areas,
        { maxColors: input.max_colors }
      )
      errors.push(...result.errors)
      warnings = result.warnings
    }

    if (errors.length) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, errors.join("; "))
    }

    return new StepResponse({ warnings })
  }
)
