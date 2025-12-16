import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DemandRequestForm } from "@/components/demand-request-form"

export default async function CreateDemandPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "restaurant") {
    redirect("/dashboard")
  }

  // Get user's restaurant organizations
  const { data: organizations } = await supabase
    .from("organization_members")
    .select("organization:organizations(id, name, type)")
    .eq("user_id", user.id)

  const restaurantOrgs =
    organizations?.filter((org: any) => org.organization?.type === "restaurant").map((org: any) => org.organization) ||
    []

  if (restaurantOrgs.length === 0) {
    redirect("/organizations/create")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-900 mb-2">Post Demand Request</h1>
          <p className="text-lg text-green-700">Let farms know what you need and plan future supply</p>
        </div>

        <DemandRequestForm organizations={restaurantOrgs} />
      </div>
    </div>
  )
}
