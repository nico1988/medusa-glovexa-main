import { getProductByHandle } from "@/lib/data/products"
import { getRegion } from "@/lib/data/regions"
import { getDesignTemplate, loadDesign } from "@/lib/data/customization"
import EditorLoader from "@/modules/customization/components/editor/editor-loader"
import { getProductCustomization } from "@/modules/customization/lib/product-customization"
import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{ designId?: string }>
}

export const metadata: Metadata = {
  title: "Design online",
}

export default async function CustomizePage(props: Props) {
  const { countryCode, handle } = await props.params
  const { designId } = await props.searchParams

  const region = await getRegion(countryCode)
  if (!region) {
    notFound()
  }

  const product = await getProductByHandle(handle, region.id)
  if (!product) {
    notFound()
  }

  const template = await getDesignTemplate(product.id)
  // No design template → the product uses the inline configurator on its page.
  if (!template) {
    redirect(`/${countryCode}/products/${handle}`)
  }

  const { moq, setupFee } = getProductCustomization(
    product.metadata as Record<string, unknown> | null
  )

  const initialDesign = designId
    ? await loadDesign(designId)
        .then((r) => r.design)
        .catch(() => null)
    : null

  return (
    <EditorLoader
      product={{
        id: product.id,
        title: product.title,
        handle: product.handle!,
        thumbnail: product.thumbnail ?? null,
        variants: (product.variants ?? []).map((v) => ({
          id: v.id,
          title: v.title ?? "",
          sku: v.sku ?? null,
        })),
      }}
      template={template}
      countryCode={countryCode}
      moq={moq}
      setupFee={setupFee}
      initialDesign={initialDesign}
    />
  )
}
