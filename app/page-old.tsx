import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getPublicVideos } from "@/lib/videos"
import { VideoCard } from "@/components/video/video-card"
import { ArrowRight, Play, Zap, Users, BarChart } from "lucide-react"

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  const { videos } = await getPublicVideos(6)

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Create Interactive Videos That Engage Your Audience
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Add quizzes, polls, hotspots, and more to your videos. Boost engagement, gather feedback, and improve
                  learning outcomes.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                {session?.user ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="gap-1.5">
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth/register">
                    <Button size="lg" className="gap-1.5">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
                <Link href="/videos">
                  <Button size="lg" variant="outline" className="gap-1.5">
                    Browse Videos
                    <Play className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[500px] aspect-video rounded-xl overflow-hidden shadow-xl">
                <img
                  src="/placeholder.svg?height=500&width=800"
                  alt="Interactive Video Platform"
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 text-white border-white hover:bg-white/20 hover:text-white"
                  >
                    <Play className="h-5 w-5" />
                    Watch Demo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Powerful Interactive Features
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Everything you need to create engaging interactive videos
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="p-2 bg-primary/10 rounded-full">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Interactive Elements</h3>
              <p className="text-sm text-muted-foreground text-center">
                Add quizzes, polls, hotspots, branching scenarios, and more to your videos.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Audience Engagement</h3>
              <p className="text-sm text-muted-foreground text-center">
                Boost engagement and retention with interactive content that viewers love.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="p-2 bg-primary/10 rounded-full">
                <BarChart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Detailed Analytics</h3>
              <p className="text-sm text-muted-foreground text-center">
                Track viewer engagement, quiz results, and interaction performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Videos Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Featured Videos</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Explore interactive videos created by our community
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-12">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <Link href="/videos">
              <Button variant="outline" className="gap-1.5">
                View All Videos
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Create Interactive Videos?
              </h2>
              <p className="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of creators who are engaging their audiences with interactive content
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              {session?.user ? (
                <Link href="/dashboard/videos/create">
                  <Button size="lg" variant="secondary" className="gap-1.5">
                    Create a Video
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/register">
                  <Button size="lg" variant="secondary" className="gap-1.5">
                    Sign Up Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              <Link href="/pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-1.5 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                >
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

