import {
  ContentList,
  ContentPage,
  ContentSection,
} from "@/modules/content/components/content-page"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Wholesale",
  description:
    "Wholesale and bulk ordering for gloves: minimum order quantities, tiered pricing, samples and trade accounts.",
}

export default function WholesalePage() {
  return (
    <ContentPage
      title="Wholesale & Bulk Ordering"
      lead="Competitive trade pricing for distributors, retailers, workplaces and resellers — with volume discounts and dedicated account support."
    >
      <ContentSection heading="Who we supply">
        <ContentList
          items={[
            "Distributors & wholesalers",
            "Retailers & online sellers",
            "Workplaces buying PPE for their teams",
            "Clinics, labs and care providers (medical/disposable ranges)",
          ]}
        />
      </ContentSection>

      <ContentSection heading="Minimum order quantities">
        <p>
          {/* TODO: set your real MOQ tiers */}
          MOQs depend on the product line and whether the order is stock or
          custom. Stock items start at accessible minimums; larger volumes
          unlock better pricing. Contact us for the current MOQ and price breaks
          on the products you're interested in.
        </p>
      </ContentSection>

      <ContentSection heading="Volume pricing">
        <p>
          Pricing is tiered by quantity — the more you order, the lower the unit
          cost. We also offer contract pricing for regular, forecasted demand.
        </p>
      </ContentSection>

      <ContentSection heading="Samples first">
        <p>
          We strongly recommend ordering samples to confirm fit, material and
          quality before a bulk run. See our{" "}
          <LocalizedClientLink
            href="/sizing-guide"
            className="text-ui-fg-interactive hover:underline"
          >
            Sizing Guide
          </LocalizedClientLink>{" "}
          to get sizing right the first time.
        </p>
      </ContentSection>

      <ContentSection heading="Open a trade account">
        <p>
          Create an account and submit a{" "}
          <LocalizedClientLink
            href="/account"
            className="text-ui-fg-interactive hover:underline"
          >
            quote request
          </LocalizedClientLink>{" "}
          with your products and quantities. Our team will set you up with trade
          pricing and, where eligible, payment terms.
        </p>
      </ContentSection>
    </ContentPage>
  )
}
