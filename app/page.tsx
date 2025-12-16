import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Sprout, ClipboardList, Repeat, Leaf } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 via-amber-50 to-green-50">
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
          <h1 className="mb-6 text-5xl font-bold text-green-900">Plan Supply, Coordinate Logistics, Reduce Waste</h1>
          <p className="mx-auto mb-8 max-w-3xl text-xl text-green-700">
            HarvestGrid helps farms and restaurants plan together, create predictable commitments, and minimize waste —
            not just buy and sell products.
          </p>
          <Button size="lg" asChild className="bg-green-700 text-lg hover:bg-green-800">
            <Link href="/auth/signup">Join HarvestGrid</Link>
          </Button>
        </section>

        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center text-green-900 mb-12">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-md border-t-4 border-green-600">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <ClipboardList className="h-6 w-6 text-green-700" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-green-900">Demand Board</h3>
              <p className="text-gray-600">
                Restaurants post what they need with quantity, frequency, and timeline. Farms respond with offers to
                create planned supply partnerships.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-md border-t-4 border-blue-600">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Repeat className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-blue-900">Standing Orders</h3>
              <p className="text-gray-600">
                Convert accepted offers into recurring commitments. Track delivery schedules and build long-term,
                reliable partnerships between farms and restaurants.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-md border-t-4 border-orange-600">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <Leaf className="h-6 w-6 text-orange-700" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-orange-900">Surplus Marketplace</h3>
              <p className="text-gray-600">
                Find discounted excess and imperfect products. Help farms reduce waste while restaurants save money on
                quality ingredients.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 bg-green-100 rounded-lg my-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-green-900 mb-8">Built for Real Partnerships</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3 text-green-900">For Farms</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>✓ See future demand before planting</li>
                  <li>✓ Create predictable revenue streams</li>
                  <li>✓ Coordinate delivery schedules</li>
                  <li>✓ Move surplus inventory quickly</li>
                  <li>✓ Build trust with reliability indicators</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3 text-amber-900">For Restaurants</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>✓ Plan supply needs in advance</li>
                  <li>✓ Lock in consistent quality and pricing</li>
                  <li>✓ Align delivery with operations</li>
                  <li>✓ Save on surplus marketplace items</li>
                  <li>✓ Work with reliable local partners</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white/80 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 HarvestGrid. Connecting local food systems through planning and coordination.</p>
        </div>
      </footer>
    </div>
  )
}
