import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AboutPage() {
  return (
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
        <div className="container max-w-3xl px-4 py-12">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Link>
          </div>
          <div className="space-y-8">
            <div>
              <h1 className="mb-4 text-4xl font-bold">About InteractiveVid</h1>
              <p className="text-xl text-muted-foreground">
                Revolutionizing the way creators engage with their audience through interactive video content.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Our Mission</h2>
              <p>
                At InteractiveVid, we believe that video content should be more than a passive experience. Our mission
                is to empower creators to build engaging, interactive experiences that captivate audiences and provide
                deeper learning and entertainment value.
              </p>
              <p>
                We're dedicated to providing the tools and platform that make interactive video creation accessible to
                everyone, from individual content creators to large educational institutions and media companies.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Our Story</h2>
              <p>
                InteractiveVid was founded in 2023 by a team of passionate developers and content creators who saw the
                untapped potential of interactive video. What started as a simple tool for adding quiz questions to
                educational videos has evolved into a comprehensive platform for creating rich, interactive video
                experiences.
              </p>
              <p>
                Today, InteractiveVid hosts thousands of interactive videos across various categories, from education
                and training to entertainment and marketing. Our growing community of creators continues to push the
                boundaries of what's possible with interactive video.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Our Technology</h2>
              <p>
                InteractiveVid is built on cutting-edge web technologies that enable seamless integration of interactive
                elements with video content. Our platform supports various types of interactions, including:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong>Quizzes and Assessments:</strong> Test knowledge and understanding with in-video questions.
                </li>
                <li>
                  <strong>Decision Points:</strong> Allow viewers to choose their own path through the content.
                </li>
                <li>
                  <strong>Hotspots:</strong> Add clickable areas within videos for additional information or navigation.
                </li>
                <li>
                  <strong>Polls and Surveys:</strong> Gather feedback and opinions from viewers in real-time.
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Join Us</h2>
              <p>
                Whether you're a creator looking to enhance your content or a viewer seeking more engaging video
                experiences, we invite you to join the InteractiveVid community. Together, we're redefining what video
                content can be.
              </p>
              <div className="flex gap-4">
                <Link href="/auth/register">
                  <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
                    Sign Up
                  </button>
                </Link>
                <Link href="/contact">
                  <button className="rounded-md border border-input bg-background px-4 py-2 hover:bg-accent hover:text-accent-foreground">
                    Contact Us
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

