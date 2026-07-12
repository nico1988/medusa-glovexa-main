import { createFindParams } from "@medusajs/medusa/api/utils/validators"
import { z } from "zod"
import { TEMPLATE_TYPES } from "../../../modules/customization/types"

export const PrintAreaSchema = z
  .object({
    id: z.string().min(1),
    label: z.string().optional(),
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number(),
    safeZone: z.number().optional(),
    widthMm: z.number().optional(),
    heightMm: z.number().optional(),
    dpi: z.number().optional(),
    maxColors: z.number().optional(),
    methods: z.array(z.string()).optional(),
    uv: z
      .object({ x: z.number(), y: z.number(), w: z.number(), h: z.number() })
      .optional(),
  })
  .passthrough()

export type UpsertDesignTemplateType = z.infer<typeof UpsertDesignTemplate>
export const UpsertDesignTemplate = z
  .object({
    template_type: z.enum(TEMPLATE_TYPES),
    name: z.string().nullish(),
    base_asset_url: z.string().nullish(),
    model_asset_url: z.string().nullish(),
    print_areas: z.array(PrintAreaSchema),
    is_active: z.boolean().optional(),
  })
  .strict()

export type UploadProofType = z.infer<typeof UploadProof>
export const UploadProof = z
  .object({
    filename: z.string().min(1),
    mime_type: z.string().min(1),
    data: z.string().min(1),
  })
  .strict()

export type AdminGetCustomizationParamsType = z.infer<
  typeof AdminGetCustomizationParams
>
export const AdminGetCustomizationParams = createFindParams({
  limit: 50,
  offset: 0,
})
