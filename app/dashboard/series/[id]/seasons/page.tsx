"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit, Loader2, Plus, Trash, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { RequireAuth } from "@/components/auth/require-auth"
import { Permission } from "@/lib/auth/permissions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Season {
  _id: string
  title: string
  description?: string
  order: number
  episodes: Episode[]
}

interface Episode {
  _id: string
  title: string
  thumbnail: string
  duration: number
  views: number
}

interface Series {
  _id: string
  title: string
  description: string
  thumbnail: string
}

export default function ManageSeasonsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const seriesId = params.id

  const [isLoading, setIsLoading] = useState(true)
  const [series, setSeries] = useState<Series | null>(null)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [isAddingNewSeason, setIsAddingNewSeason] = useState(false)
  const [newSeasonData, setNewSeasonData] = useState({
    title: "",
    description: "",
  })
  const [editingSeason, setEditingSeason] = useState<Season | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAddingEpisode, setIsAddingEpisode] = useState(false)
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null)
  const [availableVideos, setAvailableVideos] = useState<any[]>([])
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)

  useEffect(() => {
    // In a real app, you would fetch the series and its seasons from your API
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock data
        const mockSeries = {
          _id: seriesId,
          title: "Learn React from Scratch",
          description: "A comprehensive guide to React",
          thumbnail: "/placeholder.svg?height=200&width=350",
        }

        const mockSeasons = [
          {
            _id: "season1",
            title: "Season 1: Fundamentals",
            description: "Learn the basics of React",
            order: 1,
            episodes: [
              {
                _id: "ep1",
                title: "Introduction to React",
                thumbnail: "/placeholder.svg?height=120&width=200",
                duration: 930,
                views: 12500,
              },
              {
                _id: "ep2",
                title: "Components and Props",
                thumbnail: "/placeholder.svg?height=120&width=200",
                duration: 1365,
                views: 10200,
              },
            ],
          },
          {
            _id: "season2",
            title: "Season 2: Advanced Concepts",
            description: "Dive deeper into React",
            order: 2,
            episodes: [
              {
                _id: "ep3",
                title: "Hooks in Depth",
                thumbnail: "/placeholder.svg?height=120&width=200",
                duration: 1510,
                views: 6800,
              },
            ],
          },
        ]

        const mockAvailableVideos = [
          {
            _id: "vid1",
            title: "State and Lifecycle",
            thumbnail: "/placeholder.svg?height=120&width=200",
          },
          {
            _id: "vid2",
            title: "Handling Events",
            thumbnail: "/placeholder.svg?height=120&width=200",
          },
          {
            _id: "vid3",
            title: "Context API",
            thumbnail: "/placeholder.svg?height=120&width=200",
          },
        ]

        setSeries(mockSeries)
        setSeasons(mockSeasons)
        setAvailableVideos(mockAvailableVideos)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load series data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [seriesId, toast])

  const handleNewSeasonChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewSeasonData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditSeasonChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingSeason) return

    const { name, value } = e.target
    setEditingSeason((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleAddSeason = async () => {
    setIsSubmitting(true)

    try {
      // In a real app, you would call your API to create a new season
      // const response = await fetch(`/api/series/${seriesId}/seasons`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     ...newSeasonData,
      //     order: seasons.length + 1,
      //   }),
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Create a new season with mock data
      const newSeason: Season = {
        _id: `season${Date.now()}`,
        title: newSeasonData.title,
        description: newSeasonData.description,
        order: seasons.length + 1,
        episodes: [],
      }

      setSeasons((prev) => [...prev, newSeason])
      setNewSeasonData({ title: "", description: "" })
      setIsAddingNewSeason(false)

      toast({
        title: "Season Created",
        description: "The new season has been created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create new season",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateSeason = async () => {
    if (!editingSeason) return

    setIsSubmitting(true)

    try {
      // In a real app, you would call your API to update the season
      // const response = await fetch(`/api/seasons/${editingSeason._id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     title: editingSeason.title,
      //     description: editingSeason.description,
      //   }),
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update the season in the local state
      setSeasons((prev) => prev.map((season) => (season._id === editingSeason._id ? editingSeason : season)))

      setEditingSeason(null)

      toast({
        title: "Season Updated",
        description: "The season has been updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update season",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteSeason = async (seasonId: string) => {
    try {
      // In a real app, you would call your API to delete the season
      // const response = await fetch(`/api/seasons/${seasonId}`, {
      //   method: 'DELETE',
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Remove the season from the local state
      setSeasons((prev) => prev.filter((season) => season._id !== seasonId))

      toast({
        title: "Season Deleted",
        description: "The season has been deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete season",
        variant: "destructive",
      })
    }
  }

  const handleAddEpisode = async () => {
    if (!selectedSeason || !selectedVideo) return

    setIsSubmitting(true)

    try {
      // In a real app, you would call your API to add the video to the season
      // const response = await fetch(`/api/seasons/${selectedSeason}/episodes`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ videoId: selectedVideo }),
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Find the selected video from available videos
      const video = availableVideos.find((v) => v._id === selectedVideo)

      if (video) {
        // Add the video as an episode to the selected season
        setSeasons((prev) =>
          prev.map((season) => {
            if (season._id === selectedSeason) {
              return {
                ...season,
                episodes: [
                  ...season.episodes,
                  {
                    _id: video._id,
                    title: video.title,
                    thumbnail: video.thumbnail,
                    duration: 1200, // Mock duration
                    views: 0,
                  },
                ],
              }
            }
            return season
          }),
        )

        // Remove the video from available videos
        setAvailableVideos((prev) => prev.filter((v) => v._id !== selectedVideo))
      }

      setSelectedVideo(null)
      setIsAddingEpisode(false)

      toast({
        title: "Episode Added",
        description: "The episode has been added to the season successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add episode to season",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveEpisode = async (seasonId: string, episodeId: string) => {
    try {
      // In a real app, you would call your API to remove the episode from the season
      // const response = await fetch(`/api/seasons/${seasonId}/episodes/${episodeId}`, {
      //   method: 'DELETE',
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Find the episode to remove
      let removedEpisode: Episode | undefined

      // Remove the episode from the season
      setSeasons((prev) =>
        prev.map((season) => {
          if (season._id === seasonId) {
            const episodeToRemove = season.episodes.find((ep) => ep._id === episodeId)
            if (episodeToRemove) {
              removedEpisode = episodeToRemove
            }

            return {
              ...season,
              episodes: season.episodes.filter((ep) => ep._id !== episodeId),
            }
          }
          return season
        }),
      )

      // Add the removed episode back to available videos if it exists
      if (removedEpisode) {
        setAvailableVideos((prev) => [
          ...prev,
          {
            _id: removedEpisode!._id,
            title: removedEpisode!.title,
            thumbnail: removedEpisode!.thumbnail,
          },
        ])
      }

      toast({
        title: "Episode Removed",
        description: "The episode has been removed from the season successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove episode from season",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <RequireAuth permission={Permission.CREATE_SERIES}>
        <div className="flex min-h-screen flex-col">
          <DashboardHeader />
          <div className="container px-4 py-6">
            <div className="flex h-[60vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </div>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth permission={Permission.CREATE_SERIES}>
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <div className="container px-4 py-6">
          <div className="mb-6">
            <Link
              href="/dashboard/series"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to series
            </Link>
          </div>

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">{series?.title}</h1>
              <p className="text-muted-foreground">Manage seasons and episodes</p>
            </div>
            <Button onClick={() => setIsAddingNewSeason(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Season
            </Button>
          </div>

          {seasons.length === 0 ? (
            <div className="flex h-[40vh] items-center justify-center rounded-lg border border-dashed">
              <div className="text-center">
                <h2 className="text-xl font-semibold">No Seasons Yet</h2>
                <p className="text-muted-foreground">Get started by creating your first season</p>
                <Button className="mt-4" onClick={() => setIsAddingNewSeason(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Season
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {seasons.map((season) => (
                <Card key={season._id}>
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                      <CardTitle>{season.title}</CardTitle>
                      <CardDescription>{season.description}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="12" cy="5" r="1" />
                            <circle cx="12" cy="19" r="1" />
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingSeason(season)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Season
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash className="mr-2 h-4 w-4" />
                              Delete Season
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the season and remove all episodes from it. This action
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteSeason(season._id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 flex justify-between">
                      <h3 className="text-lg font-medium">Episodes</h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSeason(season._id)
                          setIsAddingEpisode(true)
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Episode
                      </Button>
                    </div>

                    {season.episodes.length === 0 ? (
                      <div className="flex h-24 items-center justify-center rounded-lg border border-dashed">
                        <p className="text-sm text-muted-foreground">No episodes in this season yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {season.episodes.map((episode, index) => {
                          const minutes = Math.floor(episode.duration / 60)
                          const seconds = episode.duration % 60
                          const duration = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`

                          return (
                            <div key={episode._id} className="flex items-center gap-4 rounded-lg border p-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-medium">
                                {index + 1}
                              </div>
                              <div className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded-md">
                                <img
                                  src={episode.thumbnail || "/placeholder.svg"}
                                  alt={episode.title}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium">{episode.title}</h4>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{duration}</span>
                                  <span>•</span>
                                  <span>{episode.views.toLocaleString()} views</span>
                                </div>
                              </div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Trash className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Episode</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove this episode from the season? The video will still
                                      be available in your library.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleRemoveEpisode(season._id, episode._id)}>
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Add New Season Dialog */}
          <Dialog open={isAddingNewSeason} onOpenChange={setIsAddingNewSeason}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Season</DialogTitle>
                <DialogDescription>
                  Create a new season to organize your videos into a structured series.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Season Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={newSeasonData.title}
                    onChange={handleNewSeasonChange}
                    placeholder="e.g., Season 1: Fundamentals"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newSeasonData.description}
                    onChange={handleNewSeasonChange}
                    placeholder="Describe what this season covers"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingNewSeason(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button onClick={handleAddSeason} disabled={!newSeasonData.title || isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Season"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Season Dialog */}
          <Dialog open={!!editingSeason} onOpenChange={(open) => !open && setEditingSeason(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Season</DialogTitle>
                <DialogDescription>Update the details of this season.</DialogDescription>
              </DialogHeader>
              {editingSeason && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Season Title</Label>
                    <Input
                      id="edit-title"
                      name="title"
                      value={editingSeason.title}
                      onChange={handleEditSeasonChange}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      name="description"
                      value={editingSeason.description || ""}
                      onChange={handleEditSeasonChange}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingSeason(null)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateSeason} disabled={!editingSeason?.title || isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Episode Dialog */}
          <Dialog open={isAddingEpisode} onOpenChange={setIsAddingEpisode}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Episode to Season</DialogTitle>
                <DialogDescription>Select a video from your library to add to this season.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Video</Label>
                  {availableVideos.length === 0 ? (
                    <div className="flex h-24 items-center justify-center rounded-lg border border-dashed">
                      <p className="text-sm text-muted-foreground">No available videos in your library</p>
                    </div>
                  ) : (
                    <div className="max-h-[300px] space-y-2 overflow-y-auto rounded-lg border p-2">
                      {availableVideos.map((video) => (
                        <div
                          key={video._id}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-accent ${
                            selectedVideo === video._id ? "bg-accent" : ""
                          }`}
                          onClick={() => setSelectedVideo(video._id)}
                        >
                          <div className="h-16 w-28 overflow-hidden rounded-md">
                            <img
                              src={video.thumbnail || "/placeholder.svg"}
                              alt={video.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{video.title}</h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingEpisode(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddEpisode}
                  disabled={!selectedVideo || isSubmitting || availableVideos.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Video className="mr-2 h-4 w-4" />
                      Add to Season
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </RequireAuth>
  )
}

