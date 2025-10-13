import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Mail, MailOpen, Sprout } from "lucide-react"

export default async function MessagesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user's organizations
  const { data: userOrgs } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)

  const orgIds = userOrgs?.map((o) => o.organization_id) || []

  // Get messages for user's organizations
  const { data: messages } = await supabase
    .from("messages")
    .select(
      `
      *,
      from_org:from_organization_id (
        id,
        name,
        type
      ),
      to_org:to_organization_id (
        id,
        name,
        type
      ),
      products:product_id (
        name
      )
    `,
    )
    .or(`from_organization_id.in.(${orgIds.join(",")}),to_organization_id.in.(${orgIds.join(",")})`)
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
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-green-900">Messages</h1>
          <p className="text-muted-foreground">View and manage your conversations</p>
        </div>

        {!messages || messages.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Mail className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No messages yet</h3>
              <p className="text-center text-sm text-muted-foreground">
                Start a conversation by contacting a farm about their products.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {messages.map((msg: any) => {
              const isSent = orgIds.includes(msg.from_organization_id)
              const otherOrg = isSent ? msg.to_org : msg.from_org

              return (
                <Card key={msg.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <CardTitle className="text-lg">{msg.subject}</CardTitle>
                          {!msg.read && !isSent && <Badge variant="default">New</Badge>}
                        </div>
                        <CardDescription>
                          {isSent ? "To" : "From"}: {otherOrg.name}
                        </CardDescription>
                        {msg.products && <p className="mt-1 text-sm text-muted-foreground">Re: {msg.products.name}</p>}
                      </div>
                      {msg.read || isSent ? (
                        <MailOpen className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Mail className="h-5 w-5 text-green-700" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{msg.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(msg.created_at).toLocaleDateString()} at {new Date(msg.created_at).toLocaleTimeString()}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
