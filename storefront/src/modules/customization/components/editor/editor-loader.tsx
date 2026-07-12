"use client"

import dynamic from "next/dynamic"
import { Spinner } from "@medusajs/icons"
import type { EditorProduct } from "./index"
import { DesignTemplate, SavedDesign } from "../../types"

// WebGL (R3F) and Konva need the DOM, so the editor is client-only (PRD §7.6).
const GloveEditor = dynamic(() => import("./index"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[70vh]">
      <Spinner className="animate-spin" />
    </div>
  ),
})

export default function EditorLoader(props: {
  product: EditorProduct
  template: DesignTemplate
  countryCode: string
  moq: number
  setupFee: number | null
  initialDesign: SavedDesign | null
}) {
  return <GloveEditor {...props} />
}
