import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { IFileModuleService } from "@medusajs/framework/types"
import { CUSTOMIZATION_MODULE } from "../../../../../modules/customization"
import CustomizationModuleService from "../../../../../modules/customization/service"
import { UploadProofType } from "../../validators"

// POST /admin/customizations/:id/proofs — admin uploads a proof and moves the
// request to "proof_pending" for customer sign-off (PRD §6.3).
export const POST = async (
  req: MedusaRequest<UploadProofType>,
  res: MedusaResponse
) => {
  const fileModule = req.scope.resolve<IFileModuleService>(Modules.FILE)
  const service = req.scope.resolve<CustomizationModuleService>(
    CUSTOMIZATION_MODULE
  )
  const { filename, mime_type, data } = req.validatedBody

  const content = Buffer.from(data, "base64").toString("binary")
  const [file] = await fileModule.createFiles([
    { filename, mimeType: mime_type, content, access: "public" },
  ])

  const existing = await service.listCustomizationProofs({
    request_id: req.params.id,
  })
  const nextVersion =
    existing.reduce((max, p) => Math.max(max, p.version ?? 0), 0) + 1

  const proof = await service.createCustomizationProofs({
    request_id: req.params.id,
    file_id: file.id,
    url: file.url,
    version: nextVersion,
    status: "pending",
  })

  await service.updateCustomizationRequests({
    id: req.params.id,
    status: "proof_pending",
  })

  res.status(201).json({ proof })
}
