import {
  ContentPage,
  ContentSection,
  ContentTable,
} from "@/modules/content/components/content-page"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Materials & Certifications",
  description:
    "Glove materials and the safety and quality standards we test to, including EN 388, EN 374 and medical-grade requirements.",
}

export default function MaterialsCertificationsPage() {
  return (
    <ContentPage
      title="Materials & Certifications"
      lead="The right glove starts with the right material and the right standard. Here's an overview of what we work with and the certifications that back it up."
    >
      <ContentSection heading="Materials we work with">
        <ContentTable
          headers={["Material", "Best for"]}
          rows={[
            ["Nitrile", "Chemical resistance, medical/exam, disposable"],
            ["Latex", "Elasticity, grip, medical (allergy considerations)"],
            ["Leather", "Durability, comfort, driving & fashion"],
            ["PU / PVC coatings", "General handling, grip, light industrial"],
            ["Cut-resistant yarns (e.g. HPPE)", "Protection against cuts and abrasion"],
          ]}
        />
      </ContentSection>

      <ContentSection heading="Certifications & standards">
        {/* TODO: list only the standards your products are actually certified to */}
        <ContentTable
          headers={["Standard", "Covers"]}
          rows={[
            ["EN 388", "Mechanical risks (abrasion, cut, tear, puncture)"],
            ["EN 374", "Protection against chemicals and micro-organisms"],
            ["EN 407", "Thermal risks (heat and fire)"],
            ["EN 511", "Protection against cold"],
            ["Medical device / exam-grade", "Medical and examination use"],
          ]}
        />
        <p className="text-ui-fg-muted txt-small">
          Certification applies per product and per market. Documentation
          (declarations of conformity, test reports) is available on request for
          the specific items you order.
        </p>
      </ContentSection>

      <ContentSection heading="Quality assurance">
        <p>
          {/* TODO: describe your real QA process / factory audits */}
          Every production run goes through inspection against agreed
          specifications. We can share our QA process and provide compliance
          documentation for your records and audits.
        </p>
      </ContentSection>
    </ContentPage>
  )
}
