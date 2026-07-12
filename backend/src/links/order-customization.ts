import { defineLink } from "@medusajs/framework/utils"
import OrderModule from "@medusajs/medusa/order"
import CustomizationModule from "../modules/customization"

// An order can reference many customization requests.
export default defineLink(OrderModule.linkable.order, {
  linkable: CustomizationModule.linkable.customizationRequest,
  isList: true,
})
