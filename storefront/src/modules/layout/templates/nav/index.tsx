import { retrieveCart } from "@/lib/data/cart"
import { retrieveCustomer } from "@/lib/data/customer"
import { retrieveStore } from "@/lib/data/store"
import { PRIMARY_NAV_LINKS } from "@/modules/content/site-links"
import AccountButton from "@/modules/account/components/account-button"
import CartButton from "@/modules/cart/components/cart-button"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import FilePlus from "@/modules/common/icons/file-plus"
import LogoIcon from "@/modules/common/icons/logo"
import { MegaMenuWrapper } from "@/modules/layout/components/mega-menu"
import SearchBar from "@/modules/layout/components/search-bar"
import { RequestQuoteConfirmation } from "@/modules/quotes/components/request-quote-confirmation"
import { RequestQuotePrompt } from "@/modules/quotes/components/request-quote-prompt"
import SkeletonAccountButton from "@/modules/skeletons/components/skeleton-account-button"
import SkeletonCartButton from "@/modules/skeletons/components/skeleton-cart-button"
import SkeletonMegaMenu from "@/modules/skeletons/components/skeleton-mega-menu"
import { Suspense } from "react"

export async function NavigationHeader() {
  const customer = await retrieveCustomer().catch(() => null)
  const cart = await retrieveCart()
  const store = await retrieveStore()
  const storeName = store?.name || "Medusa Store"

  return (
    <div className="sticky top-0 inset-x-0 group bg-white text-zinc-900 small:p-4 p-2 text-sm border-b duration-200 border-ui-border-base z-50">
      <header className="flex w-full content-container relative small:mx-auto justify-between">
        <div className="small:mx-auto flex justify-between items-center min-w-full">
          <div className="flex items-center small:space-x-4">
            <LocalizedClientLink
              className="hover:text-ui-fg-base flex items-center w-fit"
              href="/"
            >
              <h1 className="small:text-base text-sm font-medium flex items-center">
                <LogoIcon className="inline mr-2" />
                {storeName}
              </h1>
            </LocalizedClientLink>

            <nav>
              <ul className="space-x-4 hidden small:flex items-center">
                <li>
                  <Suspense fallback={<SkeletonMegaMenu />}>
                    <MegaMenuWrapper />
                  </Suspense>
                </li>
                {PRIMARY_NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <LocalizedClientLink
                      href={link.href}
                      className="hover:text-ui-fg-base hover:bg-neutral-100 rounded-full px-3 py-2"
                    >
                      {link.label}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="flex justify-end items-center gap-2">
            <SearchBar />

            <div className="h-4 w-px bg-neutral-300" />

            {customer && cart?.items && cart.items.length > 0 ? (
              <RequestQuoteConfirmation>
                <button
                  className="flex gap-1.5 items-center rounded-2xl bg-none shadow-none border-none hover:bg-neutral-100 px-2 py-1"
                  // disabled={isPendingApproval}
                >
                  <FilePlus />
                  <span className="hidden small:inline-block">Quote</span>
                </button>
              </RequestQuoteConfirmation>
            ) : (
              <RequestQuotePrompt>
                <button className="flex gap-1.5 items-center rounded-2xl bg-none shadow-none border-none hover:bg-neutral-100 px-2 py-1">
                  <FilePlus />
                  <span className="hidden small:inline-block">Quote</span>
                </button>
              </RequestQuotePrompt>
            )}

            <Suspense fallback={<SkeletonAccountButton />}>
              <AccountButton customer={customer} />
            </Suspense>

            <Suspense fallback={<SkeletonCartButton />}>
              <CartButton />
            </Suspense>
          </div>
        </div>
      </header>
    </div>
  )
}
