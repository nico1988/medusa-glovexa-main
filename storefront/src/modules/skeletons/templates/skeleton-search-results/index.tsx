import repeat from "@/lib/util/repeat"
import SkeletonProductPreview from "@/modules/skeletons/components/skeleton-product-preview"

// Loading placeholder for the search results page: a "N products found"
// count line plus a grid of realistic product-card skeletons. The grid
// columns mirror the real results grid in search/page.tsx so the layout
// doesn't shift when data streams in.
const SkeletonSearchResults = ({ count = 3 }: { count?: number }) => {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {/* "N products found" line */}
      <div className="h-4 w-32 rounded bg-ui-bg-subtle" />

      <ul
        className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-3"
        data-testid="search-results-loader"
      >
        {repeat(count).map((index) => (
          <li key={index}>
            <SkeletonProductPreview />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SkeletonSearchResults
