"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, Medal, Award, Users } from "lucide-react"
import { useSession } from "next-auth/react"

interface LeaderboardEntry {
  userId: string
  username: string
  score: number
  rank: number
  completedInteractions: number
  totalInteractions: number
  avatarUrl?: string
  badges?: string[]
}

interface LeaderboardProps {
  videoId: string
}

export function Leaderboard({ videoId }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<"all" | "week" | "month">("all")
  const { data: session } = useSession()

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/videos/${videoId}/leaderboard?timeframe=${timeframe}`)

        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard")
        }

        const data = await response.json()
        setLeaderboard(data.leaderboard)
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [videoId, timeframe])

  // Get rank icon based on position
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Medal className="h-5 w-5 text-amber-700" />
      default:
        return <span className="w-5 text-center font-medium">{rank}</span>
    }
  }

  // Get user's entry from leaderboard
  const userEntry = session?.user ? leaderboard.find((entry) => entry.userId === session.user.id) : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-primary" />
          Leaderboard
        </CardTitle>
        <CardDescription>Top performers for this interactive video</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as "all" | "week" | "month")}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Time</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-6">
            <Users className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No entries yet</p>
            <p className="text-xs text-muted-foreground mt-1">Be the first to complete interactions and earn points!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              {leaderboard.slice(0, 10).map((entry) => (
                <div
                  key={entry.userId}
                  className={`flex items-center p-2 rounded-md ${session?.user?.id === entry.userId ? "bg-muted" : ""}`}
                >
                  <div className="flex items-center justify-center w-8 mr-3">{getRankIcon(entry.rank)}</div>
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src={entry.avatarUrl} />
                    <AvatarFallback>{entry.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {entry.username}
                      {session?.user?.id === entry.userId && (
                        <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Completed {entry.completedInteractions}/{entry.totalInteractions} interactions
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="font-bold text-primary">{entry.score}</span>
                    <span className="text-xs ml-1">pts</span>
                  </div>
                </div>
              ))}
            </div>

            {userEntry && userEntry.rank > 10 && (
              <div className="pt-2 mt-2 border-t">
                <div className="flex items-center p-2 rounded-md bg-muted">
                  <div className="flex items-center justify-center w-8 mr-3">
                    <span className="text-sm font-medium">{userEntry.rank}</span>
                  </div>
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src={userEntry.avatarUrl} />
                    <AvatarFallback>{userEntry.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {userEntry.username}
                      <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Completed {userEntry.completedInteractions}/{userEntry.totalInteractions} interactions
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="font-bold text-primary">{userEntry.score}</span>
                    <span className="text-xs ml-1">pts</span>
                  </div>
                </div>
              </div>
            )}

            {leaderboard.some((entry) => entry.badges && entry.badges.length > 0) && (
              <div className="pt-2 mt-2 border-t">
                <h4 className="text-sm font-medium mb-2">Top Achievers</h4>
                <div className="flex flex-wrap gap-2">
                  {leaderboard
                    .filter((entry) => entry.badges && entry.badges.length > 0)
                    .slice(0, 5)
                    .map((entry) => (
                      <div key={`badge-${entry.userId}`} className="flex items-center">
                        <Avatar className="h-6 w-6 mr-1">
                          <AvatarImage src={entry.avatarUrl} />
                          <AvatarFallback>{entry.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex items-center">
                          {entry.badges?.slice(0, 3).map((badge, i) => (
                            <Badge key={i} variant="outline" className="text-xs mr-1">
                              <Award className="h-3 w-3 mr-1" />
                              {badge}
                            </Badge>
                          ))}
                          {(entry.badges?.length || 0) > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{(entry.badges?.length || 0) - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

