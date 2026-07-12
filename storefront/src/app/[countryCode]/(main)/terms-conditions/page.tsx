import {
  ContentPage,
  ContentSection,
} from "@/modules/content/components/content-page"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms that govern the use of our website and the sale of our products, including wholesale orders.",
}

export default function TermsConditionsPage() {
  return (
    <ContentPage
      title="Terms & Conditions"
      // TODO: set the real effective date and have this reviewed by legal counsel.
      meta="Last updated: [DATE]"
      lead="These terms govern your use of our website and your purchase of our products. This is a template starting point and should be reviewed by qualified legal counsel before you publish it."
    >
      <ContentSection heading="Orders & acceptance">
        <p>
          All orders are subject to acceptance and product availability. Placing
          an order constitutes an offer to buy; a contract is formed when we
          confirm the order. Quotes are valid for the period stated on them.
        </p>
      </ContentSection>

      <ContentSection heading="Pricing & payment">
        <p>
          Prices are as quoted or displayed and may exclude taxes, duties and
          shipping unless stated. Wholesale and contract pricing is governed by
          the quote or agreement provided to your account.
        </p>
      </ContentSection>

      <ContentSection heading="Shipping & risk">
        <p>
          Delivery timeframes are estimates. Risk passes to the buyer on
          delivery per the agreed incoterms. See our Shipping page for details.
        </p>
      </ContentSection>

      <ContentSection heading="Returns">
        <p>
          Returns are handled per our Returns &amp; Exchanges policy. Custom,
          made-to-order and hygiene-sensitive products may be non-returnable.
        </p>
      </ContentSection>

      <ContentSection heading="Product use & compliance">
        <p>
          Protective gloves must be selected and used appropriately for the
          intended task and in line with their certification. The buyer is
          responsible for ensuring the product is suitable for its intended use
          and compliant with local regulations.
        </p>
      </ContentSection>

      <ContentSection heading="Limitation of liability">
        <p>
          {/* TODO: have your liability, warranty and indemnity terms drafted by legal counsel. */}
          To the extent permitted by law, our liability is limited to the value
          of the products purchased. Nothing in these terms excludes liability
          that cannot be excluded by law.
        </p>
      </ContentSection>

      <ContentSection heading="Governing law">
        <p>
          {/* TODO: set the governing jurisdiction for your business. */}
          These terms are governed by the laws of [JURISDICTION], and disputes
          are subject to the exclusive jurisdiction of its courts.
        </p>
      </ContentSection>
    </ContentPage>
  )
}
