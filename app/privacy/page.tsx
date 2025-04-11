import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl px-4 py-12">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
      </div>
      <div className="space-y-8">
        <div>
          <h1 className="mb-4 text-4xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: January 1, 2025</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Introduction</h2>
          <p>
            InteractiveVid ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your information when you use our website,
            services, and applications (collectively, the "Service").
          </p>
          <p>
            Please read this Privacy Policy carefully. By accessing or using the Service, you acknowledge that you
            have read, understood, and agree to be bound by this Privacy Policy.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">2. Information We Collect</h2>
          <p>We collect several types of information from and about users of our Service:</p>
          <h3 className="text-xl font-medium mt-4">2.1 Personal Information</h3>
          <p>Personal information is data that can be used to identify you individually, such as:</p>
          <ul className="ml-6 list-disc space-y-2">
            <li>Name</li>
            <li>Email address</li>
            <li>Postal address</li>
            <li>Phone number</li>
            <li>Payment information</li>
            <li>Profile picture</li>
          </ul>

          <h3 className="text-xl font-medium mt-4">2.2 Usage Information</h3>
          <p>We also collect information about how you use the Service:</p>
          <ul className="ml-6 list-disc space-y-2">
            <li>Videos watched</li>
            <li>Interactions with interactive elements</li>
            <li>Time spent on different parts of the Service</li>
            <li>Search queries</li>
            <li>Content preferences</li>
          </ul>

          <h3 className="text-xl font-medium mt-4">2.3 Technical Information</h3>
          <p>We collect technical information about your device and internet connection:</p>
          <ul className="ml-6 list-disc space-y-2">
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Device type and operating system</li>
            <li>Referring website</li>
            <li>Time zone setting</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">3. How We Use Your Information</h2>
          <p>We use the information we collect for various purposes, including:</p>
          <ul className="ml-6 list-disc space-y-2">
            <li>Providing, maintaining, and improving the Service</li>
            <li>Processing transactions and managing subscriptions</li>
            <li>Personalizing your experience and delivering content relevant to your interests</li>
            <li>Communicating with you about updates, support, and promotional offers</li>
            <li>Analyzing usage patterns to enhance the Service</li>
            <li>Protecting the security and integrity of the Service</li>
            <li>Complying with legal obligations</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Sharing Your Information</h2>
          <p>We may share your information with:</p>
          <ul className="ml-6 list-disc space-y-2">
            <li>
              <strong>Service Providers:</strong> Third parties that perform services on our behalf, such as payment
              processing, data analysis, and customer service.
            </li>
            <li>
              <strong>Business Partners:</strong> With your consent, we may share your information with business
              partners to offer you certain products, services, or promotions.
            </li>
            <li>
              <strong>Legal Requirements:</strong> When required by law or to protect our rights, property, or
              safety, or the rights, property, or safety of others.
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">5. Your Choices</h2>
          <p>You have several choices regarding the information you provide to us:</p>
          <ul className="ml-6 list-disc space-y-2">
            <li>
              <strong>Account Information:</strong> You can review and update your account information through your
              account settings.
            </li>
            <li>
              <strong>Marketing Communications:</strong> You can opt out of receiving promotional emails by
              following the unsubscribe instructions in those emails.
            </li>
            <li>
              <strong>Cookies:</strong> You can set your browser to refuse all or some browser cookies, or to alert
              you when cookies are being sent.
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">6. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at:</p>
          <p>
            InteractiveVid, Inc.
            <br />
            123 Video Lane
            <br />
            San Francisco, CA 94103
            <br />
            Email: privacy@interactivevid.com
          </p>
        </div>
      </div>
    </div>
  )
}

