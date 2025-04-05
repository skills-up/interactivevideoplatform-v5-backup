"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import type { EarningsPeriod } from "@/types/payout"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { ChevronRight, CheckCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface EarningsHistoryProps {
  periods: EarningsPeriod[]
  onPeriodsChange: (periods: EarningsPeriod[]) => void
}

export function EarningsHistory({ periods, onPeriodsChange }: EarningsHistoryProps) {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})
  const router = useRouter()

  const handleViewDetails = (periodId: string) => {
    router.push(`/creator/earnings/${periodId}`)
  }

  const handleFinalize = async (periodId: string) => {
    setIsLoading((prev) => ({ ...prev, [periodId]: true }))

    try {
      const response = await fetch(`/api/creator/earnings/${periodId}/finalize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to finalize earnings period")
      }

      // Update the period status in the local state
      const updatedPeriods = periods.map((period) =>
        period.id === periodId ? { ...period, status: "finalized", finalizedAt: new Date() } : period,
      )

      onPeriodsChange(updatedPeriods)

      toast({
        title: "Earnings Finalized",
        description: "Your earnings period has been finalized successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, [periodId]: false }))
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Earnings History</h2>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Subscriptions</TableHead>
              <TableHead>Other</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {periods.map((period) => (
              <TableRow key={period.id}>
                <TableCell>
                  {formatDate(period.startDate)} - {formatDate(period.endDate)}
                </TableCell>
                <TableCell>{formatCurrency(period.viewsAmount)}</TableCell>
                <TableCell>{formatCurrency(period.subscriptionsAmount)}</TableCell>
                <TableCell>{formatCurrency(period.otherAmount)}</TableCell>
                <TableCell className="font-medium">{formatCurrency(period.totalAmount)}</TableCell>
                <TableCell>
                  <StatusBadge status={period.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {period.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFinalize(period.id)}
                        disabled={isLoading[period.id]}
                      >
                        {isLoading[period.id] ? (
                          <span className="flex items-center">
                            <span className="animate-spin mr-1">⟳</span> Processing
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1" /> Finalize
                          </span>
                        )}
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(period.id)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {periods.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No earnings periods found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  let variant: "default" | "secondary" | "outline" = "default"

  switch (status) {
    case "pending":
      variant = "secondary"
      break
    case "finalized":
      variant = "default"
      break
  }

  return <Badge variant={variant}>{status}</Badge>
}

