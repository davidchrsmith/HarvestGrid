import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, TrendingUp, Users } from "lucide-react"

export default async function DemandBoardPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get all active demand requests with restaurant info and reliability
  const { data: demandRequests } = await supabase
    .from("demand_requests")
    .select(`
      *,
      organization:organizations(
        id, 
        name, 
        type, 
        location,
        reliability:organization_reliability(*)
      )
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false })

  // Get user's organizations to check if they're a farmer
  const { data: userOrgs } = await supabase
    .from("organization_members")
    .select("organization:organizations(id, name, type)")
    .eq("user_id", user.id)

  const isFarmer = userOrgs?.some((org) => org.organization?.type === "farm")

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-green-900 mb-2">Restaurant Demand Board</h1>
            <p className="text-lg text-green-700">Plan ahead and fulfill future supply needs</p>
          </div>
          {profile?.role === "restaurant" && (
            <Button asChild size="lg">
              <Link href="/demand/create">Post Demand Request</Link>
            </Button>
          )}
        </div>

        {demandRequests && demandRequests.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {demandRequests.map((request: any) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-green-900">{request.product_name}</CardTitle>
                      <CardDescription className="mt-1">
                        <span className="font-medium">{request.organization.name}</span>
                      </CardDescription>
                      {request.organization.reliability && request.organization.reliability.length > 0 && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs bg-green-50 border-green-300 text-green-700">
                            {request.organization.reliability[0].active_partnerships} Active Partnership
                            {request.organization.reliability[0].active_partnerships !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {request.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-medium">
                      {request.quantity} {request.unit}
                    </span>
                    <span className="text-gray-400">•</span>
                    <Badge variant="outline" className="capitalize">
                      {request.frequency}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>From {new Date(request.start_date).toLocaleDateString()}</span>
                    {request.end_date && <span>to {new Date(request.end_date).toLocaleDateString()}</span>}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>Within {request.preferred_radius_miles} miles</span>
                  </div>
                  {request.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mt-2">{request.description}</p>
                  )}
                </CardContent>
                <CardFooter>
                  {isFarmer ? (
                    <Button asChild className="w-full">
                      <Link href={`/demand/${request.id}`}>Respond to Demand</Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline" className="w-full bg-transparent">
                      <Link href={`/demand/${request.id}`}>View Details</Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Demand Requests</h3>
              <p className="text-gray-600 mb-6">
                {profile?.role === "restaurant"
                  ? "Be the first to post your supply needs!"
                  : "Check back later for new opportunities"}
              </p>
              {profile?.role === "restaurant" && (
                <Button asChild>
                  <Link href="/demand/create">Post Your First Request</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <div className="mt-8">
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
