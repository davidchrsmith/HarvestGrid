"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateOrganizationPage() {
  const [name, setName] = useState("")
  const [type, setType] = useState<"farm" | "restaurant">("farm")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userType, setUserType] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function getUserProfile() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single()

        if (profile) {
          setUserType(profile.user_type)
          setType(profile.user_type as "farm" | "restaurant")
        }
      }
    }

    getUserProfile()
  }, [])

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

      // Create organization
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .insert({
          name,
          type,
          description,
          location,
          created_by: user.id,
        })
        .select()
        .single()

      if (orgError) throw orgError

      // Add creator as owner
      const { error: memberError } = await supabase.from("organization_members").insert({
        organization_id: org.id,
        user_id: user.id,
        role: "owner",
      })

      if (memberError) throw memberError

      router.push("/dashboard")
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
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create Organization</CardTitle>
            <CardDescription>Create a new farm or restaurant organization</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">Organization Name</Label>
                  <Input
                    id="name"
                    placeholder="Green Valley Farm"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="grid gap-3">
                  <Label>Organization Type</Label>
                  <RadioGroup value={type} onValueChange={(value) => setType(value as "farm" | "restaurant")}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="farm" id="farm-type" />
                      <Label htmlFor="farm-type" className="font-normal">
                        Farm
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="restaurant" id="restaurant-type" />
                      <Label htmlFor="restaurant-type" className="font-normal">
                        Restaurant
                      </Label>
                    </div>
                  </RadioGroup>
                  {userType && type !== userType && (
                    <p className="text-sm text-amber-600">
                      Note: You&apos;re creating a {type} organization, but you&apos;re registered as a {userType}{" "}
                      worker.
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell others about your organization..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="123 Farm Road, City, State"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Enter your full address for location-based features</p>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button type="submit" className="w-full bg-green-700 hover:bg-green-800" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Organization"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
