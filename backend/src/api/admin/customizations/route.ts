import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { RemoteQueryFunction } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// GET /admin/customizations — list all customization requests for review.
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve<RemoteQueryFunction>(
    ContainerRegistrationKeys.QUERY
  )

  const { fields, pagination } = req.queryConfig

  const { data: customizations, metadata } = await query.graph({
    entity: "customization_request",
    fields,
    pagination: { ...pagination, skip: pagination.skip! },
  })

  res.json({
    customizations,
    count: metadata?.count ?? customizations.length,
    offset: metadata?.skip ?? 0,
    limit: metadata?.take ?? customizations.length,
  })
}
