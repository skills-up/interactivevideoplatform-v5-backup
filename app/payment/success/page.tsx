"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [isVerifying, setIsVerifying] = useState(true)
  const [seriesId, setSeriesId] = useState<string | null>(null)

  useEffect(() => {
    async function verifyPayment() {
      if (!sessionId) {
        setIsVerifying(false)
        return
      }

      try {
        // In a real app, you would verify the payment with your backend
        // const response = await fetch(`/api/payment/verify?session_id=${sessionId}`);
        // const data = await response.json();
        // setSeriesId(data.seriesId);

        // For demo purposes, we'll simulate a successful verification
        setTimeout(() => {
          setSeriesId("1")
          setIsVerifying(false)
        }, 2000)
      } catch (error) {
        console.error("Error verifying payment:", error)
        setIsVerifying(false)
      }
    }

    verifyPayment()
  }, [sessionId])

  if (isVerifying) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
        <div className="w-full max-w-md rounded-lg border bg-background p-8 shadow-lg">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h1 className="text-2xl font-bold">Verifying your payment...</h1>
            <p className="text-center text-muted-foreground">Please wait while we confirm your subscription.</p>
          </div>
        </div>
      </div>
    )
  }

  if (!sessionId || !seriesId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
        <div className="w-full max-w-md rounded-lg border bg-background p-8 shadow-lg">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="rounded-full bg-destructive/10 p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Payment Verification Failed</h1>
            <p className="text-center text-muted-foreground">
              We couldn't verify your payment. Please contact support if you believe this is an error.
            </p>
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md rounded-lg border bg-background p-8 shadow-lg">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-500" />
          </div>
          <h1 className="text-2xl font-bold">Payment Successful!</h1>
          <p className="text-center text-muted-foreground">
            Thank you for your subscription. You now have access to all content in this series.
          </p>
          <div className="flex w-full flex-col gap-2 pt-4">
            <Button asChild>
              <Link href={`/series/${seriesId}`}>Start Watching</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/subscriptions">Manage Subscriptions</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

