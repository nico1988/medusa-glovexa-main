import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { saveDesignStep, SaveDesignInput } from "../steps/save-design"
import { validateCustomizationStep } from "../steps/validate-customization"
import { PrintArea } from "../../../modules/customization/lib/validate-design-document"

export type SaveDesignWorkflowInput = SaveDesignInput & {
  print_areas?: PrintArea[] | null
  max_colors?: number
  // MOQ is not enforced on draft save; pass 1/1 so validation focuses on the doc.
  quantity?: number
  moq?: number
}

/**
 * Validates a design_document against the template's print areas, then persists
 * it as a (draft) version (PRD §8.4 save-design).
 */
export const saveDesignWorkflow = createWorkflow(
  "save-design",
  (input: SaveDesignWorkflowInput) => {
    validateCustomizationStep({
      quantity: input.quantity ?? 1,
      moq: input.moq ?? 1,
      max_colors: input.max_colors,
      design_document: input.design_document,
      print_areas: input.print_areas,
    })

    const { design } = saveDesignStep(input)

    return new WorkflowResponse({ design })
  }
)
