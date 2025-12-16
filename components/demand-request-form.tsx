"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

interface DemandRequestFormProps {
  organizations: Array<{ id: string; name: string }>
}

export function DemandRequestForm({ organizations }: DemandRequestFormProps) {
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

      const { error: insertError } = await supabase.from("demand_requests").insert({
        organization_id: formData.get("organization_id"),
        product_name: formData.get("product_name"),
        category: formData.get("category"),
        quantity: Number.parseFloat(formData.get("quantity") as string),
        unit: formData.get("unit"),
        description: formData.get("description"),
        frequency: formData.get("frequency"),
        start_date: formData.get("start_date"),
        end_date: formData.get("end_date") || null,
        preferred_radius_miles: Number.parseInt(formData.get("preferred_radius_miles") as string),
        created_by: user.id,
      })

      if (insertError) throw insertError

      router.push("/demand")
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demand Request Details</CardTitle>
        <CardDescription>Describe what you need and when you need it. Farms will respond with offers.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="organization_id">Restaurant</Label>
            <Select name="organization_id" required>
              <SelectTrigger>
                <SelectValue placeholder="Select restaurant" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product_name">Product Name</Label>
              <Input id="product_name" name="product_name" placeholder="e.g., Organic Tomatoes" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="produce">Produce</SelectItem>
                  <SelectItem value="meat">Meat</SelectItem>
                  <SelectItem value="dairy">Dairy</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" name="quantity" type="number" step="0.01" min="0" placeholder="e.g., 50" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" name="unit" placeholder="e.g., lbs, kg, dozen" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select name="frequency" required>
              <SelectTrigger>
                <SelectValue placeholder="How often do you need this?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one-time">One-time</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="seasonal">Seasonal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input id="start_date" name="start_date" type="date" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date (Optional)</Label>
              <Input id="end_date" name="end_date" type="date" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferred_radius_miles">Preferred Sourcing Radius (miles)</Label>
            <Input
              id="preferred_radius_miles"
              name="preferred_radius_miles"
              type="number"
              min="1"
              defaultValue="50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional Details</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Any specific requirements, quality standards, or additional information..."
              rows={4}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Posting..." : "Post Demand Request"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/demand">Cancel</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
