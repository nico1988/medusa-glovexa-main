import {
  ContentFaq,
  ContentPage,
} from "@/modules/content/components/content-page"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "FAQs",
  description:
    "Answers to common questions about ordering, sizing, materials, certifications, shipping and returns.",
}

const FAQS: { question: string; answer: React.ReactNode }[] = [
  {
    question: "What is your minimum order quantity (MOQ)?",
    answer: (
      <p>
        {/* TODO: set your real MOQ */}
        MOQs vary by product line and customisation level. Stock items
        typically start at low quantities, while custom and private-label
        production has higher minimums. See our{" "}
        <LocalizedClientLink
          href="/wholesale"
          className="text-ui-fg-interactive hover:underline"
        >
          Wholesale
        </LocalizedClientLink>{" "}
        page for details.
      </p>
    ),
  },
  {
    question: "Do you offer custom or private-label gloves?",
    answer: (
      <p>
        Yes. We produce to your specifications — materials, colours, sizing,
        branding and packaging. Learn more on our{" "}
        <LocalizedClientLink
          href="/custom-oem"
          className="text-ui-fg-interactive hover:underline"
        >
          Custom &amp; OEM
        </LocalizedClientLink>{" "}
        page.
      </p>
    ),
  },
  {
    question: "How do I choose the right size?",
    answer: (
      <p>
        Gloves are sized by hand circumference and hand length. Follow our{" "}
        <LocalizedClientLink
          href="/sizing-guide"
          className="text-ui-fg-interactive hover:underline"
        >
          Sizing Guide
        </LocalizedClientLink>{" "}
        to measure correctly, and request samples before committing to a bulk
        run.
      </p>
    ),
  },
  {
    question: "Which certifications do your gloves carry?",
    answer: (
      <p>
        Depending on the range, our gloves are tested to standards such as EN
        388 (mechanical risks), EN 374 (chemical protection) and relevant
        medical-grade requirements. See{" "}
        <LocalizedClientLink
          href="/materials-certifications"
          className="text-ui-fg-interactive hover:underline"
        >
          Materials &amp; Certifications
        </LocalizedClientLink>
        .
      </p>
    ),
  },
  {
    question: "Can I order samples?",
    answer: (
      <p>
        {/* TODO: describe your sample policy and any fees */}
        Yes — we recommend samples before any bulk or custom order. Contact our
        sales team to arrange a sample pack.
      </p>
    ),
  },
  {
    question: "What are your lead times?",
    answer: (
      <p>
        {/* TODO: set real lead times */}
        In-stock items ship within a few business days. Custom production lead
        times depend on quantity and specification — typically several weeks.
      </p>
    ),
  },
  {
    question: "How do returns work?",
    answer: (
      <p>
        See our{" "}
        <LocalizedClientLink
          href="/returns-exchanges"
          className="text-ui-fg-interactive hover:underline"
        >
          Returns &amp; Exchanges
        </LocalizedClientLink>{" "}
        policy. Note that hygiene-sensitive items (e.g. medical/disposable
        gloves) may be non-returnable once opened.
      </p>
    ),
  },
]

export default function FaqsPage() {
  return (
    <ContentPage
      title="Frequently Asked Questions"
      lead="Quick answers to the questions we hear most from buyers. Can't find what you need? Contact our team."
    >
      <ContentFaq items={FAQS} />
    </ContentPage>
  )
}
