import { Module } from "@medusajs/framework/utils"
import CustomizationModuleService from "./service"

export const CUSTOMIZATION_MODULE = "customization"

export default Module(CUSTOMIZATION_MODULE, {
  service: CustomizationModuleService,
})
