import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { MapPin, Package, Sprout, Leaf, ArrowRight } from "lucide-react"
import Image from "next/image"

export default async function ProductsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: products } = await supabase
    .from("products")
    .select(
      `
      *,
      organizations:organization_id (
        id,
        name,
        type
      )
    `,
    )
    .eq("available", true)
    .eq("is_surplus", false)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Sprout className="h-6 w-6 text-green-700" />
            <span className="text-xl font-bold text-green-800">HarvestGrid</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/surplus">
                <Leaf className="mr-2 h-4 w-4" />
                Surplus
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-green-900">Available Supply</h1>
          <p className="text-lg text-green-700">
            Browse current inventory from local farms — or use the Demand Board to plan future supply
          </p>
        </div>

        <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Looking for something specific?</strong> Post your needs on the{" "}
            <Link href="/demand" className="underline font-medium">
              Demand Board
            </Link>{" "}
            and farms will respond with offers. For discounted surplus items, visit the{" "}
            <Link href="/surplus" className="underline font-medium">
              Surplus Marketplace
            </Link>
            .
          </p>
        </div>

        {!products || products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No products available right now</h3>
              <p className="text-center text-sm text-muted-foreground mb-4">
                Use the Demand Board to plan future supply needs instead
              </p>
              <Button asChild>
                <Link href="/demand">
                  Go to Demand Board
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product: any) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {product.image_url ? (
                  <div className="relative h-48 w-full bg-muted">
                    <Image
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-48 items-center justify-center bg-gradient-to-br from-green-100 to-green-50">
                    <Package className="h-16 w-16 text-green-300" />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription className="mt-1">{product.organizations.name}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {product.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                    {product.description || "No description"}
                  </p>
                  <div className="mb-3 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-green-700">${product.price.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground">per {product.unit}</span>
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Available: {product.quantity} {product.unit}
                  </p>
                  {product.location && (
                    <div className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {product.location}
                    </div>
                  )}
                  <Button asChild className="w-full bg-green-700 hover:bg-green-800">
                    <Link href={`/products/${product.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
