"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Truck, Calendar } from "lucide-react"

interface LogisticsFormProps {
  organization: {
    id: string
    name: string
    type: string
    delivery_days: string[] | null
    pickup_available: boolean | null
    delivery_notes: string | null
  }
}

const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

export function LogisticsForm({ organization }: LogisticsFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deliveryDays, setDeliveryDays] = useState<string[]>(organization.delivery_days || [])
  const [pickupAvailable, setPickupAvailable] = useState(organization.pickup_available || false)
  const [deliveryNotes, setDeliveryNotes] = useState(organization.delivery_notes || "")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from("organizations")
        .update({
          delivery_days: deliveryDays,
          pickup_available: pickupAvailable,
          delivery_notes: deliveryNotes || null,
        })
        .eq("id", organization.id)

      if (updateError) throw updateError

      router.push(`/organizations/${organization.id}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function toggleDay(day: string) {
    setDeliveryDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-6 w-6" />
          Logistics & Delivery Coordination
        </CardTitle>
        <CardDescription>
          Set up your delivery schedule and pickup options to help partners coordinate logistics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">{error}</div>}

          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-green-600" />
              <Label className="text-base font-semibold">
                {organization.type === "farm" ? "Delivery Days" : "Preferred Receiving Days"}
              </Label>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {organization.type === "farm"
                ? "Select the days when you can deliver products to restaurants"
                : "Select the days when you prefer to receive deliveries"}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day}
                  className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                    deliveryDays.includes(day) ? "bg-green-50 border-green-300" : "hover:bg-gray-50"
                  }`}
                  onClick={() => toggleDay(day)}
                >
                  <Checkbox id={day} checked={deliveryDays.includes(day)} onCheckedChange={() => toggleDay(day)} />
                  <Label htmlFor={day} className="capitalize cursor-pointer">
                    {day}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {organization.type === "farm" && (
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pickup"
                  checked={pickupAvailable}
                  onCheckedChange={(checked) => setPickupAvailable(!!checked)}
                />
                <Label htmlFor="pickup" className="cursor-pointer">
                  Pickup available at farm location
                </Label>
              </div>
              <p className="text-sm text-gray-600 ml-6">Allow restaurants to pick up orders directly from your farm</p>
            </div>
          )}

          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="delivery_notes">Delivery Notes & Instructions</Label>
            <Textarea
              id="delivery_notes"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder={
                organization.type === "farm"
                  ? "Add any special delivery instructions, minimum order requirements, or logistics information..."
                  : "Add any special receiving instructions, loading dock information, or preferred delivery times..."
              }
              rows={5}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : "Save Logistics Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
