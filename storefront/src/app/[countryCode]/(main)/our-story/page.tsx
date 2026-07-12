import {
  ContentPage,
  ContentSection,
} from "@/modules/content/components/content-page"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Who we are: a glove manufacturer and wholesale partner built on craftsmanship, quality and reliable supply.",
}

export default function OurStoryPage() {
  return (
    <ContentPage
      title="Our Story"
      lead="We make and supply gloves that businesses rely on — from safety and industrial protection to leather, sport and medical ranges."
      heroImage="/hero-our-story.jpg"
      heroAlt="Premium leather work gloves laid out on a workbench"
    >
      <ContentSection heading="Who we are">
        <p>
          {/* TODO: replace with your real company background */}
          Founded to bridge the gap between quality craftsmanship and dependable
          B2B supply, we partner with brands, distributors and workplaces around
          the world. Every glove we ship is built to a standard we'd stake our
          name on.
        </p>
      </ContentSection>

      <ContentSection heading="What we do">
        <p>
          We combine in-house manufacturing with a curated stock range, so we
          can serve both fast repeat orders and bespoke, made-to-spec
          production. Our catalogue spans four core categories — safety &amp;
          work, leather &amp; fashion, sport &amp; outdoor, and medical &amp;
          disposable.
        </p>
      </ContentSection>

      <ContentSection heading="Why partners choose us">
        <p>
          Consistent quality, transparent lead times, flexible minimums and a
          team that treats your deadlines as our own. Whether you need a pallet
          of work gloves or a private-label line, we're built to deliver at
          scale without compromising on fit and finish.
        </p>
      </ContentSection>

      <ContentSection heading="Let's work together">
        <p>
          Ready to talk volumes, samples or custom production? Reach out and
          our team will help you find the right product and price for your
          business.
        </p>
      </ContentSection>
    </ContentPage>
  )
}
