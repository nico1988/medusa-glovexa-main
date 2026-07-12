import {
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework"
import { MiddlewareRoute } from "@medusajs/medusa"
import {
  listCustomizationsQueryConfig,
  retrieveCustomizationQueryConfig,
} from "./query-config"
import {
  CreateCustomization,
  GetCustomizationParams,
  ProofResponse,
  SaveDesign,
  UploadCustomizationFile,
} from "./validators"

export const storeCustomizationsMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/store/customizations",
    middlewares: [
      validateAndTransformQuery(
        GetCustomizationParams,
        listCustomizationsQueryConfig
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/store/customizations",
    middlewares: [
      validateAndTransformBody(CreateCustomization),
      validateAndTransformQuery(
        GetCustomizationParams,
        retrieveCustomizationQueryConfig
      ),
    ],
  },
  {
    method: ["GET"],
    matcher: "/store/customizations/:id",
    middlewares: [
      validateAndTransformQuery(
        GetCustomizationParams,
        retrieveCustomizationQueryConfig
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/store/customizations/:id/proof-response",
    middlewares: [validateAndTransformBody(ProofResponse)],
  },
  {
    method: ["POST"],
    matcher: "/store/customizations/designs",
    middlewares: [validateAndTransformBody(SaveDesign)],
  },
  {
    method: ["POST"],
    matcher: "/store/customizations/uploads",
    middlewares: [validateAndTransformBody(UploadCustomizationFile)],
  },
]
