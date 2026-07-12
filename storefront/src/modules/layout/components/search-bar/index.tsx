"use client"

import { MagnifyingGlassMini } from "@medusajs/icons"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

/**
 * Product search input for the nav. Submits to the localized `/search` results
 * page (`/[countryCode]/search?q=...`); the actual query runs server-side via
 * the MeiliSearch-backed `searchProducts` data function.
 */
const SearchBar = () => {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const countryCode = (params?.countryCode as string) || ""

  const [value, setValue] = useState(searchParams.get("q") ?? "")

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = value.trim()
    if (!q) {
      return
    }
    router.push(`/${countryCode}/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <form onSubmit={submit} className="relative mr-2 hidden small:inline-flex">
      <input
        type="search"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search for products"
        aria-label="Search for products"
        className="bg-gray-100 text-zinc-900 px-4 py-2 rounded-full pr-10 shadow-borders-base hidden small:inline-block focus:outline-none focus:ring-2 focus:ring-neutral-400"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-500 hover:text-zinc-900"
      >
        <MagnifyingGlassMini className="w-4 h-4" />
      </button>
    </form>
  )
}

export default SearchBar
