import { Heading } from "@medusajs/ui"
import Image from "next/image"
import React from "react"

/**
 * Shared layout + building blocks for static content pages (Support, Company,
 * Legal, etc.). Keeping these in one place avoids duplicating markup and
 * styling across the dozen-or-so content pages.
 */

type ContentPageProps = {
  title: string
  lead?: string
  children: React.ReactNode
  /** Optional note shown under the title, e.g. "Last updated: ...". */
  meta?: string
  /**
   * Optional image (path under /public or an allowed remote host). When set,
   * the title + lead are rendered as an overlaid hero band instead of a plain
   * text header — used by the marketing landing pages (Wholesale, Our Story…).
   */
  heroImage?: string
  heroAlt?: string
}

export const ContentPage = ({
  title,
  lead,
  meta,
  children,
  heroImage,
  heroAlt,
}: ContentPageProps) => {
  if (heroImage) {
    return (
      <div className="pb-12 md:pb-20">
        <div className="relative h-[280px] md:h-[380px] w-full overflow-hidden border-b border-ui-border-base bg-neutral-900">
          <Image
            src={heroImage}
            alt={heroAlt ?? title}
            fill
            quality={100}
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
          <div className="content-container relative h-full flex flex-col justify-end pb-8 md:pb-12">
            <div className="max-w-3xl">
              <Heading
                level="h1"
                className="text-3xl md:text-5xl text-white font-normal"
              >
                {title}
              </Heading>
              {lead && (
                <p className="text-base md:text-lg text-white/85 leading-relaxed mt-4">
                  {lead}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="content-container pt-12 md:pt-16">
          <div className="max-w-3xl mx-auto">
            {meta && <p className="txt-small text-ui-fg-muted mb-6">{meta}</p>}
            <div className="flex flex-col gap-10 text-ui-fg-subtle leading-relaxed">
              {children}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="content-container py-12 md:py-20">
      <div className="max-w-3xl mx-auto">
        <Heading
          level="h1"
          className="text-3xl md:text-4xl text-ui-fg-base mb-4"
        >
          {title}
        </Heading>
        {meta && <p className="txt-small text-ui-fg-muted mb-6">{meta}</p>}
        {lead && (
          <p className="text-lg text-ui-fg-subtle leading-relaxed mb-10">
            {lead}
          </p>
        )}
        <div className="flex flex-col gap-10 text-ui-fg-subtle leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  )
}

type ContentSectionProps = {
  heading?: string
  children: React.ReactNode
}

export const ContentSection = ({ heading, children }: ContentSectionProps) => {
  return (
    <section className="flex flex-col gap-3">
      {heading && (
        <Heading level="h2" className="text-xl text-ui-fg-base">
          {heading}
        </Heading>
      )}
      {children}
    </section>
  )
}

/** A simple bulleted list from an array of strings or nodes. */
export const ContentList = ({ items }: { items: React.ReactNode[] }) => {
  return (
    <ul className="list-disc pl-5 flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}

/** Accordion-style FAQ that stays fully server-rendered via native details. */
export const ContentFaq = ({
  items,
}: {
  items: { question: string; answer: React.ReactNode }[]
}) => {
  return (
    <div className="flex flex-col divide-y divide-ui-border-base border-y border-ui-border-base">
      {items.map((item, i) => (
        <details key={i} className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-ui-fg-base font-medium">
            {item.question}
            <span className="text-ui-fg-muted transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <div className="pt-3 text-ui-fg-subtle leading-relaxed">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  )
}

/** Basic responsive table for sizing charts, spec grids, etc. */
export const ContentTable = ({
  headers,
  rows,
}: {
  headers: string[]
  rows: React.ReactNode[][]
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-ui-border-base">
            {headers.map((h, i) => (
              <th key={i} className="py-2 pr-4 text-ui-fg-base font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-ui-border-base">
              {row.map((cell, j) => (
                <td key={j} className="py-2 pr-4 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
