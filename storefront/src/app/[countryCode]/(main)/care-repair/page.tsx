import {
  ContentList,
  ContentPage,
  ContentSection,
} from "@/modules/content/components/content-page"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Care & Repair",
  description:
    "How to care for and extend the life of your gloves, plus repair options for premium leather styles.",
}

export default function CareRepairPage() {
  return (
    <ContentPage
      title="Care & Repair"
      lead="Proper care extends glove life and protects your investment. Care depends on the material — here's how to look after each type."
    >
      <ContentSection heading="Leather & fashion gloves">
        <ContentList
          items={[
            "Air-dry away from direct heat; never machine dry.",
            "Condition leather periodically to prevent cracking.",
            "Store flat or gently rolled, away from sunlight and moisture.",
          ]}
        />
      </ContentSection>

      <ContentSection heading="Safety & work gloves">
        <ContentList
          items={[
            "Follow the care label — many coated/cut-resistant gloves are machine washable.",
            "Inspect before each use; retire gloves with cuts, wear or degraded coating.",
            "Do not use gloves beyond their rated protection once damaged.",
          ]}
        />
      </ContentSection>

      <ContentSection heading="Sports & outdoor gloves">
        <ContentList
          items={[
            "Rinse off sweat and dirt; air-dry fully to preserve grip and padding.",
            "Avoid harsh detergents that break down water-repellent finishes.",
          ]}
        />
      </ContentSection>

      <ContentSection heading="Medical & disposable gloves">
        <p>
          Disposable gloves are single-use and cannot be cleaned or reused.
          Dispose of them according to your local regulations for the
          application.
        </p>
      </ContentSection>

      <ContentSection heading="Repairs">
        <p>
          {/* TODO: confirm whether you offer a repair service and any charges */}
          For premium leather styles, we offer repairs on seams and closures
          where the glove is otherwise sound. Contact our team with photos and
          your order number and we'll advise whether a repair is possible and
          the cost.
        </p>
      </ContentSection>
    </ContentPage>
  )
}
