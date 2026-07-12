import { EDITOR_FONTS } from "../constants"
import { DesignArea, DesignDocument, DesignTemplate } from "../types"
import { areaPixelRect, elementPixelRect } from "./geometry"
import { getCachedImage, loadImage } from "./image-cache"

// Preloads the base asset and every image element so the renderer can draw
// synchronously (needed for a stable 3D CanvasTexture + preview export).
export async function preloadDocumentImages(
  template: DesignTemplate | null,
  doc: DesignDocument
): Promise<void> {
  const urls: string[] = []
  if (template?.base_asset_url) {
    urls.push(template.base_asset_url)
  }
  for (const area of doc.areas) {
    for (const el of area.elements) {
      if (el.type === "image" && el.url) {
        urls.push(el.url)
      }
    }
  }
  await Promise.all(urls.map((u) => loadImage(u).catch(() => null)))
}

function fontCss(fontId: string, sizePx: number): string {
  const font = EDITOR_FONTS.find((f) => f.id === fontId) ?? EDITOR_FONTS[0]
  // Reuse the whitelist's weight/family, swap in the pixel size.
  return font.css.replace(/\d+px/, `${Math.max(1, Math.round(sizePx))}px`)
}

function drawArea(
  ctx: CanvasRenderingContext2D,
  area: DesignArea,
  template: DesignTemplate,
  doc: DesignDocument,
  width: number,
  height: number
): void {
  const printArea = template.print_areas.find((a) => a.id === area.areaId)
  if (!printArea) {
    return
  }
  const rect = areaPixelRect(printArea, width, height)

  for (const el of area.elements) {
    const er = elementPixelRect(el, rect)
    const cx = er.x + er.w / 2
    const cy = er.y + er.h / 2
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(((el.rotation ?? 0) * Math.PI) / 180)

    if (el.type === "image") {
      const img = el.url ? getCachedImage(el.url) : undefined
      if (img) {
        ctx.drawImage(img, -er.w / 2, -er.h / 2, er.w, er.h)
      }
    } else {
      const color = (el.colorRef && doc.colors[el.colorRef]) || "#111111"
      ctx.fillStyle = color
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.font = fontCss(el.font, er.h)
      ctx.fillText(el.content, 0, 0)
    }
    ctx.restore()
  }
}

// Renders base asset + all areas onto the canvas. Returns the pixel dimensions
// used (base aspect ratio preserved). Assumes images are preloaded.
export function renderDesignToCanvas(
  canvas: HTMLCanvasElement,
  template: DesignTemplate,
  doc: DesignDocument,
  maxSize: number
): { width: number; height: number } {
  const base = template.base_asset_url
    ? getCachedImage(template.base_asset_url)
    : undefined

  const baseW = base?.naturalWidth || maxSize
  const baseH = base?.naturalHeight || maxSize
  const scale = maxSize / Math.max(baseW, baseH)
  const width = Math.round(baseW * scale)
  const height = Math.round(baseH * scale)

  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    return { width, height }
  }

  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, width, height)
  if (base) {
    ctx.drawImage(base, 0, 0, width, height)
  }

  for (const area of doc.areas) {
    drawArea(ctx, area, template, doc, width, height)
  }

  return { width, height }
}

// Produces a PNG data URL preview of the current design.
export function exportPreviewDataUrl(
  template: DesignTemplate,
  doc: DesignDocument,
  maxSize = 512
): string {
  const canvas = document.createElement("canvas")
  renderDesignToCanvas(canvas, template, doc, maxSize)
  return canvas.toDataURL("image/png")
}
