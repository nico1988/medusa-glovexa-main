import { DESIGN_DOCUMENT_VERSION, DesignUnit } from "../types"

/**
 * Server-authoritative validation of a design_document against a template's
 * print areas (PRD §7.4, §5.4, §12). Pure function — reused by the save-design
 * workflow and the store route so front/back-end rules never drift.
 */

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

export type DesignElement = {
  type: "image" | "text"
  fileId?: string | null
  url?: string | null
  content?: string | null
  colorRef?: string | null
  x: number
  y: number
  w: number
  h?: number | null
  rotation?: number | null
  // natural pixel dimensions of a bitmap element, used for the DPI check
  naturalWidth?: number | null
  naturalHeight?: number | null
  [key: string]: unknown
}

export type DesignArea = {
  areaId: string
  elements: DesignElement[]
}

export type DesignDocument = {
  version: number
  unit: DesignUnit
  areas: DesignArea[]
  colors?: Record<string, string>
}

export type DesignValidationResult = {
  valid: boolean
  errors: string[]
  warnings: string[]
}

const EPSILON = 0.001

export function validateDesignDocument(
  doc: DesignDocument,
  printAreas: PrintArea[],
  opts: { maxColors?: number } = {}
): DesignValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!doc || typeof doc !== "object") {
    return { valid: false, errors: ["design_document is missing"], warnings }
  }

  if (doc.version !== DESIGN_DOCUMENT_VERSION) {
    warnings.push(
      `design_document version ${doc.version} differs from current ${DESIGN_DOCUMENT_VERSION}`
    )
  }

  const areaById = new Map(printAreas.map((a) => [a.id, a]))
  const usedColorRefs = new Set<string>()

  for (const area of doc.areas ?? []) {
    const template = areaById.get(area.areaId)
    if (!template) {
      errors.push(`Unknown print area "${area.areaId}"`)
      continue
    }

    const inset = template.safeZone ?? 0
    // Safe rect in the same normalized space the editor uses (0..1 within area).
    const minX = inset
    const minY = inset
    const maxX = 1 - inset
    const maxY = 1 - inset

    for (const el of area.elements ?? []) {
      const h = el.h ?? el.w
      if (
        el.x < minX - EPSILON ||
        el.y < minY - EPSILON ||
        el.x + el.w > maxX + EPSILON ||
        el.y + h > maxY + EPSILON
      ) {
        errors.push(
          `Element in "${area.areaId}" is outside the safe print zone`
        )
      }

      if (el.colorRef) {
        usedColorRefs.add(el.colorRef)
      }

      // DPI check for bitmap elements (PRD §7.5.1, §13).
      if (
        el.type === "image" &&
        el.naturalWidth &&
        template.widthMm &&
        template.dpi
      ) {
        const printedWidthInches = (template.widthMm * el.w) / 25.4
        const effectiveDpi = el.naturalWidth / Math.max(printedWidthInches, EPSILON)
        if (effectiveDpi < template.dpi) {
          warnings.push(
            `Image in "${area.areaId}" is ~${Math.round(
              effectiveDpi
            )} DPI, below the ${template.dpi} DPI target — print may look soft`
          )
        }
      }
    }

    const areaMaxColors = template.maxColors ?? opts.maxColors
    if (areaMaxColors && usedColorRefs.size > areaMaxColors) {
      errors.push(
        `Uses ${usedColorRefs.size} colors, exceeding the ${areaMaxColors}-color limit`
      )
    }
  }

  return { valid: errors.length === 0, errors, warnings }
}
