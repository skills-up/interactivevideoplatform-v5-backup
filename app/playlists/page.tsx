"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { ArrowLeft, Clock, Edit, Loader2, MoreHorizontal, Play, Plus, Search, Trash, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { RequireAuth } from "@/components/auth/require-auth"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

interface Playlist {
  id: string
  title: string
  description: string
  thumbnail: string
  videoCount: number
  visibility: "public" | "private" | "unlisted"
  createdAt: string
  updatedAt: string
}

export default function PlaylistsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newPlaylistData, setNewPlaylistData] = useState({
    title: "",
    description: "",
    visibility: "public",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchPlaylists = async () => {
      setIsLoading(true)

      try {
        // In a real app, you would fetch playlists from your API
        // const response = await fetch('/api/playlists')
        // const data = await response.json()

        // Simulate API call with mock data
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockPlaylists: Playlist[] = [
          {
            id: "pl1",
            title: "Web Development Essentials",
            description: "A collection of videos covering the fundamentals of web development",
            thumbnail: "/placeholder.svg?height=200&width=350",
            videoCount: 12,
            visibility: "public",
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "pl2",
            title: "JavaScript Deep Dive",
            description: "Advanced JavaScript concepts and techniques",
            thumbnail: "/placeholder.svg?height=200&width=350",
            videoCount: 8,
            visibility: "public",
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "pl3",
            title: "React Tutorials",
            description: "Learn React from beginner to advanced",
            thumbnail: "/placeholder.svg?height=200&width=350",
            videoCount: 15,
            visibility: "public",
            createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "pl4",
            title: "Watch Later",
            description: "Videos I want to watch later",
            thumbnail: "/placeholder.svg?height=200&width=350",
            videoCount: 7,
            visibility: "private",
            createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]

        setPlaylists(mockPlaylists)
      } catch (error) {
        console.error("Error fetching playlists:", error)
        toast({
          title: "Error",
          description: "Failed to load playlists",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlaylists()
  }, [toast])

  const handleCreatePlaylist = async () => {
    if (!newPlaylistData.title) {
      toast({
        title: "Missing Title",
        description: "Please enter a title for your playlist",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // In a real app, you would call your API to create a new playlist
      // const response = await fetch('/api/playlists', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newPlaylistData),
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Create a new playlist with mock data
      const newPlaylist: Playlist = {
        id: `pl${Date.now()}`,
        title: newPlaylistData.title,
        description: newPlaylistData.description,
        thumbnail: "/placeholder.svg?height=200&width=350",
        videoCount: 0,
        visibility: newPlaylistData.visibility as "public" | "private" | "unlisted",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setPlaylists((prev) => [newPlaylist, ...prev])

      // Reset form and close dialog
      setNewPlaylistData({
        title: "",
        description: "",
        visibility: "public",
      })
      setIsCreateDialogOpen(false)

      toast({
        title: "Playlist Created",
        description: "Your new playlist has been created successfully",
      })
    } catch (error) {
      console.error("Error creating playlist:", error)
      toast({
        title: "Error",
        description: "Failed to create playlist",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePlaylist = async (playlistId: string) => {
    try {
      // In a real app, you would call your API to delete the playlist
      // const response = await fetch(`/api/playlists/${playlistId}`, {
      //   method: 'DELETE',
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Remove the playlist from state
      setPlaylists((prev) => prev.filter((playlist) => playlist.id !== playlistId))

      toast({
        title: "Playlist Deleted",
        description: "The playlist has been deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting playlist:", error)
      toast({
        title: "Error",
        description: "Failed to delete playlist",
        variant: "destructive",
      })
    }
  }

  // Filter playlists based on search query
  const filteredPlaylists =
    searchQuery.trim() === ""
      ? playlists
      : playlists.filter(
          (playlist) =>
            playlist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            playlist.description.toLowerCase().includes(searchQuery.toLowerCase()),
        )

  return (
    <RequireAuth>
      <div className="container px-4 py-6">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Your Playlists</h1>
            <p className="text-muted-foreground">Organize and manage your video collections</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Playlist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Playlist</DialogTitle>
                <DialogDescription>Create a new playlist to organize your favorite videos</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Title
                  </label>
                  <Input
                    id="title"
                    placeholder="Enter playlist title"
                    value={newPlaylistData.title}
                    onChange={(e) => setNewPlaylistData((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description (Optional)
                  </label>
                  <Input
                    id="description"
                    placeholder="Enter playlist description"
                    value={newPlaylistData.description}
                    onChange={(e) => setNewPlaylistData((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="visibility" className="text-sm font-medium">
                    Visibility
                  </label>
                  <select
                    id="visibility"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={newPlaylistData.visibility}
                    onChange={(e) => setNewPlaylistData((prev) => ({ ...prev, visibility: e.target.value }))}
                  >
                    <option value="public">Public</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePlaylist} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Playlist"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search playlists..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="rounded-lg border p-1">
                  <div className="aspect-video animate-pulse rounded-md bg-muted"></div>
                  <div className="p-3">
                    <div className="h-5 w-3/4 animate-pulse rounded bg-muted"></div>
                    <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-muted"></div>
                    <div className="mt-4 h-4 w-1/4 animate-pulse rounded bg-muted"></div>
                  </div>
                </div>
              ))}
          </div>
        ) : filteredPlaylists.length === 0 ? (
          <div className="flex h-[40vh] flex-col items-center justify-center rounded-lg border border-dashed">
            <Video className="h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">No Playlists Found</h2>
            <p className="mt-2 text-center text-muted-foreground">
              {searchQuery ? "No playlists match your search" : "You haven't created any playlists yet"}
            </p>
            {!searchQuery && (
              <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Playlist
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredPlaylists.map((playlist) => (
              <div
                key={playlist.id}
                className="group overflow-hidden rounded-lg border transition-colors hover:bg-accent/50"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={playlist.thumbnail || "/placeholder.svg"}
                    alt={playlist.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Link href={`/playlists/${playlist.id}`}>
                      <Button size="sm" className="rounded-full">
                        <Play className="mr-2 h-4 w-4" />
                        Play All
                      </Button>
                    </Link>
                  </div>
                  {playlist.visibility !== "public" && (
                    <div className="absolute right-2 top-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                      {playlist.visibility === "private" ? "Private" : "Unlisted"}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <Link href={`/playlists/${playlist.id}`} className="hover:underline">
                      <h3 className="font-semibold">{playlist.title}</h3>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/playlists/${playlist.id}/edit`} className="flex w-full cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Playlist</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this playlist? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeletePlaylist(playlist.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {playlist.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{playlist.description}</p>
                  )}
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Video className="h-3 w-3" />
                      <span>{playlist.videoCount} videos</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Updated {new Date(playlist.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RequireAuth>
  )
}

