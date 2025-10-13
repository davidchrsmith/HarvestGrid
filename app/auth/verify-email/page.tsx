import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-green-50 to-amber-50 p-6">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Mail className="h-6 w-6 text-green-700" />
            </div>
            <CardTitle className="text-center text-2xl">Check your email</CardTitle>
            <CardDescription className="text-center">We&apos;ve sent you a verification link</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-muted-foreground">
              Please check your email and click the verification link to activate your account. Once verified, you can
              sign in to HarvestGrid.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
