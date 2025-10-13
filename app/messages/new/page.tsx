"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewMessagePage() {
  const searchParams = useSearchParams()
  const productId = searchParams.get("product")
  const toOrgId = searchParams.get("to")

  const [fromOrgId, setFromOrgId] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [userOrgs, setUserOrgs] = useState<any[]>([])
  const [product, setProduct] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Get user's restaurant organizations
        const { data: orgs } = await supabase
          .from("organization_members")
          .select(
            `
            organization_id,
            organizations:organization_id (
              id,
              name,
              type
            )
          `,
          )
          .eq("user_id", user.id)

        const restaurantOrgs = orgs?.filter((o: any) => o.organizations.type === "restaurant") || []
        setUserOrgs(restaurantOrgs)

        if (restaurantOrgs.length === 1) {
          setFromOrgId(restaurantOrgs[0].organization_id)
        }

        // Load product if specified
        if (productId) {
          const { data: prod } = await supabase
            .from("products")
            .select(
              `
              *,
              organizations:organization_id (
                name
              )
            `,
            )
            .eq("id", productId)
            .single()

          if (prod) {
            setProduct(prod)
            setSubject(`Inquiry about ${prod.name}`)
          }
        }
      }
    }

    loadData()
  }, [productId])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")
      if (!fromOrgId) throw new Error("Please select your organization")

      const { error: messageError } = await supabase.from("messages").insert({
        from_organization_id: fromOrgId,
        to_organization_id: toOrgId,
        product_id: productId || null,
        subject,
        message,
        sender_id: user.id,
      })

      if (messageError) throw messageError

      router.push("/messages")
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
          <Link href="/messages">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Messages
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Send Message</CardTitle>
            <CardDescription>Contact a farm about their products</CardDescription>
          </CardHeader>
          <CardContent>
            {product && (
              <div className="mb-6 rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Regarding product:</p>
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-muted-foreground">from {product.organizations.name}</p>
              </div>
            )}

            <form onSubmit={handleSend}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="from-org">From (Your Organization)</Label>
                  <Select value={fromOrgId} onValueChange={setFromOrgId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your restaurant" />
                    </SelectTrigger>
                    <SelectContent>
                      {userOrgs.map((org: any) => (
                        <SelectItem key={org.organization_id} value={org.organization_id}>
                          {org.organizations.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {userOrgs.length === 0 && (
                    <p className="text-sm text-amber-600">
                      You need to create or join a restaurant organization first.
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="What would you like to discuss?"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Write your message here..."
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                  />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button
                  type="submit"
                  className="w-full bg-green-700 hover:bg-green-800"
                  disabled={isLoading || userOrgs.length === 0}
                >
                  {isLoading ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
