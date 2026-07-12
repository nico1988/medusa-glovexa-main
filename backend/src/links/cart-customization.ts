import { defineLink } from "@medusajs/framework/utils"
import CartModule from "@medusajs/medusa/cart"
import CustomizationModule from "../modules/customization"

// A cart can reference many customization requests (one per customized line).
export default defineLink(CartModule.linkable.cart, {
  linkable: CustomizationModule.linkable.customizationRequest,
  isList: true,
})
