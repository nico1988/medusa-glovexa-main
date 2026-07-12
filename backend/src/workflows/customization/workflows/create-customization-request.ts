import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createCustomizationRequestStep,
  CreateCustomizationRequestInput,
} from "../steps/create-customization-request"
import { linkCustomizationRequestStep } from "../steps/link-customization-request"
import { validateCustomizationStep } from "../steps/validate-customization"
import { PrintArea } from "../../../modules/customization/lib/validate-design-document"

export type CreateCustomizationRequestWorkflowInput =
  CreateCustomizationRequestInput & {
    cart_id?: string | null
    company_id?: string | null
    print_areas?: PrintArea[] | null
    max_colors?: number
  }

/**
 * End-to-end creation of a customization request (PRD §8.4): validate → persist
 * request (+ design version for editor mode) → link to cart / company.
 */
export const createCustomizationRequestWorkflow = createWorkflow(
  "create-customization-request",
  (input: CreateCustomizationRequestWorkflowInput) => {
    validateCustomizationStep({
      quantity: input.quantity,
      moq: input.moq,
      color_count: input.color_count,
      design_document: input.design_document,
      print_areas: input.print_areas,
      max_colors: input.max_colors,
    })

    const { request, design } = createCustomizationRequestStep(input)

    const linkInput = transform({ request, input }, (data) => ({
      request_id: data.request.id,
      cart_id: data.input.cart_id ?? null,
      company_id: data.input.company_id ?? null,
    }))

    linkCustomizationRequestStep(linkInput)

    return new WorkflowResponse({ request, design })
  }
)
