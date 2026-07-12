import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework"
import { RemoteQueryFunction } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { CUSTOMIZATION_MODULE } from "../../../../modules/customization"
import CustomizationModuleService from "../../../../modules/customization/service"
import { saveDesignWorkflow } from "../../../../workflows/customization/workflows/save-design"
import { SaveDesignType } from "../validators"
import { getProductDesignTemplate, maxColorsForTemplate } from "../helpers"

// POST /store/customizations/designs — save or update an editor design (draft).
// Creates a draft request on first save so drafts can be reloaded and re-edited.
export const POST = async (
  req: AuthenticatedMedusaRequest<SaveDesignType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve<RemoteQueryFunction>(
    ContainerRegistrationKeys.QUERY
  )
  const service = req.scope.resolve<CustomizationModuleService>(
    CUSTOMIZATION_MODULE
  )
  const body = req.validatedBody
  const customerId = req.auth_context?.actor_id ?? null

  const template = await getProductDesignTemplate(query, body.product_id)

  let requestId = body.request_id ?? null
  if (!requestId) {
    const request = await service.createCustomizationRequests({
      mode: "editor",
      method: "both",
      status: "draft",
      product_id: body.product_id,
      customer_id: customerId,
    })
    requestId = request.id
  }

  const {
    result: { design },
  } = await saveDesignWorkflow(req.scope).run({
    input: {
      request_id: requestId,
      design_id: body.design_id ?? null,
      template_id: body.template_id ?? template?.id ?? null,
      name: body.name ?? null,
      design_document: body.design_document,
      preview_url: body.preview_url ?? null,
      is_draft: body.is_draft ?? true,
      print_areas: template?.print_areas ?? null,
      max_colors: maxColorsForTemplate(template) || undefined,
    },
  })

  res.status(201).json({ request_id: requestId, design })
}
