"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, CreditCard, Loader2, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { RequireAuth } from "@/components/auth/require-auth"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"

export default function UpgradePage() {
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handleUpgrade = async (plan: string) => {
    setIsProcessing(true)
    setSelectedPlan(plan)

    try {
      // In a real app, you would call your API to handle the upgrade
      // await fetch('/api/user/upgrade', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ plan }),
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Upgrade Successful",
        description: `You've been upgraded to ${plan} successfully!`,
      })

      // In a real app, you would redirect to a success page or refresh the user session
      window.location.href = "/dashboard"
    } catch (error) {
      toast({
        title: "Upgrade Failed",
        description: "There was an error processing your upgrade. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

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

            <div className="mx-auto max-w-5xl">
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold">Upgrade Your Account</h1>
                <p className="mt-2 text-muted-foreground">
                  Choose the plan that's right for you and start creating amazing interactive videos
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {/* Viewer Plan */}
                <Card className="relative overflow-hidden">
                  <div className="absolute right-0 top-0 bg-muted px-3 py-1 text-xs font-medium">Current Plan</div>
                  <CardHeader>
                    <CardTitle>Viewer</CardTitle>
                    <CardDescription>Basic access to interactive content</CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">Free</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        <span>Watch interactive videos</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        <span>Subscribe to premium series</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        <span>Create playlists</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  </CardFooter>
                </Card>

                {/* Creator Plan */}
                <Card className="relative border-primary">
                  <div className="absolute right-0 top-0 bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Popular
                  </div>
                  <CardHeader>
                    <CardTitle>Creator</CardTitle>
                    <CardDescription>For content creators and educators</CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">$9.99</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        <span>All Viewer features</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        <span>Create interactive videos</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        <span>Create and sell series</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        <span>Basic analytics</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        <span>Live streaming (2 hours/month)</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => handleUpgrade("Creator")}
                      disabled={isProcessing && selectedPlan === "Creator"}
                    >
                      {isProcessing && selectedPlan === "Creator" ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-4 w-4" />
                          Upgrade to Creator
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>

                {/* Pro Plan */}
                <Card>
                  <CardHeader>
                    <CardTitle>Professional</CardTitle>
                    <CardDescription>For professional content creators</CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">$29.99</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        <span>All Creator features</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        <span>Advanced analytics</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        <span>Priority support</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        <span>Custom branding</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        <span>Unlimited live streaming</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        <span>API access</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleUpgrade("Professional")}
                      disabled={isProcessing && selectedPlan === "Professional"}
                    >
                      {isProcessing && selectedPlan === "Professional" ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Upgrade to Pro
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div className="mt-12 rounded-lg border p-6">
                <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="font-medium">Can I change plans later?</h3>
                    <p className="text-sm text-muted-foreground">
                      Yes, you can upgrade or downgrade your plan at any time. Changes will take effect at the start of
                      your next billing cycle.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">How do I get paid for my content?</h3>
                    <p className="text-sm text-muted-foreground">
                      You'll receive 70% of the subscription revenue from your series. Payments are processed monthly
                      via Stripe or PayPal.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Is there a free trial?</h3>
                    <p className="text-sm text-muted-foreground">
                      Yes, both Creator and Professional plans come with a 14-day free trial. You won't be charged until
                      the trial ends.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">What payment methods do you accept?</h3>
                    <p className="text-sm text-muted-foreground">
                      We accept all major credit cards, PayPal, and in select regions, bank transfers and digital
                      wallets.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </RequireAuth>
  )
}

