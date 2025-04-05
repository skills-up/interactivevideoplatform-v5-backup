"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { Bell, BellOff, Users, Play, Star, Calendar, CheckCircle } from "lucide-react"

interface ChannelProfileProps {
  creatorId: string
}

export function ChannelProfile({ creatorId }: ChannelProfileProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [channelData, setChannelData] = useState<any>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSubscribing, setIsSubscribing] = useState(false)
  const { data: session } = useSession()
  const { toast } = useToast()

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        setIsLoading(true)

        // Fetch channel data
        const response = await fetch(`/api/creators/${creatorId}`)
        if (!response.ok) throw new Error("Failed to fetch channel data")

        const data = await response.json()
        setChannelData(data)

        // Check if user is subscribed
        if (session?.user) {
          const subResponse = await fetch(`/api/users/${session.user.id}/subscriptions/${creatorId}`)
          setIsSubscribed(subResponse.ok)
        }
      } catch (error) {
        console.error("Error fetching channel data:", error)
        toast({
          title: "Error",
          description: "Failed to load channel data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchChannelData()
  }, [creatorId, session])

  const handleSubscribe = async () => {
    if (!session?.user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to this channel",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubscribing(true)

      const method = isSubscribed ? "DELETE" : "POST"
      const response = await fetch(`/api/users/${session.user.id}/subscriptions/${creatorId}`, {
        method,
      })

      if (!response.ok) throw new Error("Failed to update subscription")

      setIsSubscribed(!isSubscribed)

      toast({
        title: isSubscribed ? "Unsubscribed" : "Subscribed",
        description: isSubscribed
          ? "You have unsubscribed from this channel"
          : "You are now subscribed to this channel",
      })

      // Update subscriber count
      if (channelData) {
        setChannelData({
          ...channelData,
          subscriberCount: isSubscribed ? channelData.subscriberCount - 1 : channelData.subscriberCount + 1,
        })
      }
    } catch (error) {
      console.error("Error updating subscription:", error)
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive",
      })
    } finally {
      setIsSubscribing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>
        <Skeleton className="h-[200px] w-full" />
      </div>
    )
  }

  if (!channelData) {
    return (
      <Card>
        <CardContent className="text-center py-6">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Channel Not Found</h3>
          <p className="text-muted-foreground mt-1">The creator channel you're looking for doesn't exist</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        {/* Channel banner */}
        <div className="h-40 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 overflow-hidden">
          {channelData.bannerUrl && (
            <img
              src={channelData.bannerUrl || "/placeholder.svg"}
              alt={`${channelData.name} banner`}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Channel info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end -mt-16 md:-mt-12 px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <Avatar className="h-24 w-24 border-4 border-background">
              <AvatarImage src={channelData.avatarUrl} />
              <AvatarFallback>{channelData.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="mt-2 md:mt-0">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold">{channelData.name}</h1>
                {channelData.verified && <CheckCircle className="h-5 w-5 ml-2 text-blue-500" />}
              </div>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Users className="h-4 w-4 mr-1" />
                <span>{channelData.subscriberCount} subscribers</span>
                <span className="mx-2">•</span>
                <Play className="h-4 w-4 mr-1" />
                <span>{channelData.videoCount} videos</span>
                {channelData.joinDate && (
                  <>
                    <span className="mx-2">•</span>
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Joined {new Date(channelData.joinDate).toLocaleDateString()}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 md:mt-0">
            <Button
              onClick={handleSubscribe}
              disabled={isSubscribing}
              variant={isSubscribed ? "outline" : "default"}
              className="w-full md:w-auto"
            >
              {isSubscribed ? (
                <>
                  <BellOff className="h-4 w-4 mr-2" />
                  Unsubscribe
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Subscribe
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-medium">About</h2>
              <p className="text-muted-foreground mt-1">{channelData.description || "No description provided."}</p>
            </div>

            {channelData.tags && channelData.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium">Tags</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {channelData.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold">{channelData.totalViews}</div>
                <p className="text-xs text-muted-foreground">Total Views</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{channelData.avgRating.toFixed(1)}</div>
                <div className="flex items-center justify-center">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <p className="text-xs text-muted-foreground ml-1">Rating</p>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{channelData.contentHours}</div>
                <p className="text-xs text-muted-foreground">Hours of Content</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="videos">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="series">Series</TabsTrigger>
          <TabsTrigger value="about">Community</TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="space-y-4 mt-6">
          {/* Videos grid would go here */}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {channelData.videos &&
              channelData.videos.map((video: any) => (
                <Card key={video.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    {video.thumbnailUrl && (
                      <img
                        src={video.thumbnailUrl || "/placeholder.svg"}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1 rounded">
                      {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, "0")}
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium line-clamp-2">{video.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {video.viewCount} views • {new Date(video.publishedAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="series" className="space-y-4 mt-6">
          {/* Series grid would go here */}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {channelData.series &&
              channelData.series.map((series: any) => (
                <Card key={series.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{series.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{series.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      {series.videoCount} videos • {series.totalDuration} min
                    </p>
                    {series.isPaid && <Badge className="mt-2">${series.price.toFixed(2)}</Badge>}
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="about" className="space-y-4 mt-6">
          {/* Community content would go here */}
          <Card>
            <CardHeader>
              <CardTitle>Community</CardTitle>
              <CardDescription>Updates and posts from {channelData.name}</CardDescription>
            </CardHeader>
            <CardContent>
              {channelData.communityPosts && channelData.communityPosts.length > 0 ? (
                <div className="space-y-4">
                  {channelData.communityPosts.map((post: any) => (
                    <div key={post.id} className="p-4 border rounded-lg">
                      <div className="flex items-center mb-2">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={channelData.avatarUrl} />
                          <AvatarFallback>{channelData.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{channelData.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p>{post.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No community posts yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

