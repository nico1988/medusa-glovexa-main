// Mirrors the real ProductPreview card (image, brand, title, price, stock,
// add-to-cart) so the loading state reads as a product card rather than one
// large blank block.
const SkeletonProductPreview = () => {
  return (
    <div className="flex flex-col gap-4 relative aspect-[3/5] w-full overflow-hidden p-4 bg-white shadow-borders-base rounded-lg animate-pulse">
      {/* Image */}
      <div className="w-full flex-1 p-2">
        <div className="w-full h-full rounded-lg bg-ui-bg-subtle" />
      </div>

      {/* Brand + title */}
      <div className="flex flex-col gap-2">
        <div className="h-2.5 w-12 rounded bg-ui-bg-subtle" />
        <div className="h-3.5 w-full rounded bg-ui-bg-subtle" />
        <div className="h-3.5 w-2/3 rounded bg-ui-bg-subtle" />
      </div>

      {/* Price */}
      <div className="flex flex-col gap-1">
        <div className="h-5 w-20 rounded bg-ui-bg-subtle" />
        <div className="h-2 w-10 rounded bg-ui-bg-subtle" />
      </div>

      {/* Stock + add-to-cart */}
      <div className="flex justify-between items-center">
        <div className="h-3 w-14 rounded bg-ui-bg-subtle" />
        <div className="h-8 w-8 rounded-full bg-ui-bg-subtle" />
      </div>
    </div>
  )
}

export default SkeletonProductPreview
