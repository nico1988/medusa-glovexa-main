import {
  ContentList,
  ContentPage,
  ContentSection,
} from "@/modules/content/components/content-page"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Custom & OEM",
  description:
    "Custom manufacturing, private-label and OEM glove production — your materials, sizing, branding and packaging.",
}

export default function CustomOemPage() {
  return (
    <ContentPage
      title="Custom & OEM / Private Label"
      lead="Build your own glove line. We manufacture to your specification — from material and construction to branding and retail-ready packaging."
    >
      <ContentSection heading="What we can customise">
        <ContentList
          items={[
            "Materials & coatings (leather, nitrile, latex, PU, cut-resistant yarns, and more)",
            "Colours, sizing curves and fit",
            "Logos, woven labels, hang tags and embossing",
            "Custom and retail-ready packaging",
            "Certification testing for the target market",
          ]}
        />
      </ContentSection>

      <ContentSection heading="How the process works">
        <ContentList
          items={[
            "1. Brief — share your product, target use, quantities and budget.",
            "2. Quote & spec — we confirm materials, pricing and lead time.",
            "3. Sampling — we produce samples for your approval.",
            "4. Production — we manufacture and run quality control.",
            "5. Delivery — we ship worldwide with your chosen freight terms.",
          ]}
        />
      </ContentSection>

      <ContentSection heading="Minimums & lead times">
        <p>
          {/* TODO: set your real custom MOQ and lead times */}
          Custom production has higher minimums than stock items, and lead times
          depend on complexity and quantity. We'll give you exact figures with
          your quote.
        </p>
      </ContentSection>

      <ContentSection heading="Start a custom project">
        <p>
          Tell us what you're building via a{" "}
          <LocalizedClientLink
            href="/account"
            className="text-ui-fg-interactive hover:underline"
          >
            quote request
          </LocalizedClientLink>{" "}
          or{" "}
          <LocalizedClientLink
            href="/contact-us"
            className="text-ui-fg-interactive hover:underline"
          >
            contact our team
          </LocalizedClientLink>{" "}
          and we'll take it from there.
        </p>
      </ContentSection>
    </ContentPage>
  )
}
