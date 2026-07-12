import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { CUSTOMIZATION_MODULE } from "../modules/customization"
import CustomizationModuleService from "../modules/customization/service"

/**
 * Configures a demo customizable glove product with a design template so the
 * online editor has data to work with. Idempotent — safe to run repeatedly.
 *
 * Execute: `npx medusa exec src/scripts/configure-glove-customization.ts`
 */
const DEMO_PRODUCT_HANDLE = "cowhide-leather-work-gloves"

export default async function configureGloveCustomization({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const productModule = container.resolve(Modules.PRODUCT)
  const customization = container.resolve<CustomizationModuleService>(
    CUSTOMIZATION_MODULE
  )

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "title", "design_templates.id"],
    filters: { handle: DEMO_PRODUCT_HANDLE },
  })

  const product = products?.[0]
  if (!product) {
    logger.error(
      `Product "${DEMO_PRODUCT_HANDLE}" not found. Run \`pnpm seed\` / seed-gloves first.`
    )
    return
  }

  if (product.design_templates?.length) {
    logger.info(
      `Product "${product.title}" already has a design template. Skipping.`
    )
    return
  }

  const template = await customization.createDesignTemplates({
    product_id: product.id,
    template_type: "model_3d",
    name: "Back-of-hand branding",
    // Served by the storefront (public/customization/…). 2D editing base.
    base_asset_url: "/customization/glove-template.svg",
    // No licensed GLB shipped — the editor falls back to a procedural 3D
    // surface. Point this at a GLB (+ Draco) to render a real model.
    model_asset_url: null,
    print_areas: [
      {
        id: "back-of-hand",
        label: "Back of hand",
        // normalized rect on the 800x1000 base asset
        x: 0.375,
        y: 0.47,
        w: 0.275,
        h: 0.25,
        safeZone: 0.08,
        widthMm: 120,
        heightMm: 140,
        dpi: 200,
        maxColors: 2,
        methods: ["screen-print", "heat-transfer"],
        uv: { x: 0.375, y: 0.47, w: 0.275, h: 0.25 },
      },
      // json column stores the array at runtime; the generated type widens to
      // a single object, so assert through unknown.
    ] as unknown as Record<string, unknown>,
    is_active: true,
  })

  await link.create({
    [Modules.PRODUCT]: { product_id: product.id },
    [CUSTOMIZATION_MODULE]: { design_template_id: template.id },
  })

  // Flag used by the storefront to show the "Design online" entry.
  await productModule.updateProducts(product.id, {
    metadata: {
      ...(product as { metadata?: Record<string, unknown> }).metadata,
      is_customizable: "true",
      customization_moq: "50",
      customization_setup_fee: "75",
    },
  })

  logger.info(
    `Configured design template ${template.id} for "${product.title}" (${DEMO_PRODUCT_HANDLE}).`
  )
}
