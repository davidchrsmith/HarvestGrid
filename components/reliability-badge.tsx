import { Badge } from "@/components/ui/badge"
import { Award, TrendingUp, CheckCircle2 } from "lucide-react"

interface ReliabilityBadgeProps {
  reliability: {
    total_commitments: number
    completed_commitments: number
    on_time_deliveries: number
    total_deliveries: number
    active_partnerships: number
  }
  variant?: "inline" | "detailed"
}

export function ReliabilityBadge({ reliability, variant = "inline" }: ReliabilityBadgeProps) {
  const completionRate =
    reliability.total_commitments > 0
      ? Math.round((reliability.completed_commitments / reliability.total_commitments) * 100)
      : 0

  const onTimeRate =
    reliability.total_deliveries > 0
      ? Math.round((reliability.on_time_deliveries / reliability.total_deliveries) * 100)
      : 0

  // Determine trust level
  let trustLevel = "New"
  let trustColor = "bg-gray-100 text-gray-700"
  let trustIcon = <Award className="h-3 w-3" />

  if (reliability.total_commitments >= 10 && completionRate >= 90 && onTimeRate >= 90) {
    trustLevel = "Highly Reliable"
    trustColor = "bg-green-100 text-green-700 border-green-300"
    trustIcon = <CheckCircle2 className="h-3 w-3" />
  } else if (reliability.total_commitments >= 5 && completionRate >= 80) {
    trustLevel = "Reliable"
    trustColor = "bg-blue-100 text-blue-700 border-blue-300"
    trustIcon = <TrendingUp className="h-3 w-3" />
  } else if (reliability.total_commitments >= 1) {
    trustLevel = "Establishing"
    trustColor = "bg-amber-100 text-amber-700 border-amber-300"
    trustIcon = <Award className="h-3 w-3" />
  }

  if (variant === "inline") {
    return (
      <Badge variant="outline" className={`${trustColor} flex items-center gap-1`}>
        {trustIcon}
        {trustLevel}
      </Badge>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={`${trustColor} flex items-center gap-1`}>
          {trustIcon}
          {trustLevel}
        </Badge>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-gray-50 p-2 rounded">
          <p className="text-gray-500">Partnerships</p>
          <p className="font-semibold">{reliability.active_partnerships}</p>
        </div>
        <div className="bg-gray-50 p-2 rounded">
          <p className="text-gray-500">Completion</p>
          <p className="font-semibold">{completionRate}%</p>
        </div>
        <div className="bg-gray-50 p-2 rounded">
          <p className="text-gray-500">On-Time</p>
          <p className="font-semibold">{onTimeRate}%</p>
        </div>
      </div>
    </div>
  )
}
