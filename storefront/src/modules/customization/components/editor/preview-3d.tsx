"use client"

import { Canvas, ThreeEvent, useThree } from "@react-three/fiber"
import { Environment, OrbitControls, RoundedBox } from "@react-three/drei"
import { useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"
import { useEditorStore } from "../../store"
import { TEXTURE_SIZE } from "../../constants"
import { preloadDocumentImages, renderDesignToCanvas } from "../../lib/render-design"

// Renders the shared design_document onto a canvas and keeps it as a live
// CanvasTexture. The 3D view is a real editing surface: dragging on the mesh
// raycasts to UV coordinates and moves the selected element (PRD §7.2).
function DesignSurface({ onDraggingChange }: { onDraggingChange: (d: boolean) => void }) {
  const template = useEditorStore((s) => s.template)
  const doc = useEditorStore((s) => s.doc)
  const revision = useEditorStore((s) => s.revision)
  const activeAreaId = useEditorStore((s) => s.activeAreaId)
  const selectedId = useEditorStore((s) => s.selectedId)
  const select = useEditorStore((s) => s.select)
  const updateElement = useEditorStore((s) => s.updateElement)
  const { invalidate } = useThree()

  const canvas = useMemo(() => {
    const c = document.createElement("canvas")
    // Size upfront so the first CanvasTexture upload is valid (avoids a
    // GL_INVALID_VALUE warning before the async composite completes).
    c.width = TEXTURE_SIZE
    c.height = TEXTURE_SIZE
    return c
  }, [])
  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas)
    t.colorSpace = THREE.SRGBColorSpace // PRD §7.5.2 — avoid 3D/2D color drift
    t.anisotropy = 4
    return t
  }, [canvas])

  const [aspect, setAspect] = useState(1.25)
  const dragging = useRef(false)

  // Re-composite the texture whenever the design changes.
  useEffect(() => {
    let cancelled = false
    if (!template) {
      return
    }
    preloadDocumentImages(template, doc).then(() => {
      if (cancelled) {
        return
      }
      const { width, height } = renderDesignToCanvas(
        canvas,
        template,
        doc,
        TEXTURE_SIZE
      )
      setAspect(height / width)
      texture.needsUpdate = true
      invalidate()
    })
    return () => {
      cancelled = true
    }
  }, [template, doc, revision, canvas, texture, invalidate])

  const printArea = template?.print_areas.find((a) => a.id === activeAreaId)

  const uvToAreaMove = (e: ThreeEvent<PointerEvent>) => {
    if (!printArea || !selectedId || !e.uv) {
      return
    }
    const el = doc.areas
      .find((a) => a.areaId === activeAreaId)
      ?.elements.find((x) => x.id === selectedId)
    if (!el) {
      return
    }
    // uv: (0,0) bottom-left → base coords with y from top.
    const baseX = e.uv.x
    const baseY = 1 - e.uv.y
    const areaNormX = (baseX - printArea.x) / printArea.w
    const areaNormY = (baseY - printArea.y) / printArea.h
    const h = el.h ?? el.w
    updateElement(selectedId, {
      x: areaNormX - el.w / 2,
      y: areaNormY - h / 2,
    } as never)
  }

  const setDragging = (d: boolean) => {
    dragging.current = d
    onDraggingChange(d)
  }

  return (
    <group>
      {/* printable face */}
      <mesh
        position={[0, 0, 0.06]}
        onPointerDown={(e) => {
          e.stopPropagation()
          select(selectedId ?? null)
          if (selectedId) {
            setDragging(true)
            uvToAreaMove(e)
            ;(e.target as Element).setPointerCapture?.(e.pointerId)
          }
        }}
        onPointerMove={(e) => {
          if (dragging.current) {
            e.stopPropagation()
            uvToAreaMove(e)
          }
        }}
        onPointerUp={() => setDragging(false)}
      >
        <planeGeometry args={[1, aspect, 1, 1]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.85}
          metalness={0}
        />
      </mesh>
      {/* subtle volume behind so rotation reveals depth */}
      <RoundedBox
        args={[0.98, aspect * 0.98, 0.12]}
        radius={0.04}
        smoothness={4}
        position={[0, 0, -0.01]}
      >
        <meshStandardMaterial color="#c98a4b" roughness={0.9} />
      </RoundedBox>
    </group>
  )
}

export default function Preview3D() {
  const [dragging, setDragging] = useState(false)
  return (
    <div className="w-full h-full min-h-[420px] rounded-xl overflow-hidden bg-neutral-200">
      <Canvas camera={{ position: [0, 0, 2.1], fov: 40 }} dpr={[1, 2]}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 3, 4]} intensity={1.1} />
        <Environment preset="studio" />
        <DesignSurface onDraggingChange={setDragging} />
        <OrbitControls
          enablePan={false}
          enabled={!dragging}
          minDistance={1.3}
          maxDistance={3.5}
        />
      </Canvas>
    </div>
  )
}
