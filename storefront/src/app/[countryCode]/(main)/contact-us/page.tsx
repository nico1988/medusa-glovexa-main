import {
  ContentPage,
  ContentSection,
} from "@/modules/content/components/content-page"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with our team for orders, wholesale enquiries, custom manufacturing and support.",
}

export default function ContactUsPage() {
  return (
    <ContentPage
      title="Contact Us"
      lead="Whether you're placing a bulk order, exploring custom manufacturing, or need help with an existing order, our team is here to help."
    >
      <ContentSection heading="Sales & wholesale enquiries">
        <p>
          For pricing, minimum order quantities and lead times, email{" "}
          {/* TODO: replace with your real sales inbox */}
          <a
            className="text-ui-fg-interactive hover:underline"
            href="mailto:sales@example.com"
          >
            sales@example.com
          </a>
          . For the fastest turnaround, start a{" "}
          <LocalizedClientLink
            href="/account"
            className="text-ui-fg-interactive hover:underline"
          >
            quote request
          </LocalizedClientLink>{" "}
          from your account and our team will respond with a tailored offer.
        </p>
      </ContentSection>

      <ContentSection heading="Customer support">
        <p>
          Questions about sizing, materials, shipping or returns? Email{" "}
          {/* TODO: replace with your real support inbox */}
          <a
            className="text-ui-fg-interactive hover:underline"
            href="mailto:support@example.com"
          >
            support@example.com
          </a>{" "}
          or call{" "}
          {/* TODO: replace with your real phone number */}
          <span className="text-ui-fg-base">+1 (000) 000-0000</span>.
        </p>
        <p className="text-ui-fg-muted">
          {/* TODO: set your real support hours and time zone */}
          Support hours: Monday–Friday, 9:00–18:00 (GMT).
        </p>
      </ContentSection>

      <ContentSection heading="Head office">
        <p className="whitespace-pre-line">
          {/* TODO: replace with your real registered address */}
          {`Your Company Ltd.
123 Example Street
City, Region, Postal Code
Country`}
        </p>
      </ContentSection>
    </ContentPage>
  )
}
