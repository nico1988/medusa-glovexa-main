import { createFindParams } from "@medusajs/medusa/api/utils/validators"
import { z } from "zod"
import {
  CUSTOMIZATION_METHODS,
  CUSTOMIZATION_MODES,
  DESIGN_ELEMENT_TYPES,
  DESIGN_UNITS,
} from "../../../modules/customization/types"

// A single element inside a print area (PRD §7.4). passthrough keeps forward-
// compatible fields (e.g. font metadata) without failing validation.
export const DesignElementSchema = z
  .object({
    type: z.enum(DESIGN_ELEMENT_TYPES),
    fileId: z.string().nullish(),
    url: z.string().nullish(),
    content: z.string().nullish(),
    colorRef: z.string().nullish(),
    font: z.string().nullish(),
    fontSize: z.number().nullish(),
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number().nullish(),
    rotation: z.number().nullish(),
    naturalWidth: z.number().nullish(),
    naturalHeight: z.number().nullish(),
  })
  .passthrough()

export const DesignDocumentSchema = z.object({
  version: z.number(),
  unit: z.enum(DESIGN_UNITS),
  areas: z.array(
    z.object({
      areaId: z.string(),
      elements: z.array(DesignElementSchema),
    })
  ),
  colors: z.record(z.string()).optional(),
})

export type CreateCustomizationType = z.infer<typeof CreateCustomization>
export const CreateCustomization = z
  .object({
    mode: z.enum(CUSTOMIZATION_MODES),
    method: z.enum(CUSTOMIZATION_METHODS),
    product_id: z.string().min(1),
    variant_id: z.string().nullish(),
    quantity: z.number().int().positive(),
    moq: z.number().int().positive().default(1),
    color_count: z.number().int().positive().optional(),
    print_technique: z.string().nullish(),
    positions: z.any().optional(),
    text_content: z.any().optional(),
    pantone: z.string().nullish(),
    notes: z.string().nullish(),
    template_id: z.string().nullish(),
    design_document: DesignDocumentSchema.nullish(),
    preview_url: z.string().nullish(),
    cart_id: z.string().nullish(),
    company_id: z.string().nullish(),
  })
  .strict()

export type SaveDesignType = z.infer<typeof SaveDesign>
export const SaveDesign = z
  .object({
    request_id: z.string().nullish(),
    design_id: z.string().nullish(),
    product_id: z.string().min(1),
    template_id: z.string().nullish(),
    name: z.string().nullish(),
    design_document: DesignDocumentSchema,
    preview_url: z.string().nullish(),
    is_draft: z.boolean().optional(),
  })
  .strict()

export type UploadCustomizationFileType = z.infer<typeof UploadCustomizationFile>
export const UploadCustomizationFile = z
  .object({
    filename: z.string().min(1),
    mime_type: z.string().min(1),
    // base64-encoded bytes (no data: URL prefix)
    data: z.string().min(1),
  })
  .strict()

export type ProofResponseType = z.infer<typeof ProofResponse>
export const ProofResponse = z
  .object({
    proof_id: z.string().min(1),
    action: z.enum(["approve", "reject"]),
    comment: z.string().nullish(),
  })
  .strict()

export type GetCustomizationParamsType = z.infer<typeof GetCustomizationParams>
export const GetCustomizationParams = createFindParams({
  limit: 50,
  offset: 0,
})
