"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { AffiliateProgram } from "@/types/affiliate"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { joinAffiliateProgram } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { CheckCircle, DollarSign, Users, Award } from "lucide-react"

interface AffiliateJoinProps {
  program: AffiliateProgram | null
}

const joinSchema = z.object({
  payoutMethod: z.string().min(1, "Payout method is required"),
  payoutEmail: z.string().email("Valid email is required"),
})

export function AffiliateJoin({ program }: AffiliateJoinProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof joinSchema>>({
    resolver: zodResolver(joinSchema),
    defaultValues: {
      payoutMethod: "",
      payoutEmail: "",
    },
  })

  const handleSubmit = async (data: z.infer<typeof joinSchema>) => {
    setIsSubmitting(true)
    try {
      await joinAffiliateProgram(data)
      toast({
        title: "Success",
        description: "You have successfully joined the affiliate program!",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join the affiliate program. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!program) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Affiliate Program</CardTitle>
          <CardDescription>Our affiliate program is currently not active. Please check back later.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="text-center">
            <DollarSign className="w-12 h-12 mx-auto text-primary" />
            <CardTitle>Earn Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">
              Earn {program.commissionRate * 100}% commission on all purchases made by your referrals.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Users className="w-12 h-12 mx-auto text-primary" />
            <CardTitle>Refer Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">Share your unique referral link with friends, followers, and audience.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Award className="w-12 h-12 mx-auto text-primary" />
            <CardTitle>Get Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">Request payouts once you reach the minimum threshold of ${program.minPayout}.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Join Our Affiliate Program</CardTitle>
          <CardDescription>
            Fill out the form below to join our affiliate program and start earning commissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="payoutMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payout Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payout method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="stripe">Stripe</SelectItem>
                        <SelectItem value="crypto">Cryptocurrency</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Choose how you want to receive your commissions</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payoutEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payout Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="your-email@example.com" />
                    </FormControl>
                    <FormDescription>Email associated with your payout account</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Joining..." : "Join Affiliate Program"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-sm text-muted-foreground">
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p>Earn {program.commissionRate * 100}% commission on all purchases made by your referrals</p>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p>Referral cookies last for {program.cookieDuration} days</p>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p>Minimum payout amount is ${program.minPayout}</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

