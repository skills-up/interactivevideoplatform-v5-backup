"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { UserSubscription, SubscriptionPlan } from "@/types/subscription"
import { formatDate } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { ExternalLink } from "lucide-react"

interface SubscriptionDetailsProps {
  subscription: UserSubscription | null
  invoices: any[]
  plans: SubscriptionPlan[]
}

export function SubscriptionDetails({ subscription, invoices, plans }: SubscriptionDetailsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState("")
  const router = useRouter()

  const currentPlan = subscription ? plans.find((plan) => plan.id === subscription.planId) : null

  const handleManageSubscription = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/subscriptions/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/account/subscription`,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Error creating portal session:", error)
      toast({
        title: "Error",
        description: "Failed to access subscription management. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/subscriptions/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to cancel subscription")
      }

      toast({
        title: "Subscription Canceled",
        description: "Your subscription has been canceled and will end at the current billing period.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error canceling subscription:", error)
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReactivateSubscription = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/subscriptions/reactivate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to reactivate subscription")
      }

      toast({
        title: "Subscription Reactivated",
        description: "Your subscription has been reactivated successfully.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error reactivating subscription:", error)
      toast({
        title: "Error",
        description: "Failed to reactivate subscription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpgradeSubscription = async () => {
    if (!selectedPlanId) {
      toast({
        title: "Error",
        description: "Please select a plan to upgrade to.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/subscriptions/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: selectedPlanId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update subscription")
      }

      toast({
        title: "Subscription Updated",
        description: "Your subscription has been updated successfully.",
      })

      setIsUpgradeDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating subscription:", error)
      toast({
        title: "Error",
        description: "Failed to update subscription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
          <CardDescription>You don't have an active subscription.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => router.push("/pricing")}>View Pricing Plans</Button>
        </CardFooter>
      </Card>
    )
  }

  // Filter plans for upgrade options (only show plans with higher price)
  const upgradePlans = plans.filter((plan) => {
    if (!currentPlan) return true
    return plan.price > currentPlan.price && plan.interval === currentPlan.interval
  })

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Subscription Details</CardTitle>
          <CardDescription>Manage your subscription and billing details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Plan</h3>
              <p className="text-lg font-semibold">{currentPlan?.name || "Unknown Plan"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <div className="flex items-center mt-1">
                <StatusBadge status={subscription.status} />
                {subscription.cancelAtPeriodEnd && (
                  <span className="ml-2 text-amber-500 text-sm">
                    (Cancels on {formatDate(subscription.currentPeriodEnd)})
                  </span>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Price</h3>
              <p className="text-lg font-semibold">
                ${currentPlan?.price || 0}/{currentPlan?.interval || "month"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Renewal Date</h3>
              <p className="text-lg font-semibold">{formatDate(subscription.currentPeriodEnd)}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleManageSubscription} disabled={isLoading}>
            {isLoading ? "Loading..." : "Manage Payment Methods"}
          </Button>

          <div className="space-x-2">
            {subscription.cancelAtPeriodEnd ? (
              <Button onClick={handleReactivateSubscription} disabled={isLoading}>
                {isLoading ? "Loading..." : "Reactivate Subscription"}
              </Button>
            ) : (
              <>
                <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" disabled={upgradePlans.length === 0 || isLoading}>
                      {isLoading ? "Loading..." : "Upgrade Plan"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upgrade Your Plan</DialogTitle>
                      <DialogDescription>
                        Select a new plan to upgrade to. Your billing will be prorated for the remainder of your current
                        billing period.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                      <Select onValueChange={setSelectedPlanId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {upgradePlans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.name} - ${plan.price}/{plan.interval}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <DialogFooter>
                      <Button onClick={handleUpgradeSubscription} disabled={!selectedPlanId || isLoading}>
                        {isLoading ? "Processing..." : "Upgrade"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isLoading}>
                      {isLoading ? "Loading..." : "Cancel Subscription"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Your subscription will be canceled at the end of the current billing period. You will still have
                        access to premium features until {formatDate(subscription.currentPeriodEnd)}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancelSubscription}>Cancel Subscription</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View your past invoices and payment history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                    <TableCell>
                      ${invoice.amount.toFixed(2)} {invoice.currency}
                    </TableCell>
                    <TableCell>
                      <InvoiceStatusBadge status={invoice.status} />
                    </TableCell>
                    <TableCell>
                      {invoice.invoiceUrl && (
                        <Button variant="ghost" size="sm" onClick={() => window.open(invoice.invoiceUrl, "_blank")}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {invoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      No invoices found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default"

  switch (status) {
    case "active":
      variant = "default"
      break
    case "trialing":
      variant = "secondary"
      break
    case "past_due":
      variant = "destructive"
      break
    case "canceled":
      variant = "outline"
      break
    case "incomplete":
      variant = "outline"
      break
  }

  return <Badge variant={variant}>{status.replace("_", " ")}</Badge>
}

function InvoiceStatusBadge({ status }: { status: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default"

  switch (status) {
    case "paid":
      variant = "default"
      break
    case "open":
      variant = "secondary"
      break
    case "void":
      variant = "outline"
      break
    case "uncollectible":
      variant = "destructive"
      break
  }

  return <Badge variant={variant}>{status}</Badge>
}

