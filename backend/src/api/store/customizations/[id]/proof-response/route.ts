import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework"
import { CUSTOMIZATION_MODULE } from "../../../../../modules/customization"
import CustomizationModuleService from "../../../../../modules/customization/service"
import { ProofResponseType } from "../../validators"

// POST /store/customizations/:id/proof-response — customer approves or rejects a
// proof (PRD §6.3). Approval advances the request; rejection returns it to review.
export const POST = async (
  req: AuthenticatedMedusaRequest<ProofResponseType>,
  res: MedusaResponse
) => {
  const service = req.scope.resolve<CustomizationModuleService>(
    CUSTOMIZATION_MODULE
  )
  const { proof_id, action, comment } = req.validatedBody
  const approved = action === "approve"

  await service.updateCustomizationProofs({
    id: proof_id,
    status: approved ? "approved" : "rejected",
    customer_comment: comment ?? null,
  })

  await service.updateCustomizationRequests({
    id: req.params.id,
    status: approved ? "proof_approved" : "artwork_review",
  })

  res.json({ success: true, status: approved ? "proof_approved" : "artwork_review" })
}
