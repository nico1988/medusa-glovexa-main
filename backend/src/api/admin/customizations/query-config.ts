import {
  customizationFields,
} from "../../store/customizations/query-config"

// Admin sees the same fields as the store detail view (shared to stay DRY).
export const adminCustomizationFields = customizationFields

export const retrieveAdminCustomizationQueryConfig = {
  defaults: adminCustomizationFields,
  isList: false,
}

export const listAdminCustomizationsQueryConfig = {
  defaults: adminCustomizationFields,
  isList: true,
}
