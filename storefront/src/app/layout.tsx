import { retrieveStore } from "@/lib/data/store"
import { getBaseURL } from "@/lib/util/env"
import { Toaster } from "@medusajs/ui"
import { Analytics } from "@vercel/analytics/next"
import { GeistSans } from "geist/font/sans"
import { Metadata } from "next"
import "@/styles/globals.css"

export async function generateMetadata(): Promise<Metadata> {
  const store = await retrieveStore()
  const storeName = store?.name || "Medusa Store"

  return {
    metadataBase: new URL(getBaseURL()),
    // Child pages set a page-specific title (e.g. a product name); this
    // template appends the store name so branding stays consistent and is
    // driven from the backend. Pages with no title fall back to `default`.
    title: {
      template: `%s | ${storeName}`,
      default: storeName,
    },
  }
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light" className={GeistSans.variable}>
      <body>
        <main className="relative">{props.children}</main>
        <Toaster className="z-[99999]" position="bottom-left" />
        <Analytics />
      </body>
    </html>
  )
}
