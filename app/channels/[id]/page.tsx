"use client"

import { useState, useEffect, use } from "react";
import Link from "next/link"
import { useSession } from "next-auth/react"
import { ArrowLeft, Bell, BellOff, Film, MessageSquare, Play, ThumbsUp, Users, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { VideoCard } from "@/components/video-card"
import { useToast } from "@/components/ui/use-toast"

interface ChannelPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ChannelPage(props: ChannelPageProps) {
  const params = use(props.params);
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [channel, setChannel] = useState<any>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscriberCount, setSubscriberCount] = useState(0)

  useEffect(() => {
    const fetchChannel = async () => {
      setIsLoading(true)

      try {
        // In a real app, you would fetch channel data from your API
        const response = await fetch(`/api/channels/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setChannel(data)
          // TODO: Set isSubscribed based on user's subscription status
          // TODO: Set subscriberCount based on channel's subscriber count
          setIsLoading(false)
          return
        }

        // Simulate API call with mock data
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockChannel = {
          id: params.id,
          name: "Tech Tutorials",
          description:
            "Learn programming, web development, and other tech skills through interactive tutorials and courses.",
          avatar: "/placeholder.svg?height=150&width=150",
          banner: "/placeholder.svg?height=300&width=1200",
          subscriberCount: 50420,
          videoCount: 87,
          joinedDate: "2022-03-15",
          isSubscribed: Math.random() > 0.5, // Randomly determine if user is subscribed
          featuredVideo: {
            id: "featured1",
            title: "Building Interactive UIs with React",
            thumbnail: "/placeholder.svg?height=200&width=350",
            views: 24680,
            date: "2 weeks ago",
            duration: "18:42",
          },
          videos: [
            {
              id: "vid1",
              title: "JavaScript Fundamentals for Beginners",
              thumbnail: "/placeholder.svg?height=200&width=350",
              views: 12500,
              date: "3 weeks ago",
              interactive: true,
            },
            {
              id: "vid2",
              title: "CSS Grid Layout Masterclass",
              thumbnail: "/placeholder.svg?height=200&width=350",
              views: 8750,
              date: "1 month ago",
              interactive: false,
            },
            {
              id: "vid3",
              title: "Building a REST API with Node.js",
              thumbnail: "/placeholder.svg?height=200&width=350",
              views: 15300,
              date: "2 months ago",
              interactive: true,
            },
            {
              id: "vid4",
              title: "React Hooks Explained",
              thumbnail: "/placeholder.svg?height=200&width=350",
              views: 19800,
              date: "3 months ago",
              interactive: true,
            },
            {
              id: "vid5",
              title: "TypeScript for React Developers",
              thumbnail: "/placeholder.svg?height=200&width=350",
              views: 7600,
              date: "4 months ago",
              interactive: false,
            },
            {
              id: "vid6",
              title: "Building a Full-Stack App with Next.js",
              thumbnail: "/placeholder.svg?height=200&width=350",
              views: 22100,
              date: "5 months ago",
              interactive: true,
            },
          ],
          series: [
            {
              id: "series1",
              title: "Web Development Fundamentals",
              thumbnail: "/placeholder.svg?height=200&width=350",
              episodeCount: 12,
              price: 9.99,
            },
            {
              id: "series2",
              title: "Advanced React Patterns",
              thumbnail: "/placeholder.svg?height=200&width=350",
              episodeCount: 8,
              price: 14.99,
            },
            {
              id: "series3",
              title: "Full-Stack JavaScript",
              thumbnail: "/placeholder.svg?height=200&width=350",
              episodeCount: 15,
              price: 19.99,
            },
          ],
          about: `
            Tech Tutorials is a channel dedicated to teaching programming and web development through interactive video tutorials.
            
            Our mission is to make learning technology accessible to everyone, regardless of their background or experience level.
            
            We specialize in:
            - JavaScript and TypeScript
            - React, Vue, and Angular
            - Node.js and Express
            - Database design and implementation
            - Full-stack web development
            
            New videos every Tuesday and Thursday!
          `,
        }

        setChannel(mockChannel)
        setIsSubscribed(mockChannel.isSubscribed)
        setSubscriberCount(mockChannel.subscriberCount)
      } catch (error) {
        console.error("Error fetching channel:", error)
        toast({
          title: "Error",
          description: "Failed to load channel data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchChannel()
  }, [params.id, toast])

  const handleSubscribe = () => {
    if (!session) {
      // Redirect to login if not logged in
      window.location.href = `/auth/login?callbackUrl=/channels/${params.id}`
      return
    }

    // Toggle subscription status
    setIsSubscribed((prev) => !prev)

    // Update subscriber count
    setSubscriberCount((prev) => (isSubscribed ? prev - 1 : prev + 1))

    // Show toast notification
    toast({
      title: isSubscribed ? "Unsubscribed" : "Subscribed",
      description: isSubscribed
        ? `You have unsubscribed from ${channel?.name}`
        : `You are now subscribed to ${channel?.name}`,
    })

    // In a real app, you would call your API to update subscription status
    // const response = await fetch(`/api/channels/${params.id}/subscribe`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ subscribed: !isSubscribed }),
    // })
  }

  if (isLoading) {
    return (
      <div className="container px-4 py-6">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    )
  }

  if (!channel) {
    return (
      <div className="container px-4 py-6">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <h1 className="text-2xl font-bold">Channel Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            The channel you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/" className="mt-6">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1">
      <div className="relative h-48 w-full overflow-hidden bg-muted sm:h-64 md:h-80">
        <img
          src={channel.banner || "/placeholder.svg"}
          alt={`${channel.name} banner`}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="container px-4 py-6">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Avatar className="h-24 w-24 border-4 border-background">
              <AvatarImage src={channel.avatar} alt={channel.name} />
              <AvatarFallback>{channel.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold">{channel.name}</h1>
              <div className="mt-1 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground sm:justify-start">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{subscriberCount.toLocaleString()} subscribers</span>
                </div>
                <div className="flex items-center gap-1">
                  <Video className="h-4 w-4" />
                  <span>{channel.videoCount} videos</span>
                </div>
                <div>
                  <span>
                    Joined{" "}
                    {new Date(channel.joinedDate).toLocaleDateString(undefined, { year: "numeric", month: "long" })}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={isSubscribed ? "outline" : "default"} onClick={handleSubscribe}>
              {isSubscribed ? (
                <>
                  <BellOff className="mr-2 h-4 w-4" />
                  Unsubscribe
                </>
              ) : (
                <>
                  <Bell className="mr-2 h-4 w-4" />
                  Subscribe
                </>
              )}
            </Button>
            <Button variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              Message
            </Button>
          </div>
        </div>

        <Tabs defaultValue="videos" className="mt-8">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="series">Series</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="mt-6">
            {channel.featuredVideo && (
              <div className="mb-8">
                <h2 className="mb-4 text-xl font-semibold">Featured Video</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="relative aspect-video overflow-hidden rounded-lg">
                    <img
                      src={channel.featuredVideo.thumbnail || "/placeholder.svg"}
                      alt={channel.featuredVideo.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                      <Button size="lg" className="rounded-full">
                        <Play className="mr-2 h-5 w-5 fill-white" />
                        Watch Now
                      </Button>
                    </div>
                    <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                      {channel.featuredVideo.duration}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{channel.featuredVideo.title}</h3>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{channel.featuredVideo.views.toLocaleString()} views</span>
                      <span>•</span>
                      <span>{channel.featuredVideo.date}</span>
                    </div>
                    <p className="mt-4">{channel.description}</p>
                    <div className="mt-4">
                      <Link href={`/watch/${channel.featuredVideo.id}`}>
                        <Button>Watch Now</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <h2 className="mb-4 text-xl font-semibold">All Videos</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {channel.videos.map((video: any) => (
                <VideoCard
                  key={video.id}
                  title={video.title}
                  creator={channel.name}
                  thumbnail={video.thumbnail}
                  views={video.views}
                  date={video.date}
                  href={`/watch/${video.id}`}
                  interactive={video.interactive}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="series" className="mt-6">
            <h2 className="mb-4 text-xl font-semibold">Premium Series</h2>
            {channel.series.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
                <p className="text-muted-foreground">No series available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {channel.series.map((series: any) => (
                  <div key={series.id} className="overflow-hidden rounded-lg border">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={series.thumbnail || "/placeholder.svg"}
                        alt={series.title}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold">{series.title}</h3>
                      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <Film className="h-4 w-4" />
                        <span>{series.episodeCount} episodes</span>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="font-medium">${series.price.toFixed(2)}/month</span>
                        <Link href={`/series/${series.id}`}>
                          <Button size="sm">Subscribe</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="md:col-span-2">
                <h2 className="mb-4 text-xl font-semibold">About {channel.name}</h2>
                <div className="whitespace-pre-line rounded-lg border p-4">{channel.about}</div>
              </div>
              <div>
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">Channel Stats</h3>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Joined</span>
                      <span>{new Date(channel.joinedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Subscribers</span>
                      <span>{subscriberCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Videos</span>
                      <span>{channel.videoCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Series</span>
                      <span>{channel.series.length}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border p-4">
                  <h3 className="font-semibold">Contact</h3>
                  <div className="mt-4 space-y-2">
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                    <Button variant="outline" className="w-full">
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Support Creator
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

