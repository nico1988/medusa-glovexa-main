import { MedusaService } from "@medusajs/framework/utils"
import {
  CustomizationArtwork,
  CustomizationDesign,
  CustomizationProof,
  CustomizationRequest,
  DesignTemplate,
} from "./models"

class CustomizationModuleService extends MedusaService({
  DesignTemplate,
  CustomizationRequest,
  CustomizationDesign,
  CustomizationArtwork,
  CustomizationProof,
}) {}

export default CustomizationModuleService
