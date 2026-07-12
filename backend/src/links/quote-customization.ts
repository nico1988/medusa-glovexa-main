import { defineLink } from "@medusajs/framework/utils"
import QuoteModule from "../modules/quote"
import CustomizationModule from "../modules/customization"

// A quote can reference many customization requests (pricing context).
export default defineLink(QuoteModule.linkable.quote, {
  linkable: CustomizationModule.linkable.customizationRequest,
  isList: true,
})
