/**
 * Shared enums and constants for the customization module.
 *
 * Per CLAUDE.md: no magic strings. Every status / mode / method value is
 * declared here once and referenced everywhere (models, workflows, routes).
 */

// Which editing experience produced the request.
export const CUSTOMIZATION_MODES = ["configurator", "editor"] as const
export type CustomizationMode = (typeof CUSTOMIZATION_MODES)[number]

// What is being printed.
export const CUSTOMIZATION_METHODS = ["logo", "text", "both"] as const
export type CustomizationMethod = (typeof CUSTOMIZATION_METHODS)[number]

// Print technique (affects price / lead time — data field only for now).
export const PRINT_TECHNIQUES = [
  "screen-print",
  "heat-transfer",
  "box-print",
] as const
export type PrintTechnique = (typeof PRINT_TECHNIQUES)[number]

// Design template kind. Drives which editor viewport is available.
export const TEMPLATE_TYPES = ["flat_2d", "dieline", "model_3d"] as const
export type TemplateType = (typeof TEMPLATE_TYPES)[number]

// Customization request lifecycle (PRD §6.5).
export const CUSTOMIZATION_STATUSES = [
  "draft",
  "submitted",
  "artwork_review",
  "proof_pending",
  "proof_approved",
  "quoted",
  "accepted",
  "in_production",
  "rejected",
] as const
export type CustomizationStatus = (typeof CUSTOMIZATION_STATUSES)[number]

// Proof review outcome.
export const PROOF_STATUSES = ["pending", "approved", "rejected"] as const
export type ProofStatus = (typeof PROOF_STATUSES)[number]

// design_document coordinate systems (PRD §7.4).
export const DESIGN_UNITS = ["normalized", "mm"] as const
export type DesignUnit = (typeof DESIGN_UNITS)[number]

export const DESIGN_ELEMENT_TYPES = ["image", "text"] as const
export type DesignElementType = (typeof DESIGN_ELEMENT_TYPES)[number]

// Current schema version of the persisted design_document.
export const DESIGN_DOCUMENT_VERSION = 1
