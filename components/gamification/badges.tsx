"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Award, Lock, CheckCircle, Trophy, Star, Zap, Brain, Target, Clock } from "lucide-react"
import { useSession } from "next-auth/react"

interface BadgeData {
  id: string
  name: string
  description: string
  icon: string
  category: "achievement" | "skill" | "participation"
  unlocked: boolean
  progress?: number
  maxProgress?: number
  unlockedAt?: string
}

interface BadgesProps {
  videoId?: string // Optional - if provided, shows only badges for this video
}

export function Badges({ videoId }: BadgesProps) {
  const [badges, setBadges] = useState<BadgeData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all")
  const { data: session } = useSession()

  useEffect(() => {
    const fetchBadges = async () => {
      if (!session?.user) return

      try {
        setIsLoading(true)
        const url = videoId ? `/api/badges?videoId=${videoId}` : `/api/badges`

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error("Failed to fetch badges")
        }

        const data = await response.json()
        setBadges(data.badges)
      } catch (error) {
        console.error("Error fetching badges:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBadges()
  }, [videoId, session])

  // Get icon component based on icon name
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "award":
        return <Award className="h-5 w-5" />
      case "trophy":
        return <Trophy className="h-5 w-5" />
      case "star":
        return <Star className="h-5 w-5" />
      case "zap":
        return <Zap className="h-5 w-5" />
      case "brain":
        return <Brain className="h-5 w-5" />
      case "target":
        return <Target className="h-5 w-5" />
      case "clock":
        return <Clock className="h-5 w-5" />
      default:
        return <Award className="h-5 w-5" />
    }
  }

  // Filter badges based on selected filter
  const filteredBadges = badges.filter((badge) => {
    if (filter === "all") return true
    if (filter === "unlocked") return badge.unlocked
    if (filter === "locked") return !badge.unlocked
    return true
  })

  // Group badges by category
  const groupedBadges = filteredBadges.reduce(
    (acc, badge) => {
      if (!acc[badge.category]) {
        acc[badge.category] = []
      }
      acc[badge.category].push(badge)
      return acc
    },
    {} as Record<string, BadgeData[]>,
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <Card>
        <CardContent className="text-center py-6">
          <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Sign in to view badges</h3>
          <p className="text-muted-foreground mt-1">Create an account or sign in to track your achievements</p>
        </CardContent>
      </Card>
    )
  }

  if (badges.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-6">
          <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No badges available</h3>
          <p className="text-muted-foreground mt-1">Complete interactions to earn badges and achievements</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Badges & Achievements</h2>
        <div className="flex items-center">
          <Tabs value={filter} onValueChange={(value) => setFilter(value as "all" | "unlocked" | "locked")}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
              <TabsTrigger value="locked">Locked</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedBadges).map(([category, categoryBadges]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-lg font-medium capitalize">{category} Badges</h3>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {categoryBadges.map((badge) => (
                <Card key={badge.id} className={badge.unlocked ? "border-primary/50" : "opacity-75"}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          badge.unlocked ? "bg-primary/10" : "bg-muted"
                        }`}
                      >
                        {getIconComponent(badge.icon)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <h4 className="font-medium">{badge.name}</h4>
                          {badge.unlocked && <CheckCircle className="h-4 w-4 ml-1 text-green-500" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{badge.description}</p>
                        {badge.progress !== undefined && badge.maxProgress && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>
                                {badge.progress} / {badge.maxProgress}
                              </span>
                              <span>{Math.round((badge.progress / badge.maxProgress) * 100)}%</span>
                            </div>
                            <Progress value={(badge.progress / badge.maxProgress) * 100} />
                          </div>
                        )}
                        {badge.unlocked && badge.unlockedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Unlocked on {new Date(badge.unlockedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div>
          <p className="text-sm font-medium">
            {badges.filter((b) => b.unlocked).length} of {badges.length} badges unlocked
          </p>
          <p className="text-xs text-muted-foreground">Keep interacting with videos to unlock more badges!</p>
        </div>
        <Badge variant="outline" className="text-xs">
          <Trophy className="h-3 w-3 mr-1" />
          Level {Math.floor(badges.filter((b) => b.unlocked).length / 3) + 1}
        </Badge>
      </div>
    </div>
  )
}

