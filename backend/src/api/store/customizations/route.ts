import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework"
import { RemoteQueryFunction } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createCustomizationRequestWorkflow } from "../../../workflows/customization/workflows/create-customization-request"
import { CreateCustomizationType } from "./validators"
import { getProductDesignTemplate, maxColorsForTemplate } from "./helpers"

// GET /store/customizations — list the caller's customization requests.
export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve<RemoteQueryFunction>(
    ContainerRegistrationKeys.QUERY
  )

  const customerId = req.auth_context?.actor_id
  const { fields, pagination } = req.queryConfig

  const { data: customizations, metadata } = await query.graph({
    entity: "customization_request",
    fields,
    filters: (customerId ? { customer_id: customerId } : {}) as Record<
      string,
      unknown
    >,
    pagination: { ...pagination, skip: pagination.skip! },
  })

  res.json({
    customizations,
    count: metadata?.count ?? customizations.length,
    offset: metadata?.skip ?? 0,
    limit: metadata?.take ?? customizations.length,
  })
}

// POST /store/customizations — create a request (configurator or editor) and
// link it to the cart. Print-area constraints are resolved server-side.
export const POST = async (
  req: AuthenticatedMedusaRequest<CreateCustomizationType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve<RemoteQueryFunction>(
    ContainerRegistrationKeys.QUERY
  )
  const body = req.validatedBody
  const customerId = req.auth_context?.actor_id ?? null

  const template = await getProductDesignTemplate(query, body.product_id)

  const {
    result: { request },
  } = await createCustomizationRequestWorkflow(req.scope).run({
    input: {
      ...body,
      customer_id: customerId,
      template_id: body.template_id ?? template?.id ?? null,
      print_areas: template?.print_areas ?? null,
      max_colors: maxColorsForTemplate(template) || undefined,
    },
  })

  const {
    data: [customization],
  } = await query.graph({
    entity: "customization_request",
    fields: req.queryConfig.fields,
    filters: { id: request.id },
  })

  res.status(201).json({ customization })
}
