"use client"

import { Button, Text, clx, toast } from "@medusajs/ui"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  addCustomizationToCart,
  uploadCustomizationFile,
} from "@/lib/data/customization"
import {
  ACCEPTED_ARTWORK_MIME,
  MAX_ARTWORK_BYTES,
} from "../../constants"

// Inline configurator (PRD §6.1) for customizable products without a design
// template. Produces a customization request (no design_document) and routes
// the item into the quote flow via the cart.
const METHODS = [
  { id: "logo", label: "Logo only" },
  { id: "text", label: "Text only" },
  { id: "both", label: "Logo + text" },
] as const

const POSITIONS = [
  { id: "back-of-hand", label: "Back of hand" },
  { id: "cuff", label: "Cuff" },
  { id: "box", label: "Box / case" },
] as const

const TECHNIQUES = [
  { id: "screen-print", label: "Screen print" },
  { id: "heat-transfer", label: "Heat transfer" },
  { id: "box-print", label: "Box print" },
] as const

type ConfiguratorProduct = {
  id: string
  title: string
  handle: string
  variants: { id: string; title: string; sku: string | null }[]
}

export default function Configurator({
  product,
  countryCode,
  moq,
  setupFee,
}: {
  product: ConfiguratorProduct
  countryCode: string
  moq: number
  setupFee: number | null
}) {
  const router = useRouter()
  const [method, setMethod] = useState<(typeof METHODS)[number]["id"]>("logo")
  const [technique, setTechnique] =
    useState<(typeof TECHNIQUES)[number]["id"]>("screen-print")
  const [positions, setPositions] = useState<string[]>(["back-of-hand"])
  const [textLines, setTextLines] = useState("")
  const [colorCount, setColorCount] = useState(1)
  const [notes, setNotes] = useState("")
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "")
  const [quantity, setQuantity] = useState(moq)
  const [artwork, setArtwork] = useState<{ url: string; name: string } | null>(
    null
  )
  const [submitting, setSubmitting] = useState(false)

  const belowMoq = quantity < moq
  const needsLogo = method !== "text"
  const needsText = method !== "logo"

  const togglePosition = (id: string) =>
    setPositions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )

  const handleUpload = async (file: File) => {
    if (file.size > MAX_ARTWORK_BYTES) {
      toast.error("File too large (max 20 MB)")
      return
    }
    if (!ACCEPTED_ARTWORK_MIME.includes(file.type)) {
      toast.error("Use SVG, PNG, JPG or PDF")
      return
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
    try {
      const uploaded = await uploadCustomizationFile({
        filename: file.name,
        mimeType: file.type,
        dataBase64: dataUrl.split(",")[1] ?? "",
      })
      setArtwork({ url: uploaded.url, name: file.name })
      toast.success("Logo uploaded")
    } catch {
      toast.error("Upload failed")
    }
  }

  const handleSubmit = async () => {
    if (belowMoq) {
      toast.error("Below MOQ", {
        description: `Requires at least ${moq} units.`,
      })
      return
    }
    if (needsLogo && !artwork) {
      toast.error("Upload your logo")
      return
    }
    if (needsText && !textLines.trim()) {
      toast.error("Enter the text to print")
      return
    }
    setSubmitting(true)
    try {
      await addCustomizationToCart({
        countryCode,
        variantId,
        quantity,
        moq,
        mode: "configurator",
        method,
        product_id: product.id,
        print_technique: technique,
        color_count: colorCount,
        positions: { locations: positions, artwork_url: artwork?.url ?? null },
        text_content: needsText
          ? { lines: textLines.split("\n").filter(Boolean) }
          : null,
        notes,
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

  return (
    <div
      className="w-full rounded-xl border border-neutral-200 bg-white p-4 flex flex-col gap-4"
      data-testid="configurator"
    >
      <Text className="font-medium text-ui-fg-base">Customize this product</Text>

      <div>
        <Text className="text-xs text-neutral-500 mb-1">Method</Text>
        <div className="flex gap-2 flex-wrap">
          {METHODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={clx(
                "px-3 py-1.5 rounded-lg text-sm border",
                method === m.id
                  ? "border-neutral-900 bg-neutral-100"
                  : "border-neutral-200"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Text className="text-xs text-neutral-500 mb-1">Position</Text>
        <div className="flex gap-2 flex-wrap">
          {POSITIONS.map((p) => (
            <button
              key={p.id}
              onClick={() => togglePosition(p.id)}
              className={clx(
                "px-3 py-1.5 rounded-lg text-sm border",
                positions.includes(p.id)
                  ? "border-neutral-900 bg-neutral-100"
                  : "border-neutral-200"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {needsLogo && (
        <div>
          <Text className="text-xs text-neutral-500 mb-1">Logo</Text>
          <input
            type="file"
            accept={ACCEPTED_ARTWORK_MIME.join(",")}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleUpload(f)
            }}
            className="text-sm"
          />
          {artwork && (
            <Text className="text-xs text-green-600 mt-1">✓ {artwork.name}</Text>
          )}
        </div>
      )}

      {needsText && (
        <div>
          <Text className="text-xs text-neutral-500 mb-1">
            Text (one line per row)
          </Text>
          <textarea
            className="w-full border rounded-md px-2 py-1.5 text-sm"
            rows={2}
            value={textLines}
            onChange={(e) => setTextLines(e.target.value)}
            placeholder="ACME Corp"
          />
        </div>
      )}

      <div className="flex gap-4">
        <label className="text-sm">
          <span className="text-xs text-neutral-500 block mb-1">Technique</span>
          <select
            className="border rounded-md px-2 py-1.5 text-sm"
            value={technique}
            onChange={(e) => setTechnique(e.target.value as typeof technique)}
          >
            {TECHNIQUES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="text-xs text-neutral-500 block mb-1">Colors</span>
          <input
            type="number"
            min={1}
            max={6}
            className="border rounded-md px-2 py-1.5 text-sm w-20"
            value={colorCount}
            onChange={(e) => setColorCount(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="flex gap-4 items-end">
        <label className="text-sm">
          <span className="text-xs text-neutral-500 block mb-1">Size</span>
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
        <label className="text-sm">
          <span className="text-xs text-neutral-500 block mb-1">Qty</span>
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
        <Text className="text-xs text-neutral-500 pb-2">
          MOQ {moq}
          {setupFee ? ` · setup ~${setupFee}` : ""}
        </Text>
      </div>

      <textarea
        className="w-full border rounded-md px-2 py-1.5 text-sm"
        rows={2}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (special requirements, deadlines…)"
      />

      <Text className="text-xs text-neutral-400">
        Final price is confirmed by quote (one-time setup fee + per-unit
        premium).
      </Text>

      <Button
        variant="primary"
        isLoading={submitting}
        disabled={belowMoq}
        onClick={handleSubmit}
        data-testid="configurator-submit"
      >
        Add to cart → Request quote
      </Button>
    </div>
  )
}
