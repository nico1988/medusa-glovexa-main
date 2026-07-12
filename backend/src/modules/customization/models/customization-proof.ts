import { model } from "@medusajs/framework/utils"
import { PROOF_STATUSES } from "../types"
import { CustomizationRequest } from "./customization-request"

/**
 * A seller-produced proof image awaiting customer sign-off (PRD §6.3).
 * Versioned; keeps the customer's approve/reject decision and comment.
 */
export const CustomizationProof = model.define("customization_proof", {
  id: model.id({ prefix: "cusprf" }).primaryKey(),
  file_id: model.text().nullable(),
  url: model.text(),
  version: model.number().default(1),
  status: model.enum([...PROOF_STATUSES]).default("pending"),
  customer_comment: model.text().nullable(),
  reviewed_by: model.text().nullable(),
  request: model.belongsTo(() => CustomizationRequest, {
    mappedBy: "proofs",
  }),
})
