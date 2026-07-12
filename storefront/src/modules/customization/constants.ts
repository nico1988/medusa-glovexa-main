// Central constants for the customization feature (CLAUDE.md: no magic values).

export const DESIGN_DOCUMENT_VERSION = 1

// Cache tag for customization-related server actions.
export const CUSTOMIZATION_CACHE_TAG = "customizations"

// Metadata keys carried on the product and on cart/order line items.
export const PRODUCT_CUSTOMIZABLE_FLAG = "is_customizable"
export const PRODUCT_CUSTOMIZATION_MOQ = "customization_moq"
export const PRODUCT_CUSTOMIZATION_SETUP_FEE = "customization_setup_fee"

export const LINE_ITEM_CUSTOMIZATION_ID = "customization_request_id"
export const LINE_ITEM_CUSTOMIZATION_PREVIEW = "customization_preview_url"
export const LINE_ITEM_CUSTOMIZATION_MODE = "customization_mode"

// Editor route: /[countryCode]/customize/[handle]
export const buildCustomizeUrl = (countryCode: string, handle: string) =>
  `/${countryCode}/customize/${handle}`

// Upload limits (PRD §5.2).
export const MAX_ARTWORK_BYTES = 20 * 1024 * 1024 // 20 MB
export const ACCEPTED_ARTWORK_MIME = [
  "image/svg+xml",
  "image/png",
  "image/jpeg",
  "application/pdf",
]
// Formats the browser can render directly on the canvas.
export const CANVAS_RENDERABLE_MIME = [
  "image/svg+xml",
  "image/png",
  "image/jpeg",
]

// Text limits (PRD §5.3).
export const MAX_TEXT_CHARS_PER_LINE = 24

// Font whitelist (PRD §5.3 / §15.10).
export const EDITOR_FONTS = [
  { id: "inter-bold", label: "Inter Bold", css: "700 48px Inter, sans-serif" },
  { id: "inter", label: "Inter", css: "400 48px Inter, sans-serif" },
  {
    id: "arial-bold",
    label: "Arial Bold",
    css: "700 48px Arial, sans-serif",
  },
  {
    id: "georgia",
    label: "Georgia",
    css: "400 48px Georgia, serif",
  },
] as const

export const DEFAULT_FONT_ID = EDITOR_FONTS[0].id

// Default brand colors offered as swatches (constrained by area max_colors).
export const DEFAULT_DESIGN_COLORS: Record<string, string> = {
  c1: "#0A3D62",
  c2: "#B71540",
}

export const EDITOR_MODES = ["2d", "3d"] as const
export type EditorMode = (typeof EDITOR_MODES)[number]

// Offscreen texture resolution for compositing the design (px). Kept high so 3D
// preview stays crisp; real print output is generated from the mm × DPI spec.
export const TEXTURE_SIZE = 1024
