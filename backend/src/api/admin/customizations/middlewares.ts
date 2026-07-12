import {
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework"
import { MiddlewareRoute } from "@medusajs/medusa"
import {
  listAdminCustomizationsQueryConfig,
  retrieveAdminCustomizationQueryConfig,
} from "./query-config"
import {
  AdminGetCustomizationParams,
  UploadProof,
  UpsertDesignTemplate,
} from "./validators"

export const adminCustomizationsMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/admin/customizations",
    middlewares: [
      validateAndTransformQuery(
        AdminGetCustomizationParams,
        listAdminCustomizationsQueryConfig
      ),
    ],
  },
  {
    method: ["GET"],
    matcher: "/admin/customizations/:id",
    middlewares: [
      validateAndTransformQuery(
        AdminGetCustomizationParams,
        retrieveAdminCustomizationQueryConfig
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/customizations/:id/proofs",
    middlewares: [validateAndTransformBody(UploadProof)],
  },
  {
    method: ["POST"],
    matcher: "/admin/products/:id/design-template",
    middlewares: [validateAndTransformBody(UpsertDesignTemplate)],
  },
]
