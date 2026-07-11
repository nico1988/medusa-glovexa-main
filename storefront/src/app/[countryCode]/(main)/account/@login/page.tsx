import { listRegions } from "@/lib/data/regions"
import { retrieveStore } from "@/lib/data/store"
import LoginTemplate from "@/modules/account/templates/login-template"
import { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const store = await retrieveStore()
  const storeName = store?.name || "Medusa Store"

  return {
    title: "Log in",
    description: `Log in to your ${storeName} account.`,
  }
}

export default async function Login() {
  const regions = await listRegions()

  return <LoginTemplate regions={regions} />
}
