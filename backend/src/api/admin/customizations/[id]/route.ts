import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { RemoteQueryFunction } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// GET /admin/customizations/:id — full detail (designs / artworks / proofs).
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
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
