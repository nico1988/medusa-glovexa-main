import {
  createCollectionsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
} from "@medusajs/core-flows";
import { ExecArgs, ISalesChannelModuleService } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  ProductStatus,
} from "@medusajs/framework/utils";

/**
 * Seeds 10 glove products for the B2B gloves storefront.
 *
 * Idempotent-ish: reuses the "Featured" collection and any glove categories
 * that already exist, and only creates products whose handle is not present yet.
 *
 * Run with: pnpm exec medusa exec ./src/scripts/seed-gloves.ts
 */

// Store currencies (matches seed.ts: eur is default, usd secondary).
const CURRENCIES = ["eur", "usd"] as const;

const FEATURED_COLLECTION = { title: "Featured", handle: "featured" };

// Category names used across the glove catalog.
const CATEGORY = {
  DISPOSABLE: "Disposable Gloves",
  MEDICAL: "Medical & Exam Gloves",
  WORK: "Work & Safety Gloves",
  GARDENING: "Gardening Gloves",
} as const;

const CATEGORY_NAMES = Object.values(CATEGORY);

// Vetted, real glove photos hosted on the Unsplash CDN (verified to resolve).
const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;

type SeedVariant = {
  size: string;
  sku: string;
  // Per-case / per-box wholesale price in the currency's major unit.
  price: number;
};

type SeedProduct = {
  title: string;
  handle: string;
  category: string;
  featured?: boolean;
  description: string;
  weight: number;
  images: string[];
  variants: SeedVariant[];
};

const SIZE_OPTION = "Size";

const PRODUCTS: SeedProduct[] = [
  {
    title: "Blue Nitrile Disposable Gloves — Powder-Free, 4 mil (Case of 1,000)",
    handle: "blue-nitrile-disposable-4mil",
    category: CATEGORY.DISPOSABLE,
    featured: true,
    description:
      "Latex-free blue nitrile examination gloves engineered for everyday professional use across food service, cleaning, and light industrial tasks. At 4 mil thickness these gloves balance tactile sensitivity with reliable puncture and chemical-splash resistance. Powder-free and textured fingertips for a secure grip in wet or dry conditions. Sold by the case of 1,000 gloves (10 dispenser boxes of 100). Ambidextrous, beaded cuff.",
    weight: 4500,
    images: [img("1599412227383-b7d4751c8765"), img("1619691114448-d136c0890914")],
    variants: [
      { size: "Small", sku: "GLV-NIT-BLU-4-S", price: 52 },
      { size: "Medium", sku: "GLV-NIT-BLU-4-M", price: 52 },
      { size: "Large", sku: "GLV-NIT-BLU-4-L", price: 54 },
      { size: "X-Large", sku: "GLV-NIT-BLU-4-XL", price: 56 },
    ],
  },
  {
    title: "Heavy-Duty Nitrile Industrial Gloves — 8 mil (Case of 500)",
    handle: "heavy-duty-nitrile-8mil",
    category: CATEGORY.DISPOSABLE,
    featured: true,
    description:
      "Thick 8 mil nitrile gloves built for automotive, manufacturing, and heavy cleaning environments where durability matters. The raised diamond-texture channels away oils and liquids to maximise grip, while the extended thickness delivers superior resistance to punctures, solvents, and abrasion. Powder-free, latex-free, and rolled cuff for extra tear resistance. Sold by the case of 500 gloves (5 boxes of 100).",
    weight: 5200,
    images: [img("1628235176517-71013205a2de"), img("1628246963292-f238fa310fcf")],
    variants: [
      { size: "Medium", sku: "GLV-NIT-HD-8-M", price: 64 },
      { size: "Large", sku: "GLV-NIT-HD-8-L", price: 64 },
      { size: "X-Large", sku: "GLV-NIT-HD-8-XL", price: 66 },
      { size: "XX-Large", sku: "GLV-NIT-HD-8-XXL", price: 68 },
    ],
  },
  {
    title: "White Latex Examination Gloves — Powder-Free (Case of 1,000)",
    handle: "white-latex-exam-powder-free",
    category: CATEGORY.MEDICAL,
    description:
      "Natural rubber latex examination gloves offering outstanding elasticity, fit, and barrier protection for clinics, laboratories, and dental practices. Powder-free with a chlorinated finish for easy donning and reduced residue. Micro-textured surface improves grip on instruments. AQL 1.5, ambidextrous, beaded cuff. Sold by the case of 1,000 gloves (10 boxes of 100). Note: contains natural rubber latex.",
    weight: 4600,
    images: [img("1611075383964-4717534173f3"), img("1587111720034-e85a8bde1163")],
    variants: [
      { size: "Small", sku: "GLV-LAT-WHT-S", price: 48 },
      { size: "Medium", sku: "GLV-LAT-WHT-M", price: 48 },
      { size: "Large", sku: "GLV-LAT-WHT-L", price: 50 },
      { size: "X-Large", sku: "GLV-LAT-WHT-XL", price: 52 },
    ],
  },
  {
    title: "Blue Nitrile Chemo-Rated Exam Gloves — 6 mil (Case of 1,000)",
    handle: "blue-nitrile-chemo-exam-6mil",
    category: CATEGORY.MEDICAL,
    featured: true,
    description:
      "Medical-grade nitrile examination gloves tested to EN ISO 374 and rated for chemotherapy-drug handling. The 6 mil wall and extended beaded cuff give confident protection during patient care, lab work, and cytotoxic drug preparation. Powder-free, latex-free, and fully textured for dependable wet grip. FDA-compliant, AQL 1.5. Sold by the case of 1,000 gloves (10 boxes of 100).",
    weight: 4800,
    images: [img("1619691114448-d136c0890914"), img("1628246963292-f238fa310fcf")],
    variants: [
      { size: "Small", sku: "GLV-NIT-CHEMO-S", price: 62 },
      { size: "Medium", sku: "GLV-NIT-CHEMO-M", price: 62 },
      { size: "Large", sku: "GLV-NIT-CHEMO-L", price: 64 },
      { size: "X-Large", sku: "GLV-NIT-CHEMO-XL", price: 66 },
    ],
  },
  {
    title: "Rose Nitrile Salon & Cleaning Gloves — 5 mil (Case of 1,000)",
    handle: "rose-nitrile-salon-cleaning",
    category: CATEGORY.DISPOSABLE,
    description:
      "Soft rose-tone nitrile gloves designed for salons, spas, tattoo studios, and janitorial teams. The 5 mil film resists dyes, disinfectants, and cleaning chemicals while staying flexible for detailed handwork. Powder-free, latex-free, and textured fingertips. Ambidextrous with a snug beaded cuff. Sold by the case of 1,000 gloves (10 boxes of 100).",
    weight: 4700,
    images: [img("1596513058031-bc51c5cbe091")],
    variants: [
      { size: "Small", sku: "GLV-NIT-ROSE-S", price: 55 },
      { size: "Medium", sku: "GLV-NIT-ROSE-M", price: 55 },
      { size: "Large", sku: "GLV-NIT-ROSE-L", price: 57 },
    ],
  },
  {
    title: "Premium Cowhide Leather Work Gloves (12 Pairs)",
    handle: "cowhide-leather-work-gloves",
    category: CATEGORY.WORK,
    featured: true,
    description:
      "Full-grain cowhide leather work gloves built for construction, warehousing, and material handling. The supple grain leather palm resists abrasion and softens with use for a broken-in fit, while the keystone thumb allows natural movement and reduces hand fatigue. Reinforced palm and shirred elastic wrist keep debris out. Sold by the pack of 12 pairs.",
    weight: 1800,
    images: [img("1634852836003-c0aa5b67d243"), img("1673294861057-4584f92b91d2")],
    variants: [
      { size: "Medium", sku: "GLV-LTH-COW-M", price: 78 },
      { size: "Large", sku: "GLV-LTH-COW-L", price: 78 },
      { size: "X-Large", sku: "GLV-LTH-COW-XL", price: 82 },
    ],
  },
  {
    title: "Latex-Coated Grip Work Gloves — EN388 (12 Pairs)",
    handle: "latex-coated-grip-work-gloves",
    category: CATEGORY.WORK,
    description:
      "Seamless knit gloves with a crinkle latex palm coating for a firm, non-slip grip in wet and dry conditions. Certified to EN388 for abrasion and tear resistance, they are ideal for landscaping, logistics, and general construction. The breathable knit back keeps hands cool while the coating protects the palm and fingers. Sold by the pack of 12 pairs.",
    weight: 1500,
    images: [img("1582586131076-6c308a437385")],
    variants: [
      { size: "Medium", sku: "GLV-COAT-LAT-M", price: 34 },
      { size: "Large", sku: "GLV-COAT-LAT-L", price: 34 },
      { size: "X-Large", sku: "GLV-COAT-LAT-XL", price: 36 },
    ],
  },
  {
    title: "Synthetic Leather Mechanic's Gloves (6 Pairs)",
    handle: "synthetic-leather-mechanic-gloves",
    category: CATEGORY.WORK,
    description:
      "High-dexterity mechanic's gloves with a synthetic leather palm and padded knuckle protection for automotive, assembly, and maintenance work. Touchscreen-compatible fingertips let technicians use devices without removing gloves, while the reinforced palm resists oil and abrasion. Adjustable hook-and-loop wrist for a secure fit. Sold by the pack of 6 pairs.",
    weight: 1200,
    images: [img("1646898644803-42f361bc95e2")],
    variants: [
      { size: "Medium", sku: "GLV-MECH-SYN-M", price: 42 },
      { size: "Large", sku: "GLV-MECH-SYN-L", price: 42 },
      { size: "X-Large", sku: "GLV-MECH-SYN-XL", price: 44 },
    ],
  },
  {
    title: "Thermal Insulated Winter Work Gloves (6 Pairs)",
    handle: "thermal-winter-work-gloves",
    category: CATEGORY.WORK,
    description:
      "Insulated work gloves with a brushed thermal lining and water-resistant shell for cold-storage, outdoor construction, and winter logistics. The textured palm maintains grip in freezing conditions while the fleece lining traps warmth without bulk. Extended knit cuff seals out cold air. Sold by the pack of 6 pairs.",
    weight: 1600,
    images: [img("1664263655866-403f2025677d")],
    variants: [
      { size: "Medium", sku: "GLV-WINT-THM-M", price: 48 },
      { size: "Large", sku: "GLV-WINT-THM-L", price: 48 },
      { size: "X-Large", sku: "GLV-WINT-THM-XL", price: 50 },
    ],
  },
  {
    title: "Bamboo-Nylon Gardening Gloves (12 Pairs)",
    handle: "bamboo-nylon-gardening-gloves",
    category: CATEGORY.GARDENING,
    description:
      "Breathable gardening gloves knit from a soft bamboo-nylon blend with a nitrile-dipped palm for grip and light thorn protection. The snug seamless fit gives excellent dexterity for planting, potting, and pruning, while the moisture-wicking fibres keep hands comfortable through long shifts. Machine washable. Sold by the pack of 12 pairs.",
    weight: 1300,
    images: [img("1646640345481-81d36b291b39")],
    variants: [
      { size: "Small", sku: "GLV-GARD-BAM-S", price: 30 },
      { size: "Medium", sku: "GLV-GARD-BAM-M", price: 30 },
      { size: "Large", sku: "GLV-GARD-BAM-L", price: 32 },
    ],
  },
];

export default async function seedGloves({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const salesChannelModuleService: ISalesChannelModuleService =
    container.resolve(ModuleRegistrationName.SALES_CHANNEL);

  logger.info("Resolving default sales channel...");
  const salesChannels = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });
  if (!salesChannels.length) {
    throw new Error(
      "No 'Default Sales Channel' found. Run `pnpm seed` first to initialise the store."
    );
  }
  const salesChannelId = salesChannels[0].id;

  // Reuse the Featured collection if it exists, otherwise create it.
  logger.info("Resolving 'Featured' collection...");
  const { data: existingCollections } = await query.graph({
    entity: "product_collection",
    fields: ["id", "handle"],
    filters: { handle: FEATURED_COLLECTION.handle },
  });
  let featuredCollectionId = existingCollections[0]?.id;
  if (!featuredCollectionId) {
    const { result } = await createCollectionsWorkflow(container).run({
      input: { collections: [FEATURED_COLLECTION] },
    });
    featuredCollectionId = result[0].id;
  }

  // Reuse existing glove categories, create any that are missing.
  logger.info("Resolving glove categories...");
  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name"],
    filters: { name: CATEGORY_NAMES },
  });
  const categoryIdByName = new Map<string, string>(
    existingCategories.map((c: { id: string; name: string }) => [c.name, c.id])
  );
  const missingCategoryNames = CATEGORY_NAMES.filter(
    (name) => !categoryIdByName.has(name)
  );
  if (missingCategoryNames.length) {
    const { result: createdCategories } = await createProductCategoriesWorkflow(
      container
    ).run({
      input: {
        product_categories: missingCategoryNames.map((name) => ({
          name,
          is_active: true,
        })),
      },
    });
    for (const category of createdCategories) {
      categoryIdByName.set(category.name, category.id);
    }
  }

  // Skip products that already exist (by handle) so the script is re-runnable.
  const handles = PRODUCTS.map((p) => p.handle);
  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["handle"],
    filters: { handle: handles },
  });
  const existingHandles = new Set(
    existingProducts.map((p: { handle: string }) => p.handle)
  );

  const productsToCreate = PRODUCTS.filter(
    (p) => !existingHandles.has(p.handle)
  );

  if (!productsToCreate.length) {
    logger.info("All glove products already exist. Nothing to seed.");
    return;
  }

  logger.info(`Seeding ${productsToCreate.length} glove product(s)...`);
  await createProductsWorkflow(container).run({
    input: {
      products: productsToCreate.map((product) => {
        const categoryId = categoryIdByName.get(product.category);
        if (!categoryId) {
          throw new Error(`Missing category id for "${product.category}"`);
        }
        return {
          title: product.title,
          handle: product.handle,
          description: product.description,
          status: ProductStatus.PUBLISHED,
          weight: product.weight,
          category_ids: [categoryId],
          collection_id: product.featured ? featuredCollectionId : undefined,
          images: product.images.map((url) => ({ url })),
          options: [
            {
              title: SIZE_OPTION,
              values: product.variants.map((v) => v.size),
            },
          ],
          variants: product.variants.map((variant) => ({
            title: variant.size,
            sku: variant.sku,
            options: { [SIZE_OPTION]: variant.size },
            manage_inventory: false,
            prices: CURRENCIES.map((currency_code) => ({
              currency_code,
              amount: variant.price,
            })),
          })),
          sales_channels: [{ id: salesChannelId }],
        };
      }),
    },
  });

  logger.info(
    `Finished seeding gloves. Created: ${productsToCreate
      .map((p) => p.handle)
      .join(", ")}`
  );
}
