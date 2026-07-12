"use client"

import { Button, Heading, Text, clx, toast } from "@medusajs/ui"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import {
  addCustomizationToCart,
  saveDesign,
  uploadCustomizationFile,
} from "@/lib/data/customization"
import {
  ACCEPTED_ARTWORK_MIME,
  CANVAS_RENDERABLE_MIME,
  EDITOR_FONTS,
  MAX_ARTWORK_BYTES,
} from "../../constants"
import { effectiveDpi, isOutsideSafeZone } from "../../lib/geometry"
import { loadImage } from "../../lib/image-cache"
import { exportPreviewDataUrl } from "../../lib/render-design"
import { useEditorStore } from "../../store"
import {
  DesignDocument,
  DesignTemplate,
  ImageElement,
  SavedDesign,
  TextElement,
} from "../../types"
import Canvas2D from "./canvas-2d"
import Preview3D from "./preview-3d"

export type EditorProduct = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  variants: { id: string; title: string; sku: string | null }[]
}

type Props = {
  product: EditorProduct
  template: DesignTemplate
  countryCode: string
  moq: number
  setupFee: number | null
  initialDesign: SavedDesign | null
}

const dataUrlToBase64 = (dataUrl: string) => dataUrl.split(",")[1] ?? ""

export default function GloveEditor({
  product,
  template,
  countryCode,
  moq,
  setupFee,
  initialDesign,
}: Props) {
  const router = useRouter()
  const {
    doc,
    mode,
    activeAreaId,
    selectedId,
    template: storeTemplate,
    init,
    setMode,
    setActiveArea,
    addImageElement,
    addTextElement,
    updateElement,
    removeElement,
    select,
    markSaved,
  } = useEditorStore()

  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "")
  const [quantity, setQuantity] = useState(moq)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Initialise the store once with the template + any design being re-edited.
  useEffect(() => {
    init({
      template,
      doc: initialDesign?.design_document ?? null,
      requestId: initialDesign?.request_id ?? null,
      designId: initialDesign?.id ?? null,
    })
  }, [init, template, initialDesign])

  const printArea = template.print_areas.find((a) => a.id === activeAreaId)
  const activeArea = doc.areas.find((a) => a.areaId === activeAreaId)
  const elements = activeArea?.elements ?? []
  const selected = elements.find((e) => e.id === selectedId) ?? null

  // Live validation (PRD §5, §13).
  const warnings = useMemo(() => {
    const out: string[] = []
    if (!printArea) {
      return out
    }
    for (const el of elements) {
      if (isOutsideSafeZone(el, printArea)) {
        out.push("An element sits outside the safe print zone.")
      }
      if (el.type === "image") {
        const dpi = effectiveDpi(el as ImageElement, printArea)
        if (dpi && printArea.dpi && dpi < printArea.dpi) {
          out.push(
            `Logo is ~${dpi} DPI (target ${printArea.dpi} DPI) — print may look soft.`
          )
        }
      }
    }
    return Array.from(new Set(out))
  }, [elements, printArea])

  const belowMoq = quantity < moq
  const hasContent = doc.areas.some((a) => a.elements.length > 0)

  const inferMethod = (): "logo" | "text" | "both" => {
    const all = doc.areas.flatMap((a) => a.elements)
    const hasImg = all.some((e) => e.type === "image")
    const hasText = all.some((e) => e.type === "text")
    if (hasImg && hasText) return "both"
    if (hasText) return "text"
    return "logo"
  }

  const handleAddLogo = async (file: File) => {
    if (file.size > MAX_ARTWORK_BYTES) {
      toast.error("File too large", {
        description: "Please upload artwork under 20 MB.",
      })
      return
    }
    if (!ACCEPTED_ARTWORK_MIME.includes(file.type)) {
      toast.error("Unsupported format", {
        description: "Use SVG, PNG, JPG or PDF (vector preferred).",
      })
      return
    }
    if (!CANVAS_RENDERABLE_MIME.includes(file.type)) {
      toast.info("Uploaded for production", {
        description:
          "PDF/vector files can't preview in the editor but are kept for print.",
      })
      return
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
    const img = await loadImage(dataUrl)
    addImageElement({
      url: dataUrl,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
    })
  }

  // Renders a preview and uploads it; falls back to the inline data URL.
  const buildPreviewUrl = async (): Promise<string> => {
    const dataUrl = exportPreviewDataUrl(template, doc, 640)
    try {
      const file = await uploadCustomizationFile({
        filename: `preview-${product.handle}.png`,
        mimeType: "image/png",
        dataBase64: dataUrlToBase64(dataUrl),
      })
      return file.url
    } catch {
      return dataUrl
    }
  }

  const handleSaveDraft = async () => {
    if (!hasContent) {
      toast.error("Nothing to save yet", {
        description: "Add a logo or text first.",
      })
      return
    }
    setSaving(true)
    try {
      const preview_url = await buildPreviewUrl()
      const { design_id, request_id } = await persist(doc, preview_url, true)
      markSaved({ requestId: request_id, designId: design_id })
      toast.success("Draft saved")
    } catch (e) {
      toast.error("Could not save draft", {
        description: e instanceof Error ? e.message : undefined,
      })
    } finally {
      setSaving(false)
    }
  }

  const persist = async (
    document: DesignDocument,
    preview_url: string,
    is_draft: boolean
  ) => {
    const state = useEditorStore.getState()
    const res = await saveDesign({
      request_id: state.requestId,
      design_id: state.designId,
      product_id: product.id,
      template_id: template.id,
      name: `${product.title} design`,
      design_document: document,
      preview_url,
      is_draft,
    })
    return { design_id: res.design.id, request_id: res.request_id }
  }

  const handleAddToCart = async () => {
    if (!variantId) {
      toast.error("Select a size")
      return
    }
    if (!hasContent) {
      toast.error("Add at least one logo or text element")
      return
    }
    if (belowMoq) {
      toast.error("Below minimum order quantity", {
        description: `This customized item requires at least ${moq} units.`,
      })
      return
    }
    const outOfZone = doc.areas.some((a) => {
      const pa = template.print_areas.find((p) => p.id === a.areaId)
      return pa && a.elements.some((el) => isOutsideSafeZone(el, pa))
    })
    if (outOfZone) {
      toast.error("Fix out-of-bounds elements", {
        description: "Keep every element inside the green safe zone.",
      })
      return
    }
    setSubmitting(true)
    try {
      const preview_url = await buildPreviewUrl()
      // Persist the design version first so it is stored with the request.
      await persist(doc, preview_url, false)
      await addCustomizationToCart({
        countryCode,
        variantId,
        quantity,
        moq,
        mode: "editor",
        method: inferMethod(),
        product_id: product.id,
        template_id: template.id,
        color_count: Object.keys(doc.colors).length,
        design_document: doc,
        preview_url,
      })
      toast.success("Added to cart", {
        description: "Proceed to checkout to request a quote.",
      })
      router.push(`/${countryCode}/cart`)
    } catch (e) {
      toast.error("Could not add to cart", {
        description: e instanceof Error ? e.message : undefined,
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!storeTemplate) {
    return null
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-neutral-50">
      {/* top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="secondary"
            size="small"
            onClick={() => router.push(`/${countryCode}/products/${product.handle}`)}
          >
            ← Back
          </Button>
          <Heading level="h2" className="truncate">
            Design: {product.title}
          </Heading>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border overflow-hidden">
            {(["2d", "3d"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={clx(
                  "px-3 py-1.5 text-sm",
                  mode === m
                    ? "bg-neutral-900 text-white"
                    : "bg-white text-neutral-700"
                )}
              >
                {m === "2d" ? "2D Edit" : "3D View"}
              </button>
            ))}
          </div>
          <Button
            variant="secondary"
            size="small"
            isLoading={saving}
            onClick={handleSaveDraft}
          >
            Save draft
          </Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* left tools */}
        <aside className="w-56 shrink-0 border-r bg-white p-4 flex flex-col gap-4 overflow-y-auto">
          <div>
            <Text className="text-xs font-medium text-neutral-500 mb-2">
              ADD
            </Text>
            <label className="block">
              <span className="sr-only">Upload logo</span>
              <input
                type="file"
                accept={ACCEPTED_ARTWORK_MIME.join(",")}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) {
                    handleAddLogo(f)
                  }
                  e.target.value = ""
                }}
                id="logo-upload"
              />
              <Button
                variant="secondary"
                className="w-full mb-2"
                onClick={() =>
                  document.getElementById("logo-upload")?.click()
                }
              >
                Upload logo
              </Button>
            </label>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => addTextElement("YOUR TEXT")}
            >
              Add text
            </Button>
          </div>

          {template.print_areas.length > 1 && (
            <div>
              <Text className="text-xs font-medium text-neutral-500 mb-2">
                PRINT AREA
              </Text>
              <div className="flex flex-col gap-1">
                {template.print_areas.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setActiveArea(a.id)}
                    className={clx(
                      "text-left px-3 py-2 rounded-lg text-sm border",
                      a.id === activeAreaId
                        ? "border-neutral-900 bg-neutral-100"
                        : "border-transparent hover:bg-neutral-50"
                    )}
                  >
                    {a.label ?? a.id}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <Text className="text-xs font-medium text-neutral-500 mb-2">
              LAYERS
            </Text>
            <div className="flex flex-col gap-1">
              {elements.length === 0 && (
                <Text className="text-xs text-neutral-400">No elements yet</Text>
              )}
              {elements.map((el) => (
                <button
                  key={el.id}
                  onClick={() => select(el.id)}
                  className={clx(
                    "text-left px-3 py-1.5 rounded-md text-sm truncate border",
                    el.id === selectedId
                      ? "border-neutral-900 bg-neutral-100"
                      : "border-transparent hover:bg-neutral-50"
                  )}
                >
                  {el.type === "image"
                    ? "🖼 Logo"
                    : `🅣 ${(el as TextElement).content}`}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* canvas */}
        <main className="flex-1 min-w-0 flex items-center justify-center p-6 overflow-auto">
          <div className="w-full max-w-[560px]">
            {mode === "2d" ? <Canvas2D /> : <Preview3D />}
            <Text className="text-xs text-neutral-400 text-center mt-3">
              {mode === "2d"
                ? "Drag, resize and rotate elements. Blue = print area, green = safe zone."
                : "Drag on the surface to move the selected element. Drag empty space to rotate the view."}
            </Text>
          </div>
        </main>

        {/* right panel */}
        <aside className="w-72 shrink-0 border-l bg-white p-4 flex flex-col gap-4 overflow-y-auto">
          {printArea && (
            <div className="text-xs text-neutral-500 space-y-1">
              <div className="font-medium text-neutral-700">
                {printArea.label ?? printArea.id}
              </div>
              {printArea.widthMm && printArea.heightMm && (
                <div>
                  Area: {printArea.widthMm} × {printArea.heightMm} mm @{" "}
                  {printArea.dpi} DPI
                </div>
              )}
              {printArea.maxColors && <div>Max colors: {printArea.maxColors}</div>}
              {printArea.methods && (
                <div>Methods: {printArea.methods.join(", ")}</div>
              )}
            </div>
          )}

          {selected ? (
            <SelectedElementPanel
              key={selected.id}
              element={selected}
              colors={doc.colors}
              onUpdate={(patch) => updateElement(selected.id, patch)}
              onRemove={() => removeElement(selected.id)}
            />
          ) : (
            <Text className="text-sm text-neutral-400">
              Select an element to edit its properties.
            </Text>
          )}

          {warnings.length > 0 && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 space-y-1">
              {warnings.map((w) => (
                <Text key={w} className="text-xs text-amber-800">
                  ⚠ {w}
                </Text>
              ))}
            </div>
          )}
        </aside>
      </div>

      {/* bottom order bar */}
      <div className="border-t bg-white px-4 py-3 flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-neutral-500">Size</span>
            <select
              className="border rounded-md px-2 py-1.5 text-sm"
              value={variantId}
              onChange={(e) => setVariantId(e.target.value)}
            >
              {product.variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.title || v.sku || v.id}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-neutral-500">Qty</span>
            <input
              type="number"
              min={1}
              className={clx(
                "border rounded-md px-2 py-1.5 text-sm w-24",
                belowMoq && "border-red-400"
              )}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </label>
          <div className="text-xs text-neutral-500">
            MOQ {moq}
            {belowMoq && (
              <span className="text-red-500">
                {" "}
                · add {moq - quantity} more
              </span>
            )}
            {setupFee ? <span> · setup fee ~{setupFee}</span> : null}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Text className="text-xs text-neutral-400 max-w-[280px] hidden md:block">
            Final price is confirmed by quote (one-time setup fee + per-unit
            premium).
          </Text>
          <Button
            variant="primary"
            isLoading={submitting}
            disabled={belowMoq || !hasContent}
            onClick={handleAddToCart}
          >
            Use this design → Request quote
          </Button>
        </div>
      </div>
    </div>
  )
}

function SelectedElementPanel({
  element,
  colors,
  onUpdate,
  onRemove,
}: {
  element: ImageElement | TextElement
  colors: Record<string, string>
  onUpdate: (patch: Partial<ImageElement | TextElement>) => void
  onRemove: () => void
}) {
  return (
    <div className="space-y-3">
      <Text className="text-xs font-medium text-neutral-500">
        {element.type === "image" ? "LOGO" : "TEXT"}
      </Text>

      {element.type === "text" && (
        <>
          <label className="block">
            <span className="text-xs text-neutral-500">Content</span>
            <input
              className="w-full border rounded-md px-2 py-1.5 text-sm mt-1"
              value={(element as TextElement).content}
              onChange={(e) =>
                onUpdate({ content: e.target.value } as Partial<TextElement>)
              }
            />
          </label>
          <label className="block">
            <span className="text-xs text-neutral-500">Font</span>
            <select
              className="w-full border rounded-md px-2 py-1.5 text-sm mt-1"
              value={(element as TextElement).font}
              onChange={(e) =>
                onUpdate({ font: e.target.value } as Partial<TextElement>)
              }
            >
              {EDITOR_FONTS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <div>
            <span className="text-xs text-neutral-500">Color</span>
            <div className="flex gap-2 mt-1">
              {Object.entries(colors).map(([ref, hex]) => (
                <button
                  key={ref}
                  onClick={() =>
                    onUpdate({ colorRef: ref } as Partial<TextElement>)
                  }
                  className={clx(
                    "w-7 h-7 rounded-full border-2",
                    element.colorRef === ref
                      ? "border-neutral-900"
                      : "border-neutral-200"
                  )}
                  style={{ backgroundColor: hex }}
                  aria-label={ref}
                />
              ))}
            </div>
          </div>
        </>
      )}

      <label className="block">
        <span className="text-xs text-neutral-500">
          Rotation ({Math.round(element.rotation ?? 0)}°)
        </span>
        <input
          type="range"
          min={-180}
          max={180}
          value={element.rotation ?? 0}
          onChange={(e) =>
            onUpdate({ rotation: Number(e.target.value) })
          }
          className="w-full"
        />
      </label>

      <label className="block">
        <span className="text-xs text-neutral-500">
          Size ({Math.round(element.w * 100)}%)
        </span>
        <input
          type="range"
          min={5}
          max={100}
          value={Math.round(element.w * 100)}
          onChange={(e) => {
            const w = Number(e.target.value) / 100
            const ratio =
              element.type === "image" &&
              (element as ImageElement).naturalHeight
                ? (element as ImageElement).naturalHeight! /
                  (element as ImageElement).naturalWidth!
                : (element.h ?? element.w) / element.w
            onUpdate({ w, h: w * ratio })
          }}
          className="w-full"
        />
      </label>

      <Button variant="danger" size="small" className="w-full" onClick={onRemove}>
        Delete element
      </Button>
    </div>
  )
}
