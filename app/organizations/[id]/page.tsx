import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Building2, MapPin, Sprout, Users } from "lucide-react"

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
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

  // Get organization members
  const { data: members } = await supabase
    .from("organization_members")
    .select(
      `
      *,
      profiles:user_id (
        email
      )
    `,
    )
    .eq("organization_id", id)

  // Check if current user is a member
  const isMember = members?.some((m: any) => m.user_id === user.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 p-6">
      <div className="container mx-auto max-w-4xl">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <CardTitle className="text-3xl">{organization.name}</CardTitle>
                  {organization.type === "farm" ? (
                    <Sprout className="h-6 w-6 text-green-700" />
                  ) : (
                    <Building2 className="h-6 w-6 text-amber-700" />
                  )}
                </div>
                <Badge variant="secondary" className="capitalize">
                  {organization.type}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {organization.description && <p className="mb-4 text-muted-foreground">{organization.description}</p>}
            {organization.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {organization.location}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Members
                </CardTitle>
                <CardDescription>
                  {members?.length || 0} member{members?.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {members?.map((member: any) => (
                <div key={member.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{member.profiles.email}</p>
                    <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {isMember && organization.type === "farm" && (
          <div className="mt-6">
            <Button asChild className="w-full bg-green-700 hover:bg-green-800">
              <Link href={`/organizations/${id}/products/create`}>Create Product Listing</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
