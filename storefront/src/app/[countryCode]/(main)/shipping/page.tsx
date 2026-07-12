import {
  ContentList,
  ContentPage,
  ContentSection,
} from "@/modules/content/components/content-page"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shipping",
  description:
    "Shipping methods, lead times, freight options, duties and taxes for bulk and wholesale glove orders.",
}

export default function ShippingPage() {
  return (
    <ContentPage
      title="Shipping"
      lead="We ship stock and custom orders worldwide. Because volumes vary widely in B2B, the right method depends on your quantity, destination and deadline."
    >
      <ContentSection heading="Processing times">
        <ContentList
          items={[
            // TODO: set your real processing/lead times
            "In-stock items: dispatched within 2–5 business days.",
            "Custom / private-label production: typically several weeks depending on quantity and specification.",
            "You'll receive tracking details as soon as your order ships.",
          ]}
        />
      </ContentSection>

      <ContentSection heading="Methods & freight">
        <ContentList
          items={[
            "Small parcels: express courier (e.g. DHL, FedEx, UPS).",
            "Pallet & bulk orders: air or sea freight, quoted per shipment.",
            "We can ship on your carrier account or arrange freight on your behalf.",
          ]}
        />
      </ContentSection>

      <ContentSection heading="Duties, taxes & incoterms">
        <p>
          {/* TODO: confirm the incoterms you trade on */}
          International orders may be subject to import duties and taxes
          determined by the destination country. Unless agreed otherwise, orders
          ship on a DAP (Delivered at Place) basis and the buyer is responsible
          for any import charges. We can also quote DDP or EXW terms for larger
          contracts.
        </p>
      </ContentSection>

      <ContentSection heading="Need a freight quote?">
        <p>
          For a delivered price to your location, contact our sales team with
          your product, quantity and destination and we'll provide a full
          landed-cost quote.
        </p>
      </ContentSection>
    </ContentPage>
  )
}
