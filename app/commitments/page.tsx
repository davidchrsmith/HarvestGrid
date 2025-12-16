import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, TrendingUp, Repeat, CheckCircle2 } from "lucide-react"

export default async function CommitmentsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Get user's organizations
  const { data: userOrgs } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)

  const orgIds = userOrgs?.map((org) => org.organization_id) || []

  // Get commitments where user's orgs are involved
  const { data: commitments } = await supabase
    .from("commitments")
    .select(`
      *,
      restaurant:restaurant_organization_id(id, name, location),
      farm:farm_organization_id(id, name, location)
    `)
    .or(`restaurant_organization_id.in.(${orgIds.join(",")}),farm_organization_id.in.(${orgIds.join(",")})`)
    .order("next_delivery_date", { ascending: true, nullsFirst: false })

  // Separate active and completed
  const activeCommitments = commitments?.filter((c: any) => c.status === "active") || []
  const otherCommitments = commitments?.filter((c: any) => c.status !== "active") || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-900 mb-2">Your Commitments</h1>
          <p className="text-lg text-green-700">Planned supply and recurring delivery schedules</p>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-green-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6" />
              Active Commitments ({activeCommitments.length})
            </h2>
            {activeCommitments.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeCommitments.map((commitment: any) => (
                  <Card key={commitment.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg text-green-900">{commitment.product_name}</CardTitle>
                          <CardDescription className="mt-1">
                            {commitment.restaurant.name} ↔ {commitment.farm.name}
                          </CardDescription>
                        </div>
                        <Badge className="capitalize">{commitment.frequency}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-medium">
                          {commitment.quantity} {commitment.unit} @ ${commitment.price}
                        </span>
                      </div>
                      {commitment.next_delivery_date && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Next: {new Date(commitment.next_delivery_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Repeat className="h-4 w-4" />
                        <span>
                          {new Date(commitment.start_date).toLocaleDateString()} -{" "}
                          {commitment.end_date ? new Date(commitment.end_date).toLocaleDateString() : "Ongoing"}
                        </span>
                      </div>
                      <Button asChild size="sm" className="w-full mt-3">
                        <Link href={`/commitments/${commitment.id}`}>View Details</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-600">No active commitments yet</p>
                  <Button asChild className="mt-4">
                    <Link href="/demand">Browse Demand Board</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {otherCommitments.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Past & Paused Commitments</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {otherCommitments.map((commitment: any) => (
                  <Card key={commitment.id} className="opacity-75">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{commitment.product_name}</CardTitle>
                          <CardDescription className="text-sm">
                            {commitment.restaurant.name} ↔ {commitment.farm.name}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {commitment.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button asChild size="sm" variant="outline" className="w-full bg-transparent">
                        <Link href={`/commitments/${commitment.id}`}>View</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8">
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
