import { searchProducts } from "@/lib/data/search"
import { getRegion } from "@/lib/data/regions"
import ProductPreview from "@/modules/products/components/product-preview"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Search",
  description: "Search our product catalog.",
}

type Params = {
  searchParams: Promise<{ q?: string }>
  params: Promise<{ countryCode: string }>
}

export default async function SearchPage(props: Params) {
  const { countryCode } = await props.params
  const { q } = await props.searchParams
  const query = (q ?? "").trim()

  const region = await getRegion(countryCode)
  const { products, count } = query
    ? await searchProducts({ query, countryCode })
    : { products: [], count: 0 }

  return (
    <div className="bg-neutral-100">
      <div className="flex flex-col py-6 content-container gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-medium text-zinc-900">
            {query ? `Search results for “${query}”` : "Search"}
          </h1>
          {query && (
            <p className="text-neutral-600 text-sm">
              {count} {count === 1 ? "product" : "products"} found
            </p>
          )}
        </div>

        {!query && (
          <p className="text-neutral-600">
            Enter a search term in the bar above to find products.
          </p>
        )}

        {query && count === 0 && (
          <p className="text-neutral-600">
            No products matched your search. Try a different term.
          </p>
        )}

        {region && count > 0 && (
          <ul
            className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-3"
            data-testid="search-results"
          >
            {products.map((product) => (
              <li key={product.id}>
                <ProductPreview product={product} region={region} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
