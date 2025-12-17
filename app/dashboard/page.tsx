import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Building2, Plus, Sprout, Repeat, Leaf, TrendingUp, ArrowRight, ClipboardList } from "lucide-react"
import { SignoutButton } from "@/components/signout-button"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user's profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get user's organizations
  const { data: memberships } = await supabase
    .from("organization_members")
    .select(
      `
      *,
      organizations:organization_id (
        id,
        name,
        type,
        description,
        location
      )
    `,
    )
    .eq("user_id", user.id)

  const organizations = memberships?.map((m: any) => m.organizations) || []
  const orgIds = organizations.map((o: any) => o.id)

  // Get active commitments count
  const { data: commitments } = await supabase
    .from("commitments")
    .select("id, status")
    .or(`restaurant_organization_id.in.(${orgIds.join(",")}),farm_organization_id.in.(${orgIds.join(",")})`)
    .eq("status", "active")

  // Get active demand requests count
  const { data: demands } = await supabase.from("demand_requests").select("id").eq("status", "active")

  // Get surplus products count
  const { data: surplus } = await supabase.from("products").select("id").eq("is_surplus", true).eq("available", true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-green-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Sprout className="h-6 w-6 text-green-700" />
            <span className="text-xl font-bold text-green-800">HarvestGrid</span>
          </div>
          <nav className="hidden md:flex gap-4">
            <Button variant="ghost" asChild>
              <Link href="/demand">
                <ClipboardList className="mr-2 h-4 w-4" />
                Demand Board
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/commitments">
                <Repeat className="mr-2 h-4 w-4" />
                Commitments
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/surplus">
                <Leaf className="mr-2 h-4 w-4" />
                Surplus
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/messages">Messages</Link>
            </Button>
          </nav>
          <SignoutButton />
        </div>
      </header>

      <main className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-green-900">Welcome to HarvestGrid</h1>
          <p className="text-lg text-green-700">
            Plan supply, coordinate logistics, and reduce waste — not just buy and sell
          </p>
          <Badge variant="secondary" className="mt-2 capitalize">
            {profile?.user_type === "farm" ? "Farm Worker" : "Restaurant Worker"}
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          <Card className="hover:shadow-lg transition-shadow border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <ClipboardList className="h-8 w-8 text-green-600" />
                <Badge variant="outline" className="text-lg">
                  {demands?.length || 0}
                </Badge>
              </div>
              <CardTitle className="text-xl text-green-900">Demand Board</CardTitle>
              <CardDescription>Plan ahead with future supply needs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {profile?.user_type === "restaurant"
                  ? "Post what you need and let farms respond with offers"
                  : "View restaurant demand and propose fulfillment"}
              </p>
              <Button asChild className="w-full">
                <Link href="/demand">
                  View Demand Board
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Repeat className="h-8 w-8 text-blue-600" />
                <Badge variant="outline" className="text-lg">
                  {commitments?.length || 0}
                </Badge>
              </div>
              <CardTitle className="text-xl text-blue-900">Standing Orders</CardTitle>
              <CardDescription>Predictable recurring commitments</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Manage recurring delivery schedules and long-term partnerships
              </p>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/commitments">
                  View Commitments
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Leaf className="h-8 w-8 text-orange-600" />
                <Badge variant="outline" className="text-lg">
                  {surplus?.length || 0}
                </Badge>
              </div>
              <CardTitle className="text-xl text-orange-900">Surplus Marketplace</CardTitle>
              <CardDescription>Reduce waste, save money</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Discounted excess and imperfect products helping reduce food waste
              </p>
              <Button asChild variant="outline" className="w-full bg-transparent border-orange-300">
                <Link href="/surplus">
                  Browse Surplus
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-green-900">Your Organizations</h2>
            <p className="text-sm text-gray-600 mt-1">Manage your farms and restaurants</p>
          </div>
          <Button asChild className="bg-green-700 hover:bg-green-800">
            <Link href="/organizations/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Organization
            </Link>
          </Button>
        </div>

        {organizations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No organizations yet</h3>
              <p className="mb-4 text-center text-sm text-muted-foreground max-w-md">
                Create or join an organization to start planning supply, coordinating logistics, and building
                partnerships.
              </p>
              <Button asChild className="bg-green-700 hover:bg-green-800">
                <Link href="/organizations/create">Create Organization</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {organizations.map((org: any) => (
              <Card key={org.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{org.name}</CardTitle>
                      <Badge variant="outline" className="capitalize mt-1">
                        {org.type}
                      </Badge>
                    </div>
                    {org.type === "farm" ? (
                      <Sprout className="h-6 w-6 text-green-700" />
                    ) : (
                      <Building2 className="h-6 w-6 text-amber-700" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                    {org.description || "No description"}
                  </p>
                  {org.location && (
                    <div className="flex items-center gap-1 mb-3 text-xs text-muted-foreground">
                      <span>📍</span>
                      <span>{org.location}</span>
                    </div>
                  )}
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href={`/organizations/${org.id}`}>Manage Organization</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-12 bg-green-100 border-l-4 border-green-600 p-6 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            How HarvestGrid Works
          </h3>
          <div className="grid md:grid-cols-3 gap-6 mt-4">
            <div>
              <h4 className="font-medium text-green-900 mb-1">1. Post Demand</h4>
              <p className="text-sm text-green-800">Restaurants share what they need with quantity and timeline</p>
            </div>
            <div>
              <h4 className="font-medium text-green-900 mb-1">2. Coordinate Supply</h4>
              <p className="text-sm text-green-800">Farms respond with offers and create standing orders</p>
            </div>
            <div>
              <h4 className="font-medium text-green-900 mb-1">3. Reduce Waste</h4>
              <p className="text-sm text-green-800">Browse surplus marketplace for discounted items</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
