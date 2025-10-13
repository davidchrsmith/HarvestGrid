import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Building2, MapPin, Package } from "lucide-react"
import Image from "next/image"

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get product details
  const { data: product } = await supabase
    .from("products")
    .select(
      `
      *,
      organizations:organization_id (
        id,
        name,
        type,
        description,
        location
      )
    `,
    )
    .eq("id", id)
    .single()

  if (!product) {
    redirect("/products")
  }

  // Get user's organizations to check if they can message
  const { data: userOrgs } = await supabase
    .from("organization_members")
    .select("organization_id, organizations:organization_id(type)")
    .eq("user_id", user.id)

  const canMessage = userOrgs?.some((org: any) => org.organizations.type === "restaurant")

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 p-6">
      <div className="container mx-auto max-w-4xl">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden">
            {product.image_url ? (
              <div className="relative h-96 w-full">
                <Image src={product.image_url || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="flex h-96 items-center justify-center bg-gradient-to-br from-green-100 to-green-50">
                <Package className="h-32 w-32 text-green-300" />
              </div>
            )}
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl">{product.name}</CardTitle>
                    <CardDescription className="mt-2 text-base">{product.organizations.name}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {product.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="mb-2 flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-green-700">${product.price.toFixed(2)}</span>
                    <span className="text-lg text-muted-foreground">per {product.unit}</span>
                  </div>
                  <p className="text-muted-foreground">
                    Available: {product.quantity} {product.unit}
                  </p>
                </div>

                {product.description && (
                  <div className="mb-6">
                    <h3 className="mb-2 font-semibold">Description</h3>
                    <p className="text-muted-foreground">{product.description}</p>
                  </div>
                )}

                {product.location && (
                  <div className="mb-6">
                    <h3 className="mb-2 font-semibold">Location</h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {product.location}
                    </div>
                  </div>
                )}

                {canMessage && (
                  <Button asChild className="w-full bg-green-700 hover:bg-green-800">
                    <Link href={`/messages/new?product=${product.id}&to=${product.organization_id}`}>Contact Farm</Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  About the Farm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="mb-2 font-semibold">{product.organizations.name}</h3>
                <p className="mb-3 text-sm text-muted-foreground">
                  {product.organizations.description || "No description available"}
                </p>
                {product.organizations.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {product.organizations.location}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
