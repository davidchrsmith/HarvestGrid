"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Clock } from "lucide-react"
import { useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Delivery {
  id: string
  scheduled_date: string
  completed_date: string | null
  quantity_delivered: number | null
  status: string
  notes: string | null
}

interface CommitmentDeliveriesProps {
  deliveries: Delivery[]
  commitmentId: string
}

export function CommitmentDeliveries({ deliveries, commitmentId }: CommitmentDeliveriesProps) {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [updating, setUpdating] = useState<string | null>(null)

  async function handleMarkComplete(deliveryId: string, quantity: number) {
    setUpdating(deliveryId)
    try {
      const { error } = await supabase
        .from("commitment_deliveries")
        .update({
          status: "completed",
          completed_date: new Date().toISOString().split("T")[0],
          quantity_delivered: quantity,
        })
        .eq("id", deliveryId)

      if (error) throw error
      router.refresh()
    } catch (err) {
      console.error("Error updating delivery:", err)
    } finally {
      setUpdating(null)
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case "missed":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "cancelled":
        return <XCircle className="h-4 w-4 text-gray-600" />
      default:
        return <Clock className="h-4 w-4 text-amber-600" />
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "completed":
        return "default"
      case "missed":
        return "destructive"
      case "cancelled":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Schedule</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {deliveries.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No deliveries scheduled yet</p>
        ) : (
          deliveries.map((delivery) => (
            <div key={delivery.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(delivery.status)}
                  <div>
                    <p className="font-medium text-sm">{new Date(delivery.scheduled_date).toLocaleDateString()}</p>
                    {delivery.completed_date && (
                      <p className="text-xs text-gray-500">
                        Completed {new Date(delivery.completed_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant={getStatusColor(delivery.status) as any} className="capitalize text-xs">
                  {delivery.status}
                </Badge>
              </div>

              {delivery.quantity_delivered && (
                <p className="text-xs text-gray-600">Delivered: {delivery.quantity_delivered} units</p>
              )}

              {delivery.notes && <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">{delivery.notes}</p>}

              {delivery.status === "scheduled" && (
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => handleMarkComplete(delivery.id, 0)}
                  disabled={updating === delivery.id}
                >
                  Mark Complete
                </Button>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
