import SkeletonSearchResults from "@/modules/skeletons/templates/skeleton-search-results"

// Route-level fallback shown while navigating to the search page, before the
// page component resolves its params. Mirrors page.tsx's outer layout so the
// transition doesn't jump.
export default function Loading() {
  return (
    <div className="bg-neutral-100">
      <div className="flex flex-col py-6 content-container gap-4">
        <div className="h-8 w-64 rounded bg-ui-bg-subtle animate-pulse" />
        <SkeletonSearchResults />
      </div>
    </div>
  )
}
