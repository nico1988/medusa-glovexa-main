import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { RemoteQueryFunction } from "@medusajs/framework/types"
import { CUSTOMIZATION_MODULE } from "../../../../../modules/customization"
import CustomizationModuleService from "../../../../../modules/customization/service"

// GET /store/customizations/designs/:id — load a saved design for re-editing.
export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const service = req.scope.resolve<CustomizationModuleService>(
    CUSTOMIZATION_MODULE
  )
  const query = req.scope.resolve<RemoteQueryFunction>(
    ContainerRegistrationKeys.QUERY
  )

  const design = await service.retrieveCustomizationDesign(req.params.id)

  const {
    data: [request],
  } = await query.graph({
    entity: "customization_request",
    fields: ["id", "product_id", "mode", "status"],
    filters: { id: design.request_id },
  })

  res.json({ design, request })
}
