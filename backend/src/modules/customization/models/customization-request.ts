import { model } from "@medusajs/framework/utils"
import {
  CUSTOMIZATION_METHODS,
  CUSTOMIZATION_MODES,
  CUSTOMIZATION_STATUSES,
} from "../types"
import { CustomizationArtwork } from "./customization-artwork"
import { CustomizationDesign } from "./customization-design"
import { CustomizationProof } from "./customization-proof"

/**
 * One customization configuration attached to a product (and, once ordered, to
 * a cart/order/quote line via module links + line-item metadata). Shared by both
 * the configurator and the online editor — only the editing experience differs.
 */
export const CustomizationRequest = model.define("customization_request", {
  id: model.id({ prefix: "cusreq" }).primaryKey(),
  mode: model.enum([...CUSTOMIZATION_MODES]).default("configurator"),
  method: model.enum([...CUSTOMIZATION_METHODS]).default("logo"),
  status: model.enum([...CUSTOMIZATION_STATUSES]).default("draft"),
  print_technique: model.text().nullable(),
  // configurator-mode selections
  positions: model.json().nullable(),
  text_content: model.json().nullable(),
  color_count: model.number().default(1),
  pantone: model.text().nullable(),
  // ordering context
  product_id: model.text(),
  variant_id: model.text().nullable(),
  customer_id: model.text().nullable(),
  moq: model.number().default(1),
  quantity: model.number().default(1),
  notes: model.text().nullable(),
  designs: model.hasMany(() => CustomizationDesign, { mappedBy: "request" }),
  artworks: model.hasMany(() => CustomizationArtwork, { mappedBy: "request" }),
  proofs: model.hasMany(() => CustomizationProof, { mappedBy: "request" }),
})
