"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface Offer {
  id: string
  offered_quantity: number
  offered_price: number
  message: string | null
  status: string
  created_at: string
  farm: {
    id: string
    name: string
    location: string | null
  }
}

interface DemandOffersListProps {
  offers: Offer[]
  isOwner: boolean
}

export function DemandOffersList({ offers, isOwner }: DemandOffersListProps) {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [updating, setUpdating] = useState<string | null>(null)

  async function handleStatusUpdate(offerId: string, newStatus: string) {
    setUpdating(offerId)
    try {
      const { error } = await supabase.from("demand_offers").update({ status: newStatus }).eq("id", offerId)

      if (error) throw error
      router.refresh()
    } catch (err) {
      console.error("Error updating offer:", err)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Offers Received ({offers.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {offers.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No offers yet</p>
        ) : (
          offers.map((offer) => (
            <div key={offer.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-green-900">{offer.farm.name}</p>
                  {offer.farm.location && <p className="text-sm text-gray-500">{offer.farm.location}</p>}
                </div>
                <Badge variant={offer.status === "accepted" ? "default" : "secondary"} className="capitalize">
                  {offer.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Quantity</p>
                  <p className="font-medium">{offer.offered_quantity}</p>
                </div>
                <div>
                  <p className="text-gray-500">Price</p>
                  <p className="font-medium">${offer.offered_price}</p>
                </div>
              </div>

              {offer.message && <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{offer.message}</p>}

              {isOwner && offer.status === "pending" && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(offer.id, "accepted")}
                    disabled={updating === offer.id}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate(offer.id, "rejected")}
                    disabled={updating === offer.id}
                  >
                    Decline
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
