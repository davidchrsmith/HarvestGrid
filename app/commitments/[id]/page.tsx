import { createServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, TrendingUp, Repeat, MapPin, FileText } from "lucide-react"
import { CommitmentDeliveries } from "@/components/commitment-deliveries"
import { CommitmentActions } from "@/components/commitment-actions"

export default async function CommitmentDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Get commitment with organization info
  const { data: commitment } = await supabase
    .from("commitments")
    .select(`
      *,
      restaurant:restaurant_organization_id(id, name, location),
      farm:farm_organization_id(id, name, location)
    `)
    .eq("id", params.id)
    .single()

  if (!commitment) notFound()

  // Check if user is a member of either organization
  const { data: userOrgs } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)

  const orgIds = userOrgs?.map((org) => org.organization_id) || []
  const isMember =
    orgIds.includes(commitment.restaurant_organization_id) || orgIds.includes(commitment.farm_organization_id)

  if (!isMember) redirect("/commitments")

  // Get all deliveries for this commitment
  const { data: deliveries } = await supabase
    .from("commitment_deliveries")
    .select("*")
    .eq("commitment_id", params.id)
    .order("scheduled_date", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <Button asChild variant="outline" className="mb-4 bg-transparent">
            <Link href="/commitments">← Back to Commitments</Link>
          </Button>
          <h1 className="text-4xl font-bold text-green-900 mb-2">Commitment Details</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl text-green-900">{commitment.product_name}</CardTitle>
                    <CardDescription className="text-base mt-2">
                      Standing order between {commitment.restaurant.name} and {commitment.farm.name}
                    </CardDescription>
                  </div>
                  <Badge variant={commitment.status === "active" ? "default" : "secondary"} className="capitalize">
                    {commitment.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-3 text-gray-700">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Quantity & Price</p>
                      <p className="font-semibold">
                        {commitment.quantity} {commitment.unit} @ ${commitment.price}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Repeat className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Frequency</p>
                      <p className="font-semibold capitalize">{commitment.frequency}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-gray-700">
                  <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Commitment Period</p>
                    <p className="font-medium">
                      {new Date(commitment.start_date).toLocaleDateString()} -{" "}
                      {commitment.end_date ? new Date(commitment.end_date).toLocaleDateString() : "Ongoing"}
                    </p>
                  </div>
                </div>

                {commitment.next_delivery_date && (
                  <div className="flex items-start gap-3 text-gray-700 bg-green-50 p-3 rounded-lg">
                    <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Next Scheduled Delivery</p>
                      <p className="font-semibold text-green-900">
                        {new Date(commitment.next_delivery_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
                  <div className="flex items-start gap-3 text-gray-700">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Restaurant</p>
                      <p className="font-medium">{commitment.restaurant.name}</p>
                      {commitment.restaurant.location && <p className="text-sm">{commitment.restaurant.location}</p>}
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-gray-700">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Farm</p>
                      <p className="font-medium">{commitment.farm.name}</p>
                      {commitment.farm.location && <p className="text-sm">{commitment.farm.location}</p>}
                    </div>
                  </div>
                </div>

                {commitment.delivery_notes && (
                  <div className="flex items-start gap-3 text-gray-700 pt-4 border-t">
                    <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Delivery Notes</p>
                      <p className="text-gray-700">{commitment.delivery_notes}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <CommitmentActions
              commitmentId={commitment.id}
              status={commitment.status}
              userOrganizations={orgIds}
              restaurantOrgId={commitment.restaurant_organization_id}
              farmOrgId={commitment.farm_organization_id}
            />
          </div>

          <div className="lg:col-span-1">
            <CommitmentDeliveries deliveries={deliveries || []} commitmentId={commitment.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
