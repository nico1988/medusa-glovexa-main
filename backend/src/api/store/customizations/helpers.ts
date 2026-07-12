import { RemoteQueryFunction } from "@medusajs/framework/types"
import { PrintArea } from "../../../modules/customization/lib/validate-design-document"

export type ResolvedTemplate = {
  id: string
  template_type: string
  name: string | null
  base_asset_url: string | null
  model_asset_url: string | null
  print_areas: PrintArea[]
  is_active: boolean
}

/**
 * Resolves the active design template linked to a product (via the
 * product-design-template link). Returns null when the product has none, in
 * which case the storefront falls back to the simple configurator.
 */
export async function getProductDesignTemplate(
  query: Omit<RemoteQueryFunction, symbol>,
  productId: string
): Promise<ResolvedTemplate | null> {
  const { data } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "design_templates.id",
      "design_templates.template_type",
      "design_templates.name",
      "design_templates.base_asset_url",
      "design_templates.model_asset_url",
      "design_templates.print_areas",
      "design_templates.is_active",
    ],
    filters: { id: productId },
  })

  const templates = (data?.[0]?.design_templates ??
    []) as unknown as ResolvedTemplate[]
  return templates.find((t) => t.is_active) ?? templates[0] ?? null
}

// The largest maxColors across all print areas — used for request-level checks.
export function maxColorsForTemplate(template: ResolvedTemplate | null): number {
  if (!template) {
    return 0
  }
  return template.print_areas.reduce(
    (max, a) => Math.max(max, a.maxColors ?? 0),
    0
  )
}
