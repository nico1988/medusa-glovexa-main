import { defineLink } from "@medusajs/framework/utils"
import CompanyModule from "../modules/company"
import CustomizationModule from "../modules/customization"

// A company can reference many customization requests (history / re-order).
export default defineLink(CompanyModule.linkable.company, {
  linkable: CustomizationModule.linkable.customizationRequest,
  isList: true,
})
