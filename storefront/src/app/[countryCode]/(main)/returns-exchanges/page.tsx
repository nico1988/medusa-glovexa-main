import {
  ContentList,
  ContentPage,
  ContentSection,
} from "@/modules/content/components/content-page"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Returns & Exchanges",
  description:
    "Our returns and exchanges policy for wholesale and stock glove orders, including hygiene exclusions.",
}

export default function ReturnsExchangesPage() {
  return (
    <ContentPage
      title="Returns & Exchanges"
      lead="We want you confident in every order. If something isn't right, here's how returns and exchanges work."
    >
      <ContentSection heading="Return window">
        <p>
          {/* TODO: set your real return window */}
          Unused stock items in their original, unopened packaging may be
          returned within 30 days of delivery. Contact us first to receive a
          return authorisation.
        </p>
      </ContentSection>

      <ContentSection heading="Exchanges & sizing">
        <p>
          Ordered the wrong size? We're happy to exchange unopened stock items.
          Unlike jewellery, gloves cannot be resized — so please use our{" "}
          <LocalizedClientLink
            href="/sizing-guide"
            className="text-ui-fg-interactive hover:underline"
          >
            Sizing Guide
          </LocalizedClientLink>{" "}
          and order samples before a bulk run to avoid sizing issues.
        </p>
      </ContentSection>

      <ContentSection heading="What can't be returned">
        <ContentList
          items={[
            "Hygiene-sensitive items (medical / disposable gloves) once opened.",
            "Custom, private-label or made-to-order production.",
            "Items showing signs of use, laundering or damage.",
          ]}
        />
      </ContentSection>

      <ContentSection heading="Damaged or incorrect orders">
        <p>
          If your order arrives damaged or incorrect, contact us within{" "}
          {/* TODO: set your real reporting window */}7 days with photos and
          your order number. We'll arrange a replacement or refund at no cost to
          you.
        </p>
      </ContentSection>

      <ContentSection heading="How to start a return">
        <p>
          Email{" "}
          {/* TODO: replace with your real returns inbox */}
          <a
            className="text-ui-fg-interactive hover:underline"
            href="mailto:support@example.com"
          >
            support@example.com
          </a>{" "}
          with your order number and reason for return. We'll send return
          instructions and, where applicable, a shipping label.
        </p>
      </ContentSection>
    </ContentPage>
  )
}
