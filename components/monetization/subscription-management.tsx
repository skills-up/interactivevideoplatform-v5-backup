"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { CreditCard, Check, Clock, Calendar, AlertCircle, Loader2, DollarSign, Users, Star } from "lucide-react"

interface SubscriptionManagementProps {
  userId: string
}

export function SubscriptionManagement({ userId }: SubscriptionManagementProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [activeSubscriptions, setActiveSubscriptions] = useState<any[]>([])
  const [availablePlans, setAvailablePlans] = useState<any[]>([])
  const [paymentHistory, setPaymentHistory] = useState<any[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const { data: session } = useSession()
  const { toast } = useToast()

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!session?.user) return

      try {
        setIsLoading(true)

        // Fetch active subscriptions
        const subsResponse = await fetch(`/api/users/${userId}/subscriptions`)
        if (!subsResponse.ok) throw new Error("Failed to fetch subscriptions")
        const subsData = await subsResponse.json()
        setActiveSubscriptions(subsData.subscriptions)

        // Fetch available plans
        const plansResponse = await fetch(`/api/subscription-plans`)
        if (!plansResponse.ok) throw new Error("Failed to fetch plans")
        const plansData = await plansResponse.json()
        setAvailablePlans(plansData.plans)

        // Fetch payment history
        const historyResponse = await fetch(`/api/users/${userId}/payment-history`)
        if (!historyResponse.ok) throw new Error("Failed to fetch payment history")
        const historyData = await historyResponse.json()
        setPaymentHistory(historyData.payments)
      } catch (error) {
        console.error("Error fetching subscription data:", error)
        toast({
          title: "Error",
          description: "Failed to load subscription data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscriptionData()
  }, [userId, session])

  const handleSubscribe = async (planId: string) => {
    if (!session?.user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe",
        variant: "destructive",
      })
      return
    }

    try {
      setIsProcessing(true)

      // Create checkout session
      const response = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          userId: session.user.id,
        }),
      })

      if (!response.ok) throw new Error("Failed to create checkout session")

      const { url } = await response.json()

      // Redirect to checkout
      window.location.href = url
    } catch (error) {
      console.error("Error creating subscription:", error)
      toast({
        title: "Error",
        description: "Failed to process subscription",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (
      !confirm(
        "Are you sure you want to cancel this subscription? You'll lose access at the end of your billing period.",
      )
    ) {
      return
    }

    try {
      setIsProcessing(true)

      const response = await fetch(`/api/subscriptions/${subscriptionId}/cancel`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to cancel subscription")

      // Update the subscription status in the UI
      setActiveSubscriptions(
        activeSubscriptions.map((sub) =>
          sub.id === subscriptionId ? { ...sub, status: "canceling", cancelAtPeriodEnd: true } : sub,
        ),
      )

      toast({
        title: "Subscription Canceled",
        description: "Your subscription will end at the current billing period",
      })
    } catch (error) {
      console.error("Error canceling subscription:", error)
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <Card>
        <CardContent className="text-center py-6">
          <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Sign in to manage subscriptions</h3>
          <p className="text-muted-foreground mt-1">
            Create an account or sign in to view and manage your subscriptions
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Subscription Management</h2>

      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Subscriptions</TabsTrigger>
          <TabsTrigger value="available">Available Plans</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-6">
          {activeSubscriptions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-6">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Active Subscriptions</h3>
                <p className="text-muted-foreground mt-1">You don't have any active subscriptions at the moment</p>
                <Button className="mt-4" onClick={() => document.querySelector('[data-value="available"]')?.click()}>
                  View Available Plans
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activeSubscriptions.map((subscription) => (
                <Card key={subscription.id} className={subscription.status === "active" ? "border-primary" : ""}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{subscription.planName}</CardTitle>
                        <CardDescription>{subscription.description}</CardDescription>
                      </div>
                      <Badge variant={subscription.status === "active" ? "default" : "outline"}>
                        {subscription.status === "active" && !subscription.cancelAtPeriodEnd && "Active"}
                        {subscription.status === "active" && subscription.cancelAtPeriodEnd && "Canceling"}
                        {subscription.status === "past_due" && "Past Due"}
                        {subscription.status === "canceled" && "Canceled"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price</span>
                        <span className="font-medium">
                          ${subscription.price.toFixed(2)}/{subscription.interval}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Billing Period</span>
                        <span className="font-medium">
                          {new Date(subscription.currentPeriodStart).toLocaleDateString()} -{" "}
                          {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Next Billing</span>
                        <span className="font-medium">
                          {subscription.cancelAtPeriodEnd ? "Subscription will end on " : ""}
                          {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment Method</span>
                        <span className="font-medium">
                          {subscription.paymentMethod || "Credit Card"} •••• {subscription.last4 || "1234"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {subscription.status === "active" && !subscription.cancelAtPeriodEnd && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleCancelSubscription(subscription.id)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Cancel Subscription"
                        )}
                      </Button>
                    )}
                    {subscription.status === "active" && subscription.cancelAtPeriodEnd && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={async () => {
                          try {
                            setIsProcessing(true)

                            const response = await fetch(`/api/subscriptions/${subscription.id}/reactivate`, {
                              method: "POST",
                            })

                            if (!response.ok) throw new Error("Failed to reactivate subscription")

                            setActiveSubscriptions(
                              activeSubscriptions.map((sub) =>
                                sub.id === subscription.id ? { ...sub, cancelAtPeriodEnd: false } : sub,
                              ),
                            )

                            toast({
                              title: "Subscription Reactivated",
                              description: "Your subscription will continue",
                            })
                          } catch (error) {
                            console.error("Error reactivating subscription:", error)
                            toast({
                              title: "Error",
                              description: "Failed to reactivate subscription",
                              variant: "destructive",
                            })
                          } finally {
                            setIsProcessing(false)
                          }
                        }}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Resume Subscription"
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-3">
            {availablePlans.map((plan) => (
              <Card key={plan.id} className={plan.featured ? "border-primary" : ""}>
                {plan.featured && (
                  <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">${plan.price.toFixed(2)}</span>
                    <span className="text-muted-foreground">/{plan.interval}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature: string, i: number) => (
                      <li key={i} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.featured ? "default" : "outline"}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={
                      isProcessing ||
                      activeSubscriptions.some(
                        (sub) => sub.planId === plan.id && sub.status === "active" && !sub.cancelAtPeriodEnd,
                      )
                    }
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : activeSubscriptions.some(
                        (sub) => sub.planId === plan.id && sub.status === "active" && !sub.cancelAtPeriodEnd,
                      ) ? (
                      "Currently Subscribed"
                    ) : (
                      "Subscribe Now"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Your recent payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {paymentHistory.length === 0 ? (
                <div className="text-center py-6">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Payment History</h3>
                  <p className="text-muted-foreground mt-1">You haven't made any payments yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentHistory.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{payment.description}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{new Date(payment.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${payment.amount.toFixed(2)}</p>
                        <Badge variant={payment.status === "succeeded" ? "outline" : "destructive"} className="text-xs">
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <h3 className="font-medium">Subscription Benefits</h3>
              <p className="text-sm text-muted-foreground">Subscribe to unlock premium content and features</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-primary mr-2" />
                <div>
                  <p className="text-sm font-medium">Premium Content</p>
                  <p className="text-xs text-muted-foreground">Exclusive videos & series</p>
                </div>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-primary mr-2" />
                <div>
                  <p className="text-sm font-medium">Creator Support</p>
                  <p className="text-xs text-muted-foreground">Help creators make more</p>
                </div>
              </div>
              <div className="flex items-center">
                <Star className="h-5 w-5 text-primary mr-2" />
                <div>
                  <p className="text-sm font-medium">Ad-Free Experience</p>
                  <p className="text-xs text-muted-foreground">No interruptions</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

