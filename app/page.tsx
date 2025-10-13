import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Sprout, Users, Package } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-amber-50">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Sprout className="h-6 w-6 text-green-700" />
            <span className="text-xl font-bold text-green-800">HarvestGrid</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild className="bg-green-700 hover:bg-green-800">
              <Link href="/auth/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="mb-6 text-5xl font-bold text-green-900">Connect Local Farms with Restaurants</h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
            HarvestGrid makes it easy for restaurants to discover and purchase fresh, local produce, meat, and dairy
            directly from nearby farms.
          </p>
          <Button size="lg" asChild className="bg-green-700 text-lg hover:bg-green-800">
            <Link href="/auth/signup">Join HarvestGrid</Link>
          </Button>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Sprout className="h-6 w-6 text-green-700" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">For Farms</h3>
              <p className="text-muted-foreground">
                Post your available inventory with photos, pricing, and location. Connect directly with local
                restaurants looking for fresh products.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Users className="h-6 w-6 text-amber-700" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">For Restaurants</h3>
              <p className="text-muted-foreground">
                Browse local farm inventory, filter by distance, and message farms directly to negotiate pricing and
                arrange deliveries.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Package className="h-6 w-6 text-green-700" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Simple Organization</h3>
              <p className="text-muted-foreground">
                Join or create farm and restaurant organizations. All posts and messages are organized by your business.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white/80 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 HarvestGrid. Connecting local food systems.</p>
        </div>
      </footer>
    </div>
  )
}
