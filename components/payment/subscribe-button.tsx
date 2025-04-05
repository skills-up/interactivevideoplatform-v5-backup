"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface SubscribeButtonProps {
  seriesId: string
  price: number
  isSubscribed?: boolean
}

export function SubscribeButton({ seriesId, price, isSubscribed = false }: SubscribeButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubscribe = async () => {
    if (!session) {
      router.push(`/auth/login?callbackUrl=/series/${seriesId}`)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/payment/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ seriesId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error) {
      console.error("Error creating checkout session:", error)
      toast({
        title: "Subscription Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleManageSubscription = () => {
    router.push("/subscriptions")
  }

  if (isSubscribed) {
    return (
      <Button onClick={handleManageSubscription} className="w-full">
        Manage Subscription
      </Button>
    )
  }

  return (
    <Button onClick={handleSubscribe} disabled={isLoading} className="w-full">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>Subscribe for ${price.toFixed(2)}/month</>
      )}
    </Button>
  )
}

