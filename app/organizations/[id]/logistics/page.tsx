import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { LogisticsForm } from "@/components/logistics-form"

export default async function OrganizationLogisticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get organization details
  const { data: organization } = await supabase.from("organizations").select("*").eq("id", id).single()

  if (!organization) {
    redirect("/dashboard")
  }

  // Check if current user is a member
  const { data: membership } = await supabase
    .from("organization_members")
    .select("*")
    .eq("organization_id", id)
    .eq("user_id", user.id)
    .single()

  if (!membership) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 p-6">
      <div className="container mx-auto max-w-3xl">
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/organizations/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Organization
          </Link>
        </Button>

        <LogisticsForm organization={organization} />
      </div>
    </div>
  )
}
