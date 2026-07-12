import {
  ContentList,
  ContentPage,
  ContentSection,
  ContentTable,
} from "@/modules/content/components/content-page"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sizing Guide",
  description:
    "How to measure your hand and choose the correct glove size, with a hand circumference to size conversion chart.",
}

export default function SizingGuidePage() {
  return (
    <ContentPage
      title="Sizing Guide: How to Measure Your Hand"
      lead="Gloves are sized by hand circumference and hand length — not by wrist. A few minutes with a soft tape measure ensures the right fit across your whole order."
    >
      <ContentSection heading="What you'll need">
        <ContentList
          items={[
            "A soft/flexible tape measure (or a strip of paper and a ruler).",
            "Measure your dominant hand (usually slightly larger).",
          ]}
        />
      </ContentSection>

      <ContentSection heading="Step 1 — Hand circumference (width)">
        <p>
          Wrap the tape around the fullest part of your palm, just below the
          knuckles, excluding the thumb. Keep your hand relaxed and flat. Record
          the measurement in centimetres or inches.
        </p>
      </ContentSection>

      <ContentSection heading="Step 2 — Hand length">
        <p>
          Measure from the tip of your middle finger to the base of your palm
          (the first wrist crease). Use the larger of the two measurements
          (circumference vs. length) to pick your size.
        </p>
      </ContentSection>

      <ContentSection heading="Size chart">
        {/* TODO: replace with your actual size chart per product line */}
        <ContentTable
          headers={["Size", "Hand circumference", "Numeric"]}
          rows={[
            ["XS", "15–17 cm (6–6.5\")", "6"],
            ["S", "17–19 cm (7\")", "7"],
            ["M", "19–20 cm (8\")", "8"],
            ["L", "20–22 cm (9\")", "9"],
            ["XL", "22–24 cm (10\")", "10"],
            ["XXL", "24–26 cm (11\")", "11"],
          ]}
        />
        <p className="text-ui-fg-muted txt-small">
          Sizing can vary between materials and styles (e.g. leather stretches,
          disposables run closer to hand size). Always check the size chart on
          the specific product.
        </p>
      </ContentSection>

      <ContentSection heading="Ordering for a team?">
        <p>
          For workforce or resale orders, we recommend ordering a sample size
          run first. Our team can help you build a size curve (the quantity
          split across sizes) based on your workforce profile.
        </p>
      </ContentSection>
    </ContentPage>
  )
}
