import { model } from "@medusajs/framework/utils"
import { CustomizationRequest } from "./customization-request"

/**
 * A customer-uploaded artwork file (LOGO / design source), versioned. The file
 * itself lives in the Medusa File module; here we keep its URL + metadata.
 */
export const CustomizationArtwork = model.define("customization_artwork", {
  id: model.id({ prefix: "cusart" }).primaryKey(),
  file_id: model.text().nullable(),
  url: model.text(),
  original_filename: model.text(),
  mime: model.text().nullable(),
  width: model.number().nullable(),
  height: model.number().nullable(),
  version: model.number().default(1),
  is_current: model.boolean().default(true),
  request: model.belongsTo(() => CustomizationRequest, {
    mappedBy: "artworks",
  }),
})
