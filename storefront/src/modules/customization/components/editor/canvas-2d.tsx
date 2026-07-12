"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Image as KonvaImage, Layer, Rect, Stage, Text, Transformer } from "react-konva"
import type Konva from "konva"
import { useEditorStore } from "../../store"
import { DesignElement } from "../../types"
import {
  areaPixelRect,
  elementPixelRect,
  safeZonePixelRect,
} from "../../lib/geometry"
import { loadImage } from "../../lib/image-cache"
import { EDITOR_FONTS } from "../../constants"

// Interactive 2D editing surface. Konva provides transform handles, drag and
// hit-testing; every change is written back to the shared design_document.
export default function Canvas2D() {
  const template = useEditorStore((s) => s.template)
  const doc = useEditorStore((s) => s.doc)
  const activeAreaId = useEditorStore((s) => s.activeAreaId)
  const selectedId = useEditorStore((s) => s.selectedId)
  const select = useEditorStore((s) => s.select)
  const updateElement = useEditorStore((s) => s.updateElement)

  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(520)
  const [baseImg, setBaseImg] = useState<HTMLImageElement | null>(null)
  const [elementImgs, setElementImgs] = useState<Record<string, HTMLImageElement>>({})

  const transformerRef = useRef<Konva.Transformer>(null)
  const nodeRefs = useRef<Record<string, Konva.Node | null>>({})

  const printArea = useMemo(
    () => template?.print_areas.find((a) => a.id === activeAreaId),
    [template, activeAreaId]
  )
  const area = doc.areas.find((a) => a.areaId === activeAreaId)
  const elements = area?.elements ?? []

  // Responsive stage width.
  useEffect(() => {
    if (!containerRef.current) {
      return
    }
    const el = containerRef.current
    const ro = new ResizeObserver(() => {
      setContainerWidth(el.clientWidth)
    })
    ro.observe(el)
    setContainerWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  // Load the base asset.
  useEffect(() => {
    if (!template?.base_asset_url) {
      return
    }
    loadImage(template.base_asset_url).then(setBaseImg).catch(() => {})
  }, [template?.base_asset_url])

  // Load image elements.
  useEffect(() => {
    elements.forEach((el) => {
      if (el.type === "image" && el.url && !elementImgs[el.url]) {
        loadImage(el.url)
          .then((img) =>
            setElementImgs((prev) => ({ ...prev, [el.url]: img }))
          )
          .catch(() => {})
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements])

  const baseAspect =
    baseImg && baseImg.naturalWidth
      ? baseImg.naturalHeight / baseImg.naturalWidth
      : 1.25
  const width = containerWidth
  const height = Math.round(width * baseAspect)

  const areaRect = printArea
    ? areaPixelRect(printArea, width, height)
    : { x: 0, y: 0, w: width, h: height }
  const safeRect = printArea
    ? safeZonePixelRect(printArea, areaRect)
    : areaRect

  // Attach transformer to the selected node.
  useEffect(() => {
    const tr = transformerRef.current
    const node = selectedId ? nodeRefs.current[selectedId] : null
    if (tr) {
      tr.nodes(node ? [node] : [])
      tr.getLayer()?.batchDraw()
    }
  }, [selectedId, elements, width, height])

  const commitTransform = (el: DesignElement, node: Konva.Node) => {
    const scaleX = node.scaleX()
    const scaleY = node.scaleY()
    node.scaleX(1)
    node.scaleY(1)
    const newWpx = Math.max(8, node.width() * scaleX)
    const newHpx = Math.max(8, node.height() * scaleY)
    // Node position is its center (offset applied); convert back to top-left norm.
    const centerX = node.x()
    const centerY = node.y()
    updateElement(el.id, {
      x: (centerX - newWpx / 2 - areaRect.x) / areaRect.w,
      y: (centerY - newHpx / 2 - areaRect.y) / areaRect.h,
      w: newWpx / areaRect.w,
      h: newHpx / areaRect.h,
      rotation: node.rotation(),
    } as Partial<DesignElement>)
  }

  const commitDrag = (el: DesignElement, node: Konva.Node) => {
    const r = elementPixelRect(el, areaRect)
    const centerX = node.x()
    const centerY = node.y()
    updateElement(el.id, {
      x: (centerX - r.w / 2 - areaRect.x) / areaRect.w,
      y: (centerY - r.h / 2 - areaRect.y) / areaRect.h,
    } as Partial<DesignElement>)
  }

  return (
    <div ref={containerRef} className="w-full">
      <Stage
        width={width}
        height={height}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) {
            select(null)
          }
        }}
        onTouchStart={(e) => {
          if (e.target === e.target.getStage()) {
            select(null)
          }
        }}
      >
        <Layer>
          {baseImg && (
            <KonvaImage image={baseImg} width={width} height={height} listening={false} />
          )}
          {/* print area + safe zone guides */}
          <Rect
            x={areaRect.x}
            y={areaRect.y}
            width={areaRect.w}
            height={areaRect.h}
            stroke="#2563eb"
            strokeWidth={1.5}
            dash={[8, 6]}
            listening={false}
          />
          <Rect
            x={safeRect.x}
            y={safeRect.y}
            width={safeRect.w}
            height={safeRect.h}
            stroke="#22c55e"
            strokeWidth={1}
            dash={[4, 6]}
            listening={false}
          />
        </Layer>
        <Layer>
          {elements.map((el) => {
            const r = elementPixelRect(el, areaRect)
            const common = {
              x: r.x + r.w / 2,
              y: r.y + r.h / 2,
              offsetX: r.w / 2,
              offsetY: r.h / 2,
              rotation: el.rotation ?? 0,
              draggable: true,
              onClick: () => select(el.id),
              onTap: () => select(el.id),
              onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) =>
                commitDrag(el, e.target),
              onTransformEnd: (e: Konva.KonvaEventObject<Event>) =>
                commitTransform(el, e.target),
              ref: (node: Konva.Node | null) => {
                nodeRefs.current[el.id] = node
              },
            }
            if (el.type === "image") {
              const img = elementImgs[el.url]
              return (
                <KonvaImage
                  key={el.id}
                  {...common}
                  image={img}
                  width={r.w}
                  height={r.h}
                />
              )
            }
            const font = EDITOR_FONTS.find((f) => f.id === el.font)
            const color = (el.colorRef && doc.colors[el.colorRef]) || "#111111"
            return (
              <Text
                key={el.id}
                {...common}
                text={el.content}
                width={r.w}
                height={r.h}
                fontSize={r.h * 0.8}
                fontStyle={font?.css.includes("700") ? "bold" : "normal"}
                fontFamily={font?.label.replace(/ (Bold)$/, "") ?? "Inter"}
                fill={color}
                align="center"
                verticalAlign="middle"
              />
            )
          })}
          <Transformer
            ref={transformerRef}
            rotateEnabled
            keepRatio={false}
            boundBoxFunc={(oldBox, newBox) =>
              newBox.width < 8 || newBox.height < 8 ? oldBox : newBox
            }
          />
        </Layer>
      </Stage>
    </div>
  )
}
