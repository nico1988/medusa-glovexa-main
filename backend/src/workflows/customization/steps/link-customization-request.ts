import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { CUSTOMIZATION_MODULE } from "../../../modules/customization"
import { COMPANY_MODULE } from "../../../modules/company"

export type LinkCustomizationRequestInput = {
  request_id: string
  cart_id?: string | null
  company_id?: string | null
}

/**
 * Associates a customization request with its cart (core承载) and, when known,
 * the buyer's company (history / re-order). Compensation dismisses the links.
 */
export const linkCustomizationRequestStep = createStep(
  "link-customization-request",
  async (input: LinkCustomizationRequestInput, { container }) => {
    const link = container.resolve(ContainerRegistrationKeys.LINK)
    const created: Record<string, Record<string, string>>[] = []

    if (input.cart_id) {
      const def = {
        [Modules.CART]: { cart_id: input.cart_id },
        [CUSTOMIZATION_MODULE]: { customization_request_id: input.request_id },
      }
      await link.create(def)
      created.push(def)
    }

    if (input.company_id) {
      const def = {
        [COMPANY_MODULE]: { company_id: input.company_id },
        [CUSTOMIZATION_MODULE]: { customization_request_id: input.request_id },
      }
      await link.create(def)
      created.push(def)
    }

    return new StepResponse(created, created)
  },
  async (created, { container }) => {
    if (!created?.length) {
      return
    }
    const link = container.resolve(ContainerRegistrationKeys.LINK)
    await link.dismiss(created)
  }
)
