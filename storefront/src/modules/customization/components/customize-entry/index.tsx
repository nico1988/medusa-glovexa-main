import { Text } from "@medusajs/ui"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"

// Product-page entry point shown for customizable products that have a design
// template (PRD §6.2). Links to the full-screen online editor.
export default function CustomizeEntry({
  handle,
  moq,
  setupFee,
}: {
  handle: string
  moq: number
  setupFee: number | null
}) {
  return (
    <div
      className="w-full rounded-xl border border-dashed border-neutral-300 bg-white p-4 flex flex-col gap-2"
      data-testid="customize-callout"
    >
      <div className="flex items-center gap-2">
        <span aria-hidden>🎨</span>
        <Text className="font-medium text-ui-fg-base">
          Add your logo — design online
        </Text>
      </div>
      <Text className="text-sm text-ui-fg-subtle">
        Print your company logo or team names on the back of the glove. Minimum
        order {moq} units
        {setupFee ? `, one-time setup fee ~${setupFee}` : ""}. Final price is
        confirmed by quote.
      </Text>
      <LocalizedClientLink
        href={`/customize/${handle}`}
        className="inline-flex items-center justify-center rounded-lg bg-neutral-900 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800 transition-colors w-fit"
        data-testid="customize-link"
      >
        Design online →
      </LocalizedClientLink>
    </div>
  )
}
