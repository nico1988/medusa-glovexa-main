import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { IFileModuleService } from "@medusajs/framework/types"
import { UploadCustomizationFileType } from "../validators"

// POST /store/customizations/uploads — store an artwork / preview image via the
// Medusa File module. Accepts base64 so the storefront can post canvas exports
// and picked files as JSON without multipart handling. Returns the public URL.
export const POST = async (
  req: AuthenticatedMedusaRequest<UploadCustomizationFileType>,
  res: MedusaResponse
) => {
  const fileModule = req.scope.resolve<IFileModuleService>(Modules.FILE)
  const { filename, mime_type, data } = req.validatedBody

  // The local provider decodes file.content as a "binary" (latin1) string.
  const content = Buffer.from(data, "base64").toString("binary")

  const [file] = await fileModule.createFiles([
    {
      filename,
      mimeType: mime_type,
      content,
      access: "public",
    },
  ])

  res.status(201).json({
    file: { id: file.id, url: file.url, filename, mime_type },
  })
}
