import { create } from "zustand"
import {
  DEFAULT_DESIGN_COLORS,
  DEFAULT_FONT_ID,
  DESIGN_DOCUMENT_VERSION,
  EditorMode,
} from "./constants"
import { clampToSafeZone } from "./lib/geometry"
import {
  DesignDocument,
  DesignElement,
  DesignTemplate,
  ImageElement,
  PrintArea,
  TextElement,
} from "./types"

let elementSeq = 0
const nextElementId = () => `el_${Date.now().toString(36)}_${elementSeq++}`

function emptyDocument(): DesignDocument {
  return {
    version: DESIGN_DOCUMENT_VERSION,
    unit: "normalized",
    areas: [],
    colors: { ...DEFAULT_DESIGN_COLORS },
  }
}

function findArea(doc: DesignDocument, areaId: string) {
  return doc.areas.find((a) => a.areaId === areaId)
}

function upsertArea(doc: DesignDocument, areaId: string) {
  let area = findArea(doc, areaId)
  if (!area) {
    area = { areaId, elements: [] }
    doc.areas.push(area)
  }
  return area
}

type EditorState = {
  template: DesignTemplate | null
  doc: DesignDocument
  activeAreaId: string
  selectedId: string | null
  mode: EditorMode
  dirty: boolean
  requestId: string | null
  designId: string | null
  // bumped whenever the doc changes, so the 3D texture knows to re-render
  revision: number

  init: (input: {
    template: DesignTemplate | null
    doc?: DesignDocument | null
    requestId?: string | null
    designId?: string | null
  }) => void
  setMode: (mode: EditorMode) => void
  setActiveArea: (areaId: string) => void
  select: (id: string | null) => void
  addImageElement: (input: {
    url: string
    fileId?: string | null
    naturalWidth?: number
    naturalHeight?: number
  }) => void
  addTextElement: (content: string) => void
  updateElement: (id: string, patch: Partial<DesignElement>) => void
  moveElementNormalized: (id: string, x: number, y: number) => void
  removeElement: (id: string) => void
  setColorValue: (ref: string, hex: string) => void
  markSaved: (input: { requestId: string; designId: string }) => void
}

function activePrintArea(
  template: DesignTemplate | null,
  areaId: string
): PrintArea | undefined {
  return template?.print_areas.find((a) => a.id === areaId)
}

export const useEditorStore = create<EditorState>((set, get) => ({
  template: null,
  doc: emptyDocument(),
  activeAreaId: "",
  selectedId: null,
  mode: "2d",
  dirty: false,
  requestId: null,
  designId: null,
  revision: 0,

  init: ({ template, doc, requestId, designId }) => {
    const firstArea = template?.print_areas[0]?.id ?? ""
    set({
      template,
      doc: doc ?? emptyDocument(),
      activeAreaId: firstArea,
      selectedId: null,
      mode: "2d",
      dirty: false,
      requestId: requestId ?? null,
      designId: designId ?? null,
      revision: get().revision + 1,
    })
  },

  setMode: (mode) => set({ mode }),
  setActiveArea: (areaId) => set({ activeAreaId: areaId, selectedId: null }),
  select: (id) => set({ selectedId: id }),

  addImageElement: ({ url, fileId, naturalWidth, naturalHeight }) => {
    const { doc, activeAreaId, template } = get()
    const next = structuredClone(doc)
    const area = upsertArea(next, activeAreaId)
    // Fit the logo to ~40% of the area width, preserving aspect ratio.
    const aspect =
      naturalWidth && naturalHeight ? naturalHeight / naturalWidth : 0.6
    const w = 0.4
    const el: ImageElement = {
      id: nextElementId(),
      type: "image",
      url,
      fileId: fileId ?? null,
      naturalWidth,
      naturalHeight,
      x: 0.3,
      y: 0.3,
      w,
      h: w * aspect,
      rotation: 0,
    }
    const pa = activePrintArea(template, activeAreaId)
    if (pa) {
      const clamped = clampToSafeZone(el, pa)
      el.x = clamped.x
      el.y = clamped.y
      el.w = clamped.w
      el.h = clamped.h
    }
    area.elements.push(el)
    set({
      doc: next,
      selectedId: el.id,
      dirty: true,
      revision: get().revision + 1,
    })
  },

  addTextElement: (content) => {
    const { doc, activeAreaId, template } = get()
    const next = structuredClone(doc)
    const area = upsertArea(next, activeAreaId)
    const el: TextElement = {
      id: nextElementId(),
      type: "text",
      content: content || "TEXT",
      font: DEFAULT_FONT_ID,
      colorRef: "c1",
      x: 0.25,
      y: 0.45,
      w: 0.5,
      h: 0.15,
      rotation: 0,
    }
    const pa = activePrintArea(template, activeAreaId)
    if (pa) {
      const clamped = clampToSafeZone(el, pa)
      el.x = clamped.x
      el.y = clamped.y
      el.w = clamped.w
      el.h = clamped.h
    }
    area.elements.push(el)
    set({
      doc: next,
      selectedId: el.id,
      dirty: true,
      revision: get().revision + 1,
    })
  },

  updateElement: (id, patch) => {
    const { doc, activeAreaId, template } = get()
    const next = structuredClone(doc)
    const area = findArea(next, activeAreaId)
    if (!area) {
      return
    }
    const idx = area.elements.findIndex((e) => e.id === id)
    if (idx === -1) {
      return
    }
    const merged = { ...area.elements[idx], ...patch } as DesignElement
    const pa = activePrintArea(template, activeAreaId)
    if (pa) {
      const clamped = clampToSafeZone(merged, pa)
      merged.x = clamped.x
      merged.y = clamped.y
      merged.w = clamped.w
      merged.h = clamped.h
    }
    area.elements[idx] = merged
    set({ doc: next, dirty: true, revision: get().revision + 1 })
  },

  moveElementNormalized: (id, x, y) => {
    get().updateElement(id, { x, y } as Partial<DesignElement>)
  },

  removeElement: (id) => {
    const { doc, activeAreaId, selectedId } = get()
    const next = structuredClone(doc)
    const area = findArea(next, activeAreaId)
    if (area) {
      area.elements = area.elements.filter((e) => e.id !== id)
    }
    set({
      doc: next,
      selectedId: selectedId === id ? null : selectedId,
      dirty: true,
      revision: get().revision + 1,
    })
  },

  setColorValue: (ref, hex) => {
    const { doc } = get()
    const next = structuredClone(doc)
    next.colors[ref] = hex
    set({ doc: next, dirty: true, revision: get().revision + 1 })
  },

  markSaved: ({ requestId, designId }) =>
    set({ requestId, designId, dirty: false }),
}))
