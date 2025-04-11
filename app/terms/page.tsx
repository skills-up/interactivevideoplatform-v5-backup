import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"

export default function TermsPage() {
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
          <h1 className="mb-4 text-4xl font-bold">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: January 1, 2025</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Introduction</h2>
          <p>
            Welcome to InteractiveVid. These Terms of Service ("Terms") govern your access to and use of the
            InteractiveVid website, services, and applications (collectively, the "Service"). By accessing or using
            the Service, you agree to be bound by these Terms. If you do not agree to these Terms, you may not
            access or use the Service.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">2. Definitions</h2>
          <p>
            <strong>"Content"</strong> refers to all videos, interactive elements, text, graphics, images, music,
            software, audio, and other materials you may view on, access through, or contribute to the Service.
          </p>
          <p>
            <strong>"User Content"</strong> refers to Content that users submit, upload, or otherwise make available
            to the Service.
          </p>
          <p>
            <strong>"InteractiveVid Content"</strong> refers to Content that InteractiveVid makes available through
            the Service.
          </p>
          <p>
            <strong>"Collective Content"</strong> refers to User Content and InteractiveVid Content collectively.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">3. Account Registration</h2>
          <p>
            To access certain features of the Service, you must register for an account. When you register, you
            agree to provide accurate, current, and complete information about yourself and to update this
            information to maintain its accuracy. You are responsible for safeguarding your password and for all
            activities that occur under your account.
          </p>
          <p>
            InteractiveVid cannot and will not be liable for any loss or damage arising from your failure to comply
            with the above requirements.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Content and Conduct</h2>
          <p>
            You retain all rights in, and are solely responsible for, the User Content you submit to the Service. By
            submitting User Content to the Service, you grant InteractiveVid a worldwide, non-exclusive,
            royalty-free license to use, reproduce, modify, adapt, publish, translate, distribute, and display such
            content in connection with providing the Service.
          </p>
          <p>You agree not to submit User Content that:</p>
          <ul className="ml-6 list-disc space-y-2">
            <li>Violates any applicable law or regulation</li>
            <li>Infringes any third party's intellectual property rights</li>
            <li>Contains defamatory, obscene, or offensive material</li>
            <li>Contains personal or identifying information about another person without their consent</li>
            <li>
              Promotes discrimination, bigotry, racism, hatred, harassment, or harm against any individual or group
            </li>
            <li>Is false, misleading, or deceptive</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">5. Subscription and Payments</h2>
          <p>
            Some aspects of the Service may be available on a subscription basis. By subscribing to such services,
            you agree to pay the applicable fees. Subscription fees are non-refundable except as required by law or
            as explicitly stated in these Terms.
          </p>
          <p>
            InteractiveVid reserves the right to change subscription fees at any time, with notice provided to
            subscribers before such changes take effect.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">6. Termination</h2>
          <p>
            InteractiveVid may terminate or suspend your access to all or part of the Service, without notice, for
            conduct that InteractiveVid believes violates these Terms or is harmful to other users of the Service,
            InteractiveVid, or third parties, or for any other reason.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">7. Contact Information</h2>
          <p>If you have any questions about these Terms, please contact us at:</p>
          <p>
            InteractiveVid, Inc.
            <br />
            123 Video Lane
            <br />
            San Francisco, CA 94103
            <br />
            Email: legal@interactivevid.com
          </p>
        </div>
      </div>
    </div>
  )
}

