import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { RemoteQueryFunction } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { CUSTOMIZATION_MODULE } from "../../../../../modules/customization"
import CustomizationModuleService from "../../../../../modules/customization/service"
import { getProductDesignTemplate } from "../../../../store/customizations/helpers"
import { UpsertDesignTemplateType } from "../../../customizations/validators"

// GET /admin/products/:id/design-template — current template for a product.
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve<RemoteQueryFunction>(
    ContainerRegistrationKeys.QUERY
  )
  const template = await getProductDesignTemplate(query, req.params.id)
  res.json({ template })
}

// POST /admin/products/:id/design-template — create or update the product's
// design template (assets + print areas) and link it to the product.
export const POST = async (
  req: MedusaRequest<UpsertDesignTemplateType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve<RemoteQueryFunction>(
    ContainerRegistrationKeys.QUERY
  )
  const service = req.scope.resolve<CustomizationModuleService>(
    CUSTOMIZATION_MODULE
  )
  const link = req.scope.resolve(ContainerRegistrationKeys.LINK)
  const productId = req.params.id
  const body = req.validatedBody

  const existing = await getProductDesignTemplate(query, productId)

  // json column stores the array at runtime; the generated type widens the
  // field to a single object, so assert through unknown.
  const printAreas = body.print_areas as unknown as Record<string, unknown>

  let template
  if (existing) {
    template = await service.updateDesignTemplates({
      id: existing.id,
      template_type: body.template_type,
      name: body.name ?? null,
      base_asset_url: body.base_asset_url ?? null,
      model_asset_url: body.model_asset_url ?? null,
      print_areas: printAreas,
      is_active: body.is_active ?? true,
    })
  } else {
    template = await service.createDesignTemplates({
      product_id: productId,
      template_type: body.template_type,
      name: body.name ?? null,
      base_asset_url: body.base_asset_url ?? null,
      model_asset_url: body.model_asset_url ?? null,
      print_areas: printAreas,
      is_active: body.is_active ?? true,
    })

    await link.create({
      [Modules.PRODUCT]: { product_id: productId },
      [CUSTOMIZATION_MODULE]: { design_template_id: template.id },
    })
  }

  res.status(201).json({ template })
}
