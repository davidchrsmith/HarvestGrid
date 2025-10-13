import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Building2, Mail, Plus, Sprout } from "lucide-react"

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Sprout className="h-6 w-6 text-green-700" />
            <span className="text-xl font-bold text-green-800">HarvestGrid</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/messages">
                <Mail className="mr-2 h-4 w-4" />
                Messages
              </Link>
            </Button>
            <form action="/auth/signout" method="post">
              <Button variant="ghost" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-green-900">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! You&apos;re registered as a{" "}
            <span className="font-semibold">{profile?.user_type === "farm" ? "Farm Worker" : "Restaurant Worker"}</span>
          </p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-green-900">My Organizations</h2>
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
              <p className="mb-4 text-center text-sm text-muted-foreground">
                Create or join an organization to start posting products or browsing inventory.
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
                      <p className="text-sm text-muted-foreground capitalize">{org.type}</p>
                    </div>
                    {org.type === "farm" ? (
                      <Sprout className="h-5 w-5 text-green-700" />
                    ) : (
                      <Building2 className="h-5 w-5 text-amber-700" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                    {org.description || "No description"}
                  </p>
                  {org.location && <p className="mb-3 text-xs text-muted-foreground">📍 {org.location}</p>}
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href={`/organizations/${org.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
