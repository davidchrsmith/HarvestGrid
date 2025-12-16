"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter, useParams } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, Leaf } from "lucide-react"
import Link from "next/link"

export default function CreateProductPage() {
  const params = useParams()
  const organizationId = params.id as string
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<"produce" | "meat" | "dairy" | "other">("produce")
  const [price, setPrice] = useState("")
  const [quantity, setQuantity] = useState("")
  const [unit, setUnit] = useState("")
  const [location, setLocation] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isSurplus, setIsSurplus] = useState(false)
  const [surplusReason, setSurplusReason] = useState<"excess" | "imperfect" | "urgent" | null>(null)
  const [discountPercentage, setDiscountPercentage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const { error: productError } = await supabase.from("products").insert({
        organization_id: organizationId,
        name,
        description,
        category,
        price: Number.parseFloat(price),
        quantity: Number.parseFloat(quantity),
        unit,
        location,
        image_url: imageUrl || null,
        is_surplus: isSurplus,
        surplus_reason: isSurplus ? surplusReason : null,
        discount_percentage: isSurplus && discountPercentage ? Number.parseInt(discountPercentage) : null,
        created_by: user.id,
      })

      if (productError) throw productError

      router.push(`/organizations/${organizationId}`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 p-6">
      <div className="container mx-auto max-w-2xl">
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/organizations/${organizationId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Organization
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create Product Listing</CardTitle>
            <CardDescription>Add a new product to your farm&apos;s inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    placeholder="Fresh Tomatoes"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={(value: any) => setCategory(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="produce">Produce</SelectItem>
                      <SelectItem value="meat">Meat</SelectItem>
                      <SelectItem value="dairy">Dairy</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your product..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="5.99"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      placeholder="lb, kg, dozen"
                      required
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="quantity">Available Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    placeholder="100"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Farm location or pickup address"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="image">Product Image URL</Label>
                  <Input
                    id="image"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Enter a URL to an image of your product (optional)</p>
                </div>

                <div className="border-t pt-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox id="surplus" checked={isSurplus} onCheckedChange={(checked) => setIsSurplus(!!checked)} />
                    <Label htmlFor="surplus" className="flex items-center gap-2 cursor-pointer">
                      <Leaf className="h-4 w-4 text-orange-600" />
                      <span>Mark as Surplus Item (Waste Reduction)</span>
                    </Label>
                  </div>

                  {isSurplus && (
                    <div className="space-y-4 bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <p className="text-sm text-orange-900">
                        Surplus items help reduce waste and are featured in the dedicated Surplus Marketplace
                      </p>

                      <div className="grid gap-2">
                        <Label htmlFor="surplus_reason">Surplus Reason</Label>
                        <Select
                          value={surplusReason || ""}
                          onValueChange={(value: any) => setSurplusReason(value)}
                          required={isSurplus}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select reason" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="excess">Excess Inventory</SelectItem>
                            <SelectItem value="imperfect">Cosmetically Imperfect</SelectItem>
                            <SelectItem value="urgent">Urgent Sale Needed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="discount">Discount Percentage (Optional)</Label>
                        <Input
                          id="discount"
                          type="number"
                          min="0"
                          max="100"
                          placeholder="e.g., 20"
                          value={discountPercentage}
                          onChange={(e) => setDiscountPercentage(e.target.value)}
                        />
                        <p className="text-xs text-orange-700">Offering a discount helps move surplus items faster</p>
                      </div>
                    </div>
                  )}
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button type="submit" className="w-full bg-green-700 hover:bg-green-800" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Product Listing"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
