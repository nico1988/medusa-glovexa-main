import { Heading } from "@medusajs/ui"
import Button from "@/modules/common/components/button"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import Image from "next/image"

const Hero = () => {
  return (
    <div className="h-[75vh] w-full border-b border-ui-border-base relative bg-neutral-100 overflow-hidden">
      <Image
        src="/hero-home.jpg"
        alt="Professional putting on nitrile protective gloves"
        fill
        quality={100}
        priority
        className="object-cover object-left"
      />
      {/* Gradient scrim keeps the copy legible over the image on all sizes. */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-white/40 via-white/60 to-white/90" />
      <div className="absolute inset-0 z-1 flex flex-col justify-center items-center small:items-end text-center small:text-right small:pr-24 p-8 gap-6">
        <span className="max-w-xl">
          <p className="text-neutral-600 text-xs uppercase tracking-widest">
            Trusted glove supply for business
          </p>

          <Heading
            level="h1"
            className="text-4xl small:text-6xl leading-tight text-ui-fg-base font-normal mt-6 mb-5"
          >
            Protective gloves, at wholesale scale
          </Heading>

          <p className="leading-relaxed text-ui-fg-subtle font-normal text-lg">
            Nitrile, latex, leather and work gloves — certified, in stock, and
            priced for bulk and trade accounts.
          </p>
        </span>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <LocalizedClientLink href="/store">
            <Button variant="primary" className="rounded-2xl">
              Shop all gloves
            </Button>
          </LocalizedClientLink>
          <LocalizedClientLink href="/wholesale">
            <Button variant="secondary" className="rounded-2xl">
              Wholesale &amp; bulk pricing
            </Button>
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

export default Hero
