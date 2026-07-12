export const customizationFields = [
  "id",
  "mode",
  "method",
  "status",
  "print_technique",
  "positions",
  "text_content",
  "color_count",
  "pantone",
  "product_id",
  "variant_id",
  "customer_id",
  "moq",
  "quantity",
  "notes",
  "created_at",
  "updated_at",
  "*designs",
  "*artworks",
  "*proofs",
]

export const retrieveCustomizationQueryConfig = {
  defaults: customizationFields,
  isList: false,
}

export const listCustomizationsQueryConfig = {
  defaults: customizationFields,
  isList: true,
}
