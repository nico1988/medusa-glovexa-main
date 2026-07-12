// Shared types for the customization editor. Element coordinates are normalized
// 0..1 *within their print area* (matches the backend validator), so a design
// is independent of screen or print resolution (PRD §7.4).

export type ElementType = "image" | "text"

export type DesignElementBase = {
  id: string
  type: ElementType
  x: number
  y: number
  w: number
  h?: number
  rotation?: number
  colorRef?: string
}

export type ImageElement = DesignElementBase & {
  type: "image"
  fileId?: string | null
  url: string
  naturalWidth?: number
  naturalHeight?: number
}

export type TextElement = DesignElementBase & {
  type: "text"
  content: string
  font: string
  fontSize?: number
}

export type DesignElement = ImageElement | TextElement

export type DesignArea = {
  areaId: string
  elements: DesignElement[]
}

export type DesignDocument = {
  version: number
  unit: "normalized" | "mm"
  areas: DesignArea[]
  colors: Record<string, string>
}

export type PrintArea = {
  id: string
  label?: string
  x: number
  y: number
  w: number
  h: number
  safeZone?: number
  widthMm?: number
  heightMm?: number
  dpi?: number
  maxColors?: number
  methods?: string[]
  uv?: { x: number; y: number; w: number; h: number }
}

export type DesignTemplate = {
  id: string
  template_type: "flat_2d" | "dieline" | "model_3d"
  name: string | null
  base_asset_url: string | null
  model_asset_url: string | null
  print_areas: PrintArea[]
  is_active: boolean
}

export type SavedDesign = {
  id: string
  request_id: string
  template_id: string | null
  name: string | null
  design_document: DesignDocument
  preview_url: string | null
  version: number
}
