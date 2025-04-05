import Link from "next/link"
import { ArrowLeft, Play } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSeriesById, getRelatedSeries } from "@/lib/services/series-service"

interface SeriesPageProps {
  params: {
    id: string
  }
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const seriesId = params.id
  const series = await getSeriesById(seriesId)

  // Fallback if series not found
  if (!series && seriesId !== "1" && seriesId !== "2" && seriesId !== "3") {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <h1 className="text-2xl font-bold">Series Not Found</h1>
          <p className="mt-2 text-muted-foreground">The series you're looking for doesn't exist or has been removed.</p>
          <Link href="/" className="mt-6">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Use real data if available, otherwise fallback to demo data
  const seriesData = series || {
    _id: seriesId,
    title:
      seriesId === "1"
        ? "Learn React from Scratch"
        : seriesId === "2"
          ? "Advanced Cooking Techniques"
          : "Space Exploration Documentary",
    creator: {
      _id: "creator1",
      name: seriesId === "1" ? "Code Academy" : seriesId === "2" ? "Cooking Masters" : "Science Channel",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    description:
      "This comprehensive series takes you through everything you need to know about building modern web applications with React. From the basics to advanced concepts, you'll learn through practical examples and projects.",
    thumbnail: "/placeholder.svg?height=400&width=800",
    price: seriesId === "1" ? 9.99 : seriesId === "2" ? 7.99 : 5.99,
    isActive: true,
    seasons: [
      {
        _id: "season1",
        title: "Season 1: Fundamentals",
        series: seriesId,
        order: 1,
        episodes: [
          {
            _id: "episode1",
            title: "Introduction to React",
            thumbnail: "/placeholder.svg?height=120&width=200",
            duration: 930, // 15:30
            views: 12500,
            createdAt: new Date().toISOString(),
          },
          {
            _id: "episode2",
            title: "Components and Props",
            thumbnail: "/placeholder.svg?height=120&width=200",
            duration: 1365, // 22:45
            views: 10200,
            createdAt: new Date().toISOString(),
          },
          {
            _id: "episode3",
            title: "State and Lifecycle",
            thumbnail: "/placeholder.svg?height=120&width=200",
            duration: 1100, // 18:20
            views: 8700,
            createdAt: new Date().toISOString(),
          },
          {
            _id: "episode4",
            title: "Handling Events",
            thumbnail: "/placeholder.svg?height=120&width=200",
            duration: 855, // 14:15
            views: 7500,
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "season2",
        title: "Season 2: Advanced Concepts",
        series: seriesId,
        order: 2,
        episodes: [
          {
            _id: "episode5",
            title: "Hooks in Depth",
            thumbnail: "/placeholder.svg?height=120&width=200",
            duration: 1510, // 25:10
            views: 6800,
            createdAt: new Date().toISOString(),
          },
          {
            _id: "episode6",
            title: "Context API",
            thumbnail: "/placeholder.svg?height=120&width=200",
            duration: 1185, // 19:45
            views: 5400,
            createdAt: new Date().toISOString(),
          },
          {
            _id: "episode7",
            title: "Performance Optimization",
            thumbnail: "/placeholder.svg?height=120&width=200",
            duration: 1710, // 28:30
            views: 4200,
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  // Get related series by the same creator
  let relatedSeries = []
  if (series) {
    relatedSeries = await getRelatedSeries(series.creator._id, seriesId, 2)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="relative aspect-video overflow-hidden rounded-xl">
            <img
              src={seriesData.thumbnail || "/placeholder.svg"}
              alt={seriesData.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Button size="lg" className="rounded-full">
                <Play className="mr-2 h-5 w-5 fill-white" />
                Watch Trailer
              </Button>
            </div>
          </div>
          <div className="mt-6">
            <h1 className="text-3xl font-bold">{seriesData.title}</h1>
            <div className="mt-2 flex items-center gap-2">
              <div className="font-medium">{seriesData.creator.name}</div>
              <span className="text-muted-foreground">•</span>
              <div className="text-muted-foreground">{seriesData.seasons.length} Seasons</div>
              <span className="text-muted-foreground">•</span>
              <div className="text-muted-foreground">
                {seriesData.seasons.reduce((total, season) => total + season.episodes.length, 0)} Episodes
              </div>
            </div>
            <p className="mt-4 text-muted-foreground">{seriesData.description}</p>
          </div>
          <div className="mt-8">
            <Tabs defaultValue={seriesData.seasons[0]._id}>
              <TabsList className="w-full justify-start">
                {seriesData.seasons.map((season) => (
                  <TabsTrigger key={season._id} value={season._id}>
                    {season.title.split(":")[0]}
                  </TabsTrigger>
                ))}
              </TabsList>
              {seriesData.seasons.map((season) => (
                <TabsContent key={season._id} value={season._id} className="mt-6">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold">{season.title}</h2>
                    <p className="text-sm text-muted-foreground">{season.episodes.length} episodes</p>
                  </div>
                  <div className="space-y-4">
                    {season.episodes.map((episode, index) => {
                      const minutes = Math.floor(episode.duration / 60)
                      const seconds = episode.duration % 60
                      const duration = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`

                      return (
                        <Card key={episode._id}>
                          <CardContent className="p-0">
                            <div className="flex items-center gap-4 p-4">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-medium">
                                {index + 1}
                              </div>
                              <div className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded-md">
                                <img
                                  src={episode.thumbnail || "/placeholder.svg"}
                                  alt={episode.title}
                                  className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                                  <Play className="h-6 w-6 text-white" />
                                </div>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium">{episode.title}</h3>
                                <p className="text-sm text-muted-foreground">{duration}</p>
                              </div>
                              <Link href={`/watch/${episode._id}`}>
                                <Button variant="outline" size="sm">
                                  Watch
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
        <div>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold">${seriesData.price.toFixed(2)}/month</h2>
                <p className="mt-2 text-muted-foreground">Access to all episodes in this series</p>
                <Button className="mt-6 w-full">Subscribe to Series</Button>
                <p className="mt-4 text-xs text-muted-foreground">
                  Cancel anytime. Subscription renews monthly until canceled.
                </p>
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>Full access to all episodes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>HD quality streaming</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>Watch on any device</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>Interactive features</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>New episodes as they release</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="mt-6">
            <h3 className="mb-4 font-semibold">More from {seriesData.creator.name}</h3>
            <div className="space-y-4">
              {relatedSeries && relatedSeries.length > 0
                ? relatedSeries.map((relSeries) => (
                    <Link key={relSeries._id} href={`/series/${relSeries._id}`} className="group block">
                      <div className="flex gap-3">
                        <div className="h-20 w-32 overflow-hidden rounded-md">
                          <img
                            src={relSeries.thumbnail || "/placeholder.svg?height=80&width=128"}
                            alt="Series thumbnail"
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium group-hover:text-primary">{relSeries.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {relSeries.seasons?.reduce((total, season) => total + season.episodes.length, 0) || 0}{" "}
                            episodes
                          </p>
                          <p className="text-sm font-medium">${relSeries.price.toFixed(2)}/month</p>
                        </div>
                      </div>
                    </Link>
                  ))
                : // Fallback to placeholder related series
                  [1, 2].map((id) => (
                    <Link key={id} href={`/series/${id + 5}`} className="group block">
                      <div className="flex gap-3">
                        <div className="h-20 w-32 overflow-hidden rounded-md">
                          <img
                            src="/placeholder.svg?height=80&width=128"
                            alt="Series thumbnail"
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium group-hover:text-primary">
                            {id === 1 ? "Web Development Masterclass" : "Mobile App Development"}
                          </h4>
                          <p className="text-sm text-muted-foreground">{id === 1 ? "8" : "6"} episodes</p>
                          <p className="text-sm font-medium">${id === 1 ? "7.99" : "6.99"}/month</p>
                        </div>
                      </div>
                    </Link>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

