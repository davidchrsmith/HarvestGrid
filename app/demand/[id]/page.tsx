import { createServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, TrendingUp } from "lucide-react"
import { DemandOfferForm } from "@/components/demand-offer-form"
import { DemandOffersList } from "@/components/demand-offers-list"
import { CreateCommitmentButton } from "@/components/create-commitment-button"
import { ReliabilityBadge } from "@/components/reliability-badge"

export default async function DemandDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Get demand request with organization info and reliability
  const { data: demandRequest } = await supabase
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
    .eq("id", params.id)
    .single()

  if (!demandRequest) notFound()

  // Get user's organizations to check permissions
  const { data: userOrgs } = await supabase
    .from("organization_members")
    .select("organization:organizations(id, name, type)")
    .eq("user_id", user.id)

  const isFarmer = userOrgs?.some((org: any) => org.organization?.type === "farm")
  const isRestaurant = userOrgs?.some((org: any) => org.organization?.type === "restaurant")
  const isOwner = userOrgs?.some((org: any) => org.organization?.id === demandRequest.organization_id)

  const farmOrgs =
    userOrgs?.filter((org: any) => org.organization?.type === "farm").map((org: any) => org.organization) || []

  // Get all offers for this demand request with farm reliability
  const { data: offers } = await supabase
    .from("demand_offers")
    .select(`
      *,
      farm:farm_organization_id(
        id, 
        name, 
        location,
        reliability:organization_reliability(*)
      )
    `)
    .eq("demand_request_id", params.id)
    .order("created_at", { ascending: false })

  const acceptedOffers = offers?.filter((o: any) => o.status === "accepted") || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <Button asChild variant="outline" className="mb-4 bg-transparent">
            <Link href="/demand">← Back to Demand Board</Link>
          </Button>
          <h1 className="text-4xl font-bold text-green-900 mb-2">Demand Request Details</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl text-green-900">{demandRequest.product_name}</CardTitle>
                    <CardDescription className="text-base mt-2">
                      Requested by <span className="font-medium">{demandRequest.organization.name}</span>
                    </CardDescription>
                    {demandRequest.organization.reliability && demandRequest.organization.reliability.length > 0 && (
                      <div className="mt-3">
                        <ReliabilityBadge reliability={demandRequest.organization.reliability[0]} variant="detailed" />
                      </div>
                    )}
                  </div>
                  <Badge variant="secondary" className="capitalize text-sm">
                    {demandRequest.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-3 text-gray-700">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Quantity Needed</p>
                      <p className="font-semibold">
                        {demandRequest.quantity} {demandRequest.unit}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Frequency</p>
                      <p className="font-semibold capitalize">{demandRequest.frequency}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-gray-700">
                  <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Timeline</p>
                    <p className="font-medium">
                      From {new Date(demandRequest.start_date).toLocaleDateString()}
                      {demandRequest.end_date && ` to ${new Date(demandRequest.end_date).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-gray-700">
                  <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Sourcing Radius</p>
                    <p className="font-medium">
                      Within {demandRequest.preferred_radius_miles} miles of{" "}
                      {demandRequest.organization.location || "restaurant"}
                    </p>
                  </div>
                </div>

                {demandRequest.description && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-2">Additional Details</p>
                    <p className="text-gray-700">{demandRequest.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {isOwner && acceptedOffers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Convert to Standing Order</CardTitle>
                  <CardDescription>
                    Create a recurring commitment from an accepted offer for predictable supply
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {acceptedOffers.map((offer: any) => (
                    <div key={offer.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-green-900">{offer.farm.name}</p>
                          <p className="text-sm text-gray-600">
                            {offer.offered_quantity} units @ ${offer.offered_price}
                          </p>
                          {offer.farm.reliability && offer.farm.reliability.length > 0 && (
                            <div className="mt-2">
                              <ReliabilityBadge reliability={offer.farm.reliability[0]} />
                            </div>
                          )}
                        </div>
                        <Badge>Accepted</Badge>
                      </div>
                      <CreateCommitmentButton
                        demandRequest={demandRequest}
                        offer={offer}
                        restaurantOrgId={demandRequest.organization_id}
                        farmOrgId={offer.farm_organization_id}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {isFarmer && farmOrgs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Respond to This Demand</CardTitle>
                  <CardDescription>Propose a fulfillment offer for this restaurant's needs</CardDescription>
                </CardHeader>
                <CardContent>
                  <DemandOfferForm
                    demandRequestId={params.id}
                    farmOrganizations={farmOrgs}
                    requestedQuantity={demandRequest.quantity}
                    requestedUnit={demandRequest.unit}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <DemandOffersList offers={offers || []} isOwner={isOwner} />
          </div>
        </div>
      </div>
    </div>
  )
}
