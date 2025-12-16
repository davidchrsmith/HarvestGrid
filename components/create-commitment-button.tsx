"use client"

import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Repeat } from "lucide-react"

interface CreateCommitmentButtonProps {
  demandRequest: any
  offer: any
  restaurantOrgId: string
  farmOrgId: string
}

export function CreateCommitmentButton({
  demandRequest,
  offer,
  restaurantOrgId,
  farmOrgId,
}: CreateCommitmentButtonProps) {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [creating, setCreating] = useState(false)

  async function handleCreateCommitment() {
    setCreating(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase.from("commitments").insert({
        demand_request_id: demandRequest.id,
        demand_offer_id: offer.id,
        restaurant_organization_id: restaurantOrgId,
        farm_organization_id: farmOrgId,
        product_name: demandRequest.product_name,
        quantity: offer.offered_quantity,
        unit: demandRequest.unit,
        price: offer.offered_price,
        frequency: demandRequest.frequency,
        start_date: demandRequest.start_date,
        end_date: demandRequest.end_date,
        next_delivery_date: demandRequest.start_date,
        created_by: user.id,
      })

      if (error) throw error

      router.push("/commitments")
      router.refresh()
    } catch (err: any) {
      console.error("Error creating commitment:", err)
      alert(err.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <Button onClick={handleCreateCommitment} disabled={creating} className="w-full">
      <Repeat className="h-4 w-4 mr-2" />
      {creating ? "Creating..." : "Create Standing Order"}
    </Button>
  )
}
