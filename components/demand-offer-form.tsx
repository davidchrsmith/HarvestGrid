"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DemandOfferFormProps {
  demandRequestId: string
  farmOrganizations: Array<{ id: string; name: string }>
  requestedQuantity: number
  requestedUnit: string
}

export function DemandOfferForm({
  demandRequestId,
  farmOrganizations,
  requestedQuantity,
  requestedUnit,
}: DemandOfferFormProps) {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error: insertError } = await supabase.from("demand_offers").insert({
        demand_request_id: demandRequestId,
        farm_organization_id: formData.get("farm_organization_id"),
        offered_quantity: Number.parseFloat(formData.get("offered_quantity") as string),
        offered_price: Number.parseFloat(formData.get("offered_price") as string),
        message: formData.get("message"),
        created_by: user.id,
      })

      if (insertError) throw insertError

      router.refresh()
      e.currentTarget.reset()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">{error}</div>}

      <div className="space-y-2">
        <Label htmlFor="farm_organization_id">Your Farm</Label>
        <Select name="farm_organization_id" required>
          <SelectTrigger>
            <SelectValue placeholder="Select farm" />
          </SelectTrigger>
          <SelectContent>
            {farmOrganizations.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="offered_quantity">Quantity You Can Provide</Label>
          <Input
            id="offered_quantity"
            name="offered_quantity"
            type="number"
            step="0.01"
            min="0"
            placeholder={`Up to ${requestedQuantity} ${requestedUnit}`}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="offered_price">Price per {requestedUnit}</Label>
          <Input
            id="offered_price"
            name="offered_price"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g., 5.50"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message (Optional)</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Share details about your product quality, delivery options, or other relevant information..."
          rows={3}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Submitting Offer..." : "Submit Offer"}
      </Button>
    </form>
  )
}
