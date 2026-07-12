import { DesignElement, ImageElement, PrintArea } from "../types"

export type Rect = { x: number; y: number; w: number; h: number }

// The print area's pixel rect on a base asset rendered at width×height.
export function areaPixelRect(
  area: PrintArea,
  width: number,
  height: number
): Rect {
  return {
    x: area.x * width,
    y: area.y * height,
    w: area.w * width,
    h: area.h * height,
  }
}

// The safe-zone pixel rect (area inset by area.safeZone on all sides).
export function safeZonePixelRect(area: PrintArea, areaRect: Rect): Rect {
  const inset = area.safeZone ?? 0
  return {
    x: areaRect.x + inset * areaRect.w,
    y: areaRect.y + inset * areaRect.h,
    w: areaRect.w * (1 - 2 * inset),
    h: areaRect.h * (1 - 2 * inset),
  }
}

// An element's pixel rect. Element coords/size are normalized within the area.
export function elementPixelRect(el: DesignElement, areaRect: Rect): Rect {
  const h = el.h ?? el.w
  return {
    x: areaRect.x + el.x * areaRect.w,
    y: areaRect.y + el.y * areaRect.h,
    w: el.w * areaRect.w,
    h: h * areaRect.h,
  }
}

// Fits an element inside the safe zone: first caps its size to the safe area,
// then clamps its position. Guarantees the element never violates the print
// constraints the backend enforces, so a valid design is always submittable.
export function clampToSafeZone(
  el: DesignElement,
  area: PrintArea
): { x: number; y: number; w: number; h: number } {
  const inset = area.safeZone ?? 0
  const maxSpan = Math.max(0, 1 - 2 * inset)
  const w = Math.min(el.w, maxSpan)
  const h = Math.min(el.h ?? el.w, maxSpan)
  const minX = inset
  const minY = inset
  const maxX = 1 - inset - w
  const maxY = 1 - inset - h
  return {
    x: Math.min(Math.max(el.x, minX), Math.max(minX, maxX)),
    y: Math.min(Math.max(el.y, minY), Math.max(minY, maxY)),
    w,
    h,
  }
}

// True when the element is (even partially) outside the safe zone.
export function isOutsideSafeZone(el: DesignElement, area: PrintArea): boolean {
  const inset = area.safeZone ?? 0
  const h = el.h ?? el.w
  const eps = 0.001
  return (
    el.x < inset - eps ||
    el.y < inset - eps ||
    el.x + el.w > 1 - inset + eps ||
    el.y + h > 1 - inset + eps
  )
}

// Effective print DPI of a bitmap element given the area's physical size.
// Returns null when we lack the data to compute it.
export function effectiveDpi(
  el: ImageElement,
  area: PrintArea
): number | null {
  if (!el.naturalWidth || !area.widthMm) {
    return null
  }
  const printedWidthInches = (area.widthMm * el.w) / 25.4
  if (printedWidthInches <= 0) {
    return null
  }
  return Math.round(el.naturalWidth / printedWidthInches)
}
