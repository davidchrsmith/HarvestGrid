import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, MapPin, TrendingDown, Leaf } from "lucide-react"

export default async function SurplusPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Get surplus products
  const { data: surplusProducts } = await supabase
    .from("products")
    .select(`
      *,
      organization:organizations(id, name, type, location)
    `)
    .eq("is_surplus", true)
    .eq("available", true)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Leaf className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-orange-900">Surplus Marketplace</h1>
              <p className="text-lg text-orange-700">Reduce waste, save money on excess and imperfect produce</p>
            </div>
          </div>
          <div className="bg-orange-100 border-l-4 border-orange-500 p-4 rounded">
            <p className="text-sm text-orange-900">
              These items are available at discounted prices due to excess inventory, cosmetic imperfections, or
              time-sensitive availability. Quality is still excellent - just helping farms reduce waste!
            </p>
          </div>
        </div>

        {surplusProducts && surplusProducts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {surplusProducts.map((product: any) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow border-orange-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-orange-900">{product.name}</CardTitle>
                      <CardDescription className="mt-1">
                        <span className="font-medium">{product.organization.name}</span>
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="capitalize bg-orange-100 text-orange-900">
                      {product.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {product.image_url && (
                    <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100">
                      <ImageIcon
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize bg-orange-50 border-orange-300 text-orange-900">
                      {product.surplus_reason || "surplus"}
                    </Badge>
                    {product.discount_percentage && (
                      <Badge className="bg-green-600">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        {product.discount_percentage}% off
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-orange-900">${product.price}</span>
                    <span className="text-sm text-gray-600">per {product.unit}</span>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p className="font-medium">
                      {product.quantity} {product.unit} available
                    </p>
                  </div>

                  {product.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{product.location}</span>
                    </div>
                  )}

                  {product.description && <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>}
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full bg-orange-600 hover:bg-orange-700">
                    <Link href={`/products/${product.id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12 border-orange-200">
            <CardContent>
              <Leaf className="h-16 w-16 mx-auto text-orange-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Surplus Items Available</h3>
              <p className="text-gray-600">Check back later for discounted surplus produce and products</p>
            </CardContent>
          </Card>
        )}

        <div className="mt-8">
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
