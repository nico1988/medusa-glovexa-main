import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import CustomizationModule from "../modules/customization"

// A product can carry one or more design templates for the online editor.
export default defineLink(ProductModule.linkable.product, {
  linkable: CustomizationModule.linkable.designTemplate,
  isList: true,
})
