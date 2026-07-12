import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework"
import { RemoteQueryFunction } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// GET /store/customizations/:id — full detail of a customization request.
export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve<RemoteQueryFunction>(
    ContainerRegistrationKeys.QUERY
  )

  const {
    data: [customization],
  } = await query.graph({
    entity: "customization_request",
    fields: req.queryConfig.fields,
    filters: { id: req.params.id },
  })

  if (!customization) {
    return res.status(404).json({ message: "Customization not found" })
  }

  res.json({ customization })
}
