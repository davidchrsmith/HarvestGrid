"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Pause, Play, XCircle } from "lucide-react"

interface CommitmentActionsProps {
  commitmentId: string
  status: string
  userOrganizations: string[]
  restaurantOrgId: string
  farmOrgId: string
}

export function CommitmentActions({
  commitmentId,
  status,
  userOrganizations,
  restaurantOrgId,
  farmOrgId,
}: CommitmentActionsProps) {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [updating, setUpdating] = useState(false)

  const isMember = userOrganizations.includes(restaurantOrgId) || userOrganizations.includes(farmOrgId)

  async function handleStatusChange(newStatus: string) {
    setUpdating(true)
    try {
      const { error } = await supabase.from("commitments").update({ status: newStatus }).eq("id", commitmentId)

      if (error) throw error
      router.refresh()
    } catch (err) {
      console.error("Error updating commitment:", err)
    } finally {
      setUpdating(false)
    }
  }

  if (!isMember) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Commitment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {status === "active" && (
          <>
            <Button
              onClick={() => handleStatusChange("paused")}
              disabled={updating}
              variant="outline"
              className="w-full bg-transparent"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause Commitment
            </Button>
            <Button
              onClick={() => handleStatusChange("cancelled")}
              disabled={updating}
              variant="destructive"
              className="w-full"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Commitment
            </Button>
          </>
        )}
        {status === "paused" && (
          <>
            <Button onClick={() => handleStatusChange("active")} disabled={updating} className="w-full">
              <Play className="h-4 w-4 mr-2" />
              Resume Commitment
            </Button>
            <Button
              onClick={() => handleStatusChange("cancelled")}
              disabled={updating}
              variant="destructive"
              className="w-full"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Commitment
            </Button>
          </>
        )}
        {(status === "completed" || status === "cancelled") && (
          <p className="text-sm text-gray-500 text-center py-4">This commitment has ended</p>
        )}
      </CardContent>
    </Card>
  )
}
