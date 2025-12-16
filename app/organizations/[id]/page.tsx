import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Building2, MapPin, Sprout, Users, Truck, Calendar, CheckCircle } from "lucide-react"

export default async function OrganizationPage({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: reliability } = await supabase
    .from("organization_reliability")
    .select("*")
    .eq("organization_id", id)
    .single()

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
          <CardContent className="space-y-4">
            {organization.description && <p className="text-muted-foreground">{organization.description}</p>}
            {organization.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {organization.location}
              </div>
            )}

            {(organization.delivery_days?.length > 0 ||
              organization.pickup_available ||
              organization.delivery_notes) && (
              <div className="border-t pt-4 mt-4 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Truck className="h-4 w-4 text-green-600" />
                  Logistics & Coordination
                </h3>
                {organization.delivery_days?.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">
                      {organization.type === "farm" ? "Delivers on:" : "Receives on:"}
                    </span>
                    <div className="flex gap-2">
                      {organization.delivery_days.map((day: string) => (
                        <Badge key={day} variant="outline" className="capitalize">
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {organization.pickup_available && organization.type === "farm" && (
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span>Pickup available at farm</span>
                  </div>
                )}
                {organization.delivery_notes && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium mb-1">Delivery Notes:</p>
                    <p>{organization.delivery_notes}</p>
                  </div>
                )}
              </div>
            )}

            {reliability && (
              <div className="border-t pt-4 mt-4 space-y-2">
                <h3 className="font-semibold text-sm text-gray-700">Reliability Indicators</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Active Partnerships</p>
                    <p className="text-xl font-bold text-green-900">{reliability.active_partnerships}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Total Commitments</p>
                    <p className="text-xl font-bold text-green-900">{reliability.total_commitments}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Completion Rate</p>
                    <p className="text-xl font-bold text-green-900">
                      {reliability.total_commitments > 0
                        ? Math.round((reliability.completed_commitments / reliability.total_commitments) * 100)
                        : 0}
                      %
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">On-Time Deliveries</p>
                    <p className="text-xl font-bold text-green-900">
                      {reliability.total_deliveries > 0
                        ? Math.round((reliability.on_time_deliveries / reliability.total_deliveries) * 100)
                        : 0}
                      %
                    </p>
                  </div>
                </div>
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

        {isMember && (
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {organization.type === "farm" && (
              <Button asChild className="w-full bg-green-700 hover:bg-green-800">
                <Link href={`/organizations/${id}/products/create`}>Create Product Listing</Link>
              </Button>
            )}
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href={`/organizations/${id}/logistics`}>
                <Truck className="mr-2 h-4 w-4" />
                Manage Logistics
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
