import Link from "next/link"
import { ChevronRight, Play, Plus, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { VideoCard } from "@/components/video-card"
import { getFeaturedVideos } from "@/lib/services/video-service"
import { getTrendingSeries } from "@/lib/services/series-service"

export default async function Home() {
  const featuredVideos = await getFeaturedVideos(4)
  const trendingSeries = await getTrendingSeries(3)

  return (
    <div className="flex-1">
      <section className="container px-4 py-8 md:py-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Featured Videos</h2>
          <Link href="/videos" className="flex items-center text-sm text-muted-foreground hover:text-primary">
            View all
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {featuredVideos.length > 0 ? (
            featuredVideos.map((video) => (
              <VideoCard
                key={video._id}
                title={video.title}
                creator={video.creator.name}
                thumbnail={video.thumbnail}
                views={video.views}
                date={new Date(video.createdAt).toLocaleDateString()}
                href={`/watch/${video._id}`}
                interactive={video.interactiveElements.length > 0}
              />
            ))
          ) : (
            // Fallback to placeholder data if no videos are available
            <>
              <VideoCard
                title="Introduction to Interactive Videos"
                creator="Tech Tutorials"
                thumbnail="/placeholder.svg?height=200&width=350"
                views={1240}
                date="2 days ago"
                href="/watch/1"
                interactive={true}
              />
              <VideoCard
                title="Choose Your Adventure: Space Exploration"
                creator="Science Channel"
                thumbnail="/placeholder.svg?height=200&width=350"
                views={8750}
                date="1 week ago"
                href="/watch/2"
                interactive={true}
              />
              <VideoCard
                title="Interactive Cooking Tutorial: Italian Pasta"
                creator="Cooking Masters"
                thumbnail="/placeholder.svg?height=200&width=350"
                views={3420}
                date="3 days ago"
                href="/watch/3"
                interactive={true}
              />
              <VideoCard
                title="Web Development Masterclass"
                creator="Code Academy"
                thumbnail="/placeholder.svg?height=200&width=350"
                views={5680}
                date="5 days ago"
                href="/watch/4"
                interactive={false}
              />
            </>
          )}
        </div>
      </section>
      <section className="container px-4 py-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Trending Series</h2>
          <Link href="/series" className="flex items-center text-sm text-muted-foreground hover:text-primary">
            View all
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {trendingSeries.length > 0 ? (
            trendingSeries.map((series, index) => (
              <Card key={series._id}>
                <CardContent className="p-0">
                  <div className="relative aspect-video overflow-hidden rounded-t-lg">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <img
                      src={series.thumbnail || "/placeholder.svg?height=200&width=350"}
                      alt="Series thumbnail"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-red-500" />
                      <span className="text-sm font-medium text-white">Trending #{index + 1}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{series.title}</h3>
                    <p className="text-sm text-muted-foreground">{series.creator.name}</p>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{series.seasons?.length || 0} Seasons</span>
                      <span>•</span>
                      <span>
                        {series.seasons?.reduce((total, season) => total + season.episodes.length, 0) || 0} Episodes
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between p-4 pt-0">
                  <span className="text-sm font-medium">${series.price.toFixed(2)}/month</span>
                  <Link href={`/series/${series._id}`}>
                    <Button size="sm" variant="outline">
                      View Series
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))
          ) : (
            // Fallback to placeholder data if no series are available
            <>
              <Card>
                <CardContent className="p-0">
                  <div className="relative aspect-video overflow-hidden rounded-t-lg">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <img
                      src="/placeholder.svg?height=200&width=350"
                      alt="Series thumbnail"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-red-500" />
                      <span className="text-sm font-medium text-white">Trending #1</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">Learn React from Scratch</h3>
                    <p className="text-sm text-muted-foreground">Code Academy</p>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <span>3 Seasons</span>
                      <span>•</span>
                      <span>24 Episodes</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between p-4 pt-0">
                  <span className="text-sm font-medium">$9.99/month</span>
                  <Link href="/series/1">
                    <Button size="sm" variant="outline">
                      View Series
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              <Card>
                <CardContent className="p-0">
                  <div className="relative aspect-video overflow-hidden rounded-t-lg">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <img
                      src="/placeholder.svg?height=200&width=350"
                      alt="Series thumbnail"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-red-500" />
                      <span className="text-sm font-medium text-white">Trending #2</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">Advanced Cooking Techniques</h3>
                    <p className="text-sm text-muted-foreground">Cooking Masters</p>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <span>2 Seasons</span>
                      <span>•</span>
                      <span>16 Episodes</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between p-4 pt-0">
                  <span className="text-sm font-medium">$7.99/month</span>
                  <Link href="/series/2">
                    <Button size="sm" variant="outline">
                      View Series
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              <Card>
                <CardContent className="p-0">
                  <div className="relative aspect-video overflow-hidden rounded-t-lg">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <img
                      src="/placeholder.svg?height=200&width=350"
                      alt="Series thumbnail"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-red-500" />
                      <span className="text-sm font-medium text-white">Trending #3</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">Space Exploration Documentary</h3>
                    <p className="text-sm text-muted-foreground">Science Channel</p>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <span>1 Season</span>
                      <span>•</span>
                      <span>8 Episodes</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between p-4 pt-0">
                  <span className="text-sm font-medium">$5.99/month</span>
                  <Link href="/series/3">
                    <Button size="sm" variant="outline">
                      View Series
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </>
          )}
        </div>
      </section>
      <section className="bg-muted py-12">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">Create Interactive Videos</h2>
            <p className="mt-4 text-muted-foreground">
              Import videos from YouTube, DailyMotion, or any other platform and add interactive elements to engage
              your audience.
            </p>
            <div className="mt-6">
              <Link href="/dashboard/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
