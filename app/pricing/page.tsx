import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  return (
    <div className="container py-10">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple, transparent pricing</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Choose the plan that's right for you and start creating interactive videos today.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-3">
        {/* Free Plan */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl">Free</CardTitle>
            <div className="mt-4 flex items-baseline text-5xl font-extrabold">
              $0
              <span className="ml-1 text-xl font-medium text-muted-foreground">/month</span>
            </div>
            <CardDescription className="mt-4">Perfect for getting started with interactive videos</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                <span>5 videos per month</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                <span>Basic interactions (quizzes, polls)</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                <span>720p video quality</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                <span>Basic analytics</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                <span>Community support</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/register">Get Started</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className="flex flex-col relative border-primary">
          <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-full">
            Popular
          </div>
          <CardHeader>
            <CardTitle className="text-xl">Pro</CardTitle>
            <div className="mt-4 flex items-baseline text-5xl font-extrabold">
              $29
              <span className="ml-1 text-xl font-medium text-muted-foreground">/month</span>
            </div>
            <CardDescription className="mt-4">For professionals and content creators</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                <span>Unlimited videos</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                <span>All interaction types</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                <span>1080p video quality</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                <span>Advanced analytics</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                <span>Custom branding</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                <span>Priority support</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                <span>AI interaction generation</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/register?plan=pro">Get Started</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Enterprise Plan */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl">Enterprise</CardTitle>
            <div className="mt-4 flex items-baseline text-5xl font-extrabold">
              $99
              <span className="ml-1 text-xl font-medium text-muted-foreground">/month</span>
            </div>
            <CardDescription className="mt-4">For organizations and teams</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                <span>Everything in Pro</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                <span>Team collaboration</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                <span>4K video quality</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                <span>Advanced security</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                <span>SSO integration</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                <span>Dedicated account manager</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                <span>Custom integrations</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/contact?subject=Enterprise">Contact Sales</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-16 mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
        <div className="mt-8 grid gap-6 text-left">
          <div>
            <h3 className="font-medium">Can I upgrade or downgrade my plan?</h3>
            <p className="mt-1 text-muted-foreground">
              Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing
              cycle.
            </p>
          </div>
          <div>
            <h3 className="font-medium">Do you offer a free trial?</h3>
            <p className="mt-1 text-muted-foreground">
              Yes, all paid plans come with a 14-day free trial. No credit card required.
            </p>
          </div>
          <div>
            <h3 className="font-medium">What payment methods do you accept?</h3>
            <p className="mt-1 text-muted-foreground">
              We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.
            </p>
          </div>
          <div>
            <h3 className="font-medium">Can I cancel my subscription?</h3>
            <p className="mt-1 text-muted-foreground">
              Yes, you can cancel your subscription at any time from your account settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

