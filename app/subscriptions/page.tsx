"use client"

import { RequireAuth } from "@/components/auth/require-auth"
import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { UserNav } from "@/components/user-nav"
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Subscription {
  id: string
  series: {
    id: string
    title: string
    thumbnail: string
    creator: {
      name: string
    }
  }
  startDate: string
  endDate?: string
  status: "active" | "cancelled" | "expired"
  price: number
  nextBillingDate?: string
}

export default function SubscriptionsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    // In a real app, you would fetch subscriptions from your API
    // Simulate API call with mock data
    setTimeout(() => {
      const mockSubscriptions = [
        {
          id: "sub_1",
          series: {
            id: "series_1",
            title: "Learn React from Scratch",
            thumbnail: "/placeholder.svg?height=120&width=200",
            creator: {
              name: "Code Academy",
            },
          },
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: "active" as const,
          price: 9.99,
          nextBillingDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "sub_2",
          series: {
            id: "series_2",
            title: "Advanced Cooking Techniques",
            thumbnail: "/placeholder.svg?height=120&width=200",
            creator: {
              name: "Cooking Masters",
            },
          },
          startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          status: "active" as const,
          price: 7.99,
          nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "sub_3",
          series: {
            id: "series_3",
            title: "Web Development Masterclass",
            thumbnail: "/placeholder.svg?height=120&width=200",
            creator: {
              name: "Tech Tutorials",
            },
          },
          startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: "cancelled" as const,
          price: 12.99,
        },
      ]

      setSubscriptions(mockSubscriptions)
      setLoading(false)
    }, 1500)
  }, [])

  const handleCancelSubscription = (subscriptionId: string) => {
    setCancellingId(subscriptionId)

    // Simulate API call
    setTimeout(() => {
      setSubscriptions(
        subscriptions.map((sub) =>
          sub.id === subscriptionId
            ? {
                ...sub,
                status: "cancelled" as const,
                endDate: new Date().toISOString(),
              }
            : sub,
        ),
      )

      setCancellingId(null)

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully",
      })
    }, 1500)
  }

  const handleReactivateSubscription = (subscriptionId: string) => {
    setCancellingId(subscriptionId)

    // Simulate API call
    setTimeout(() => {
      setSubscriptions(
        subscriptions.map((sub) =>
          sub.id === subscriptionId
            ? {
                ...sub,
                status: "active" as const,
                endDate: undefined,
                nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              }
            : sub,
        ),
      )

      setCancellingId(null)

      toast({
        title: "Subscription Reactivated",
        description: "Your subscription has been reactivated successfully",
      })
    }, 1500)
  }

  const activeSubscriptions = subscriptions.filter((sub) => sub.status === "active")
  const cancelledSubscriptions = subscriptions.filter((sub) => sub.status === "cancelled" || sub.status === "expired")

  return (
    <RequireAuth>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 border-b bg-background">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-6">
              <MainNav />
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <UserNav />
            </div>
          </div>
        </header>
        <main className="flex-1">
          <div className="container px-4 py-6">
            <div className="mb-6">
              <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to home
              </Link>
            </div>

            <div className="mx-auto max-w-4xl">
              <div className="mb-8">
                <h1 className="text-3xl font-bold">Your Subscriptions</h1>
                <p className="text-muted-foreground">Manage your active and past subscriptions</p>
              </div>

              <Tabs defaultValue="active" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                  <TabsTrigger value="billing">Billing History</TabsTrigger>
                </TabsList>

                <TabsContent value="active">
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
                      ))}
                    </div>
                  ) : activeSubscriptions.length > 0 ? (
                    <div className="space-y-4">
                      {activeSubscriptions.map((subscription) => (
                        <Card key={subscription.id}>
                          <CardContent className="p-6">
                            <div className="flex flex-col gap-6 sm:flex-row">
                              <div className="h-32 w-56 flex-shrink-0 overflow-hidden rounded-md">
                                <img
                                  src={subscription.series.thumbnail || "/placeholder.svg"}
                                  alt={subscription.series.title}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="flex flex-1 flex-col justify-between">
                                <div>
                                  <h3 className="text-xl font-semibold">{subscription.series.title}</h3>
                                  <p className="text-sm text-muted-foreground">By {subscription.series.creator.name}</p>
                                  <div className="mt-2 flex items-center gap-2">
                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-500">
                                      Active
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      ${subscription.price.toFixed(2)}/month
                                    </span>
                                  </div>
                                </div>
                                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="text-sm">
                                    <p>
                                      <span className="font-medium">Started:</span>{" "}
                                      {new Date(subscription.startDate).toLocaleDateString()}
                                    </p>
                                    {subscription.nextBillingDate && (
                                      <p>
                                        <span className="font-medium">Next billing:</span>{" "}
                                        {new Date(subscription.nextBillingDate).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Link href={`/series/${subscription.series.id}`}>
                                      <Button variant="outline" size="sm">
                                        View Series
                                      </Button>
                                    </Link>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleCancelSubscription(subscription.id)}
                                      disabled={cancellingId === subscription.id}
                                    >
                                      {cancellingId === subscription.id ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Cancelling...
                                        </>
                                      ) : (
                                        "Cancel Subscription"
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center p-6">
                        <div className="rounded-full bg-muted p-3">
                          <CreditCard className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-lg font-medium">No Active Subscriptions</h3>
                        <p className="mt-2 text-center text-sm text-muted-foreground">
                          You don't have any active subscriptions at the moment.
                        </p>
                        <Link href="/series" className="mt-4">
                          <Button>Browse Series</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="cancelled">
                  {loading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-[200px] w-full rounded-lg" />
                    </div>
                  ) : cancelledSubscriptions.length > 0 ? (
                    <div className="space-y-4">
                      {cancelledSubscriptions.map((subscription) => (
                        <Card key={subscription.id}>
                          <CardContent className="p-6">
                            <div className="flex flex-col gap-6 sm:flex-row">
                              <div className="h-32 w-56 flex-shrink-0 overflow-hidden rounded-md">
                                <img
                                  src={subscription.series.thumbnail || "/placeholder.svg"}
                                  alt={subscription.series.title}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="flex flex-1 flex-col justify-between">
                                <div>
                                  <h3 className="text-xl font-semibold">{subscription.series.title}</h3>
                                  <p className="text-sm text-muted-foreground">By {subscription.series.creator.name}</p>
                                  <div className="mt-2 flex items-center gap-2">
                                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                                      Cancelled
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      ${subscription.price.toFixed(2)}/month
                                    </span>
                                  </div>
                                </div>
                                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="text-sm">
                                    <p>
                                      <span className="font-medium">Started:</span>{" "}
                                      {new Date(subscription.startDate).toLocaleDateString()}
                                    </p>
                                    {subscription.endDate && (
                                      <p>
                                        <span className="font-medium">Ended:</span>{" "}
                                        {new Date(subscription.endDate).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Link href={`/series/${subscription.series.id}`}>
                                      <Button variant="outline" size="sm">
                                        View Series
                                      </Button>
                                    </Link>
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => handleReactivateSubscription(subscription.id)}
                                      disabled={cancellingId === subscription.id}
                                    >
                                      {cancellingId === subscription.id ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Processing...
                                        </>
                                      ) : (
                                        "Resubscribe"
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center p-6">
                        <div className="rounded-full bg-muted p-3">
                          <CreditCard className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-lg font-medium">No Cancelled Subscriptions</h3>
                        <p className="mt-2 text-center text-sm text-muted-foreground">
                          You don't have any cancelled subscriptions.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="billing">
                  <Card>
                    <CardHeader>
                      <CardTitle>Billing History</CardTitle>
                      <CardDescription>View your past payments and invoices</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-md border">
                          <div className="grid grid-cols-4 gap-4 p-4 font-medium">
                            <div>Date</div>
                            <div>Description</div>
                            <div className="text-right">Amount</div>
                            <div className="text-right">Status</div>
                          </div>
                          <div className="divide-y">
                            <div className="grid grid-cols-4 gap-4 p-4">
                              <div>{new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
                              <div>Learn React from Scratch - Monthly Subscription</div>
                              <div className="text-right">$9.99</div>
                              <div className="text-right text-green-600">Paid</div>
                            </div>
                            <div className="grid grid-cols-4 gap-4 p-4">
                              <div>{new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
                              <div>Advanced Cooking Techniques - Monthly Subscription</div>
                              <div className="text-right">$7.99</div>
                              <div className="text-right text-green-600">Paid</div>
                            </div>
                            <div className="grid grid-cols-4 gap-4 p-4">
                              <div>{new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
                              <div>Learn React from Scratch - Monthly Subscription</div>
                              <div className="text-right">$9.99</div>
                              <div className="text-right text-green-600">Paid</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" className="ml-auto">
                        Download All Invoices
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </RequireAuth>
  )
}

