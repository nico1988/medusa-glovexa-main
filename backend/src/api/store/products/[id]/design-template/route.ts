import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework"
import { RemoteQueryFunction } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { getProductDesignTemplate } from "../../../customizations/helpers"

// GET /store/products/:id/design-template — the design template the editor
// initialises from. `null` means the product falls back to the configurator.
export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve<RemoteQueryFunction>(
    ContainerRegistrationKeys.QUERY
  )

  const template = await getProductDesignTemplate(query, req.params.id)

  res.json({ template })
}
