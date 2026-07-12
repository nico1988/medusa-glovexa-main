import { model } from "@medusajs/framework/utils"
import { TEMPLATE_TYPES } from "../types"

/**
 * A visual template configured on a product. Carries the base asset (2D image /
 * dieline and/or a 3D GLB model) plus the print-area definitions the editor
 * initialises from. Linked to a product via src/links/product-design-template.ts.
 *
 * print_areas is a JSON array; each entry:
 * {
 *   id: string,              // e.g. "back-of-hand"
 *   label: string,
 *   x, y, w, h: number,      // normalized 0..1 rect on the 2D base asset
 *   safeZone: number,        // normalized inset (0..1) for the safe area
 *   widthMm, heightMm: number,
 *   dpi: number,             // target print DPI
 *   maxColors: number,
 *   methods: string[],       // allowed PrintTechnique values
 *   uv?: { x, y, w, h }      // normalized UV rect on the 3D model (model_3d only)
 * }
 */
export const DesignTemplate = model.define("design_template", {
  id: model.id({ prefix: "distpl" }).primaryKey(),
  product_id: model.text(),
  template_type: model.enum([...TEMPLATE_TYPES]).default("flat_2d"),
  name: model.text().nullable(),
  base_asset_url: model.text().nullable(),
  model_asset_url: model.text().nullable(),
  print_areas: model.json(),
  is_active: model.boolean().default(true),
})
