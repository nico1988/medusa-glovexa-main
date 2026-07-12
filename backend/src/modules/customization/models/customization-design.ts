import { model } from "@medusajs/framework/utils"
import { CustomizationRequest } from "./customization-request"

/**
 * A versioned editor output: the structured design_document (PRD §7.4) plus a
 * rendered preview image. `is_current` marks the version in use; `is_draft`
 * marks a saved-but-not-submitted design. Only used when mode = "editor".
 */
export const CustomizationDesign = model.define("customization_design", {
  id: model.id({ prefix: "cusdes" }).primaryKey(),
  template_id: model.text().nullable(),
  name: model.text().nullable(),
  design_document: model.json(),
  preview_url: model.text().nullable(),
  version: model.number().default(1),
  is_current: model.boolean().default(true),
  is_draft: model.boolean().default(false),
  request: model.belongsTo(() => CustomizationRequest, {
    mappedBy: "designs",
  }),
})
