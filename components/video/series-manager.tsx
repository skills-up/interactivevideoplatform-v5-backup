"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Edit, Trash2, MoveUp, MoveDown, Folder, FolderPlus, Video, Loader2 } from "lucide-react"

interface VideoItem {
  id: string
  title: string
  thumbnailUrl: string
  duration: number
}

interface SeriesGroup {
  id: string
  name: string
  description?: string
  order: number
}

interface Series {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  isPublic: boolean
  isPaid: boolean
  price?: number
  groups: SeriesGroup[]
  videos: {
    id: string
    videoId: string
    groupId?: string
    title: string
    thumbnailUrl: string
    duration: number
    order: number
  }[]
}

interface SeriesManagerProps {
  userId: string
}

export function SeriesManager({ userId }: SeriesManagerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [series, setSeries] = useState<Series[]>([])
  const [userVideos, setUserVideos] = useState<VideoItem[]>([])
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isPublic: true,
    isPaid: false,
    price: 0,
  })
  const [newGroupName, setNewGroupName] = useState("")
  const { toast } = useToast()

  // Fetch user's series and videos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch series
        const seriesResponse = await fetch(`/api/users/${userId}/series`)
        if (!seriesResponse.ok) throw new Error("Failed to fetch series")
        const seriesData = await seriesResponse.json()

        // Fetch videos
        const videosResponse = await fetch(`/api/users/${userId}/videos`)
        if (!videosResponse.ok) throw new Error("Failed to fetch videos")
        const videosData = await videosResponse.json()

        setSeries(seriesData.series)
        setUserVideos(videosData.videos)
      } catch (error) {
        console.error("Error fetching data:", error)
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
  }, [userId])

  // Handle creating a new series
  const handleCreateSeries = async () => {
    try {
      setIsSaving(true)

      const response = await fetch("/api/series", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          isPublic: formData.isPublic,
          isPaid: formData.isPaid,
          price: formData.isPaid ? formData.price : 0,
        }),
      })

      if (!response.ok) throw new Error("Failed to create series")

      const newSeries = await response.json()
      setSeries([...series, newSeries])
      setSelectedSeries(newSeries)
      setIsCreating(false)

      toast({
        title: "Series Created",
        description: "Your new series has been created successfully",
      })

      // Reset form
      setFormData({
        title: "",
        description: "",
        isPublic: true,
        isPaid: false,
        price: 0,
      })
    } catch (error) {
      console.error("Error creating series:", error)
      toast({
        title: "Error",
        description: "Failed to create series",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle updating a series
  const handleUpdateSeries = async () => {
    if (!selectedSeries) return

    try {
      setIsSaving(true)

      const response = await fetch(`/api/series/${selectedSeries.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          isPublic: formData.isPublic,
          isPaid: formData.isPaid,
          price: formData.isPaid ? formData.price : 0,
        }),
      })

      if (!response.ok) throw new Error("Failed to update series")

      const updatedSeries = await response.json()

      setSeries(series.map((s) => (s.id === updatedSeries.id ? updatedSeries : s)))
      setSelectedSeries(updatedSeries)
      setIsEditing(false)

      toast({
        title: "Series Updated",
        description: "Your series has been updated successfully",
      })
    } catch (error) {
      console.error("Error updating series:", error)
      toast({
        title: "Error",
        description: "Failed to update series",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle deleting a series
  const handleDeleteSeries = async () => {
    if (!selectedSeries) return

    if (!confirm(`Are you sure you want to delete "${selectedSeries.title}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/series/${selectedSeries.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete series")

      setSeries(series.filter((s) => s.id !== selectedSeries.id))
      setSelectedSeries(null)

      toast({
        title: "Series Deleted",
        description: "Your series has been deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting series:", error)
      toast({
        title: "Error",
        description: "Failed to delete series",
        variant: "destructive",
      })
    }
  }

  // Handle adding a group to a series
  const handleAddGroup = async () => {
    if (!selectedSeries || !newGroupName.trim()) return

    try {
      const response = await fetch(`/api/series/${selectedSeries.id}/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newGroupName,
          order: selectedSeries.groups.length,
        }),
      })

      if (!response.ok) throw new Error("Failed to add group")

      const newGroup = await response.json()

      const updatedSeries = {
        ...selectedSeries,
        groups: [...selectedSeries.groups, newGroup],
      }

      setSeries(series.map((s) => (s.id === selectedSeries.id ? updatedSeries : s)))
      setSelectedSeries(updatedSeries)
      setNewGroupName("")

      toast({
        title: "Group Added",
        description: `Group "${newGroup.name}" has been added to the series`,
      })
    } catch (error) {
      console.error("Error adding group:", error)
      toast({
        title: "Error",
        description: "Failed to add group",
        variant: "destructive",
      })
    }
  }

  // Handle adding a video to a series
  const handleAddVideo = async (videoId: string, groupId?: string) => {
    if (!selectedSeries) return

    try {
      const response = await fetch(`/api/series/${selectedSeries.id}/videos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoId,
          groupId,
          order: selectedSeries.videos.length,
        }),
      })

      if (!response.ok) throw new Error("Failed to add video")

      const updatedSeries = await response.json()

      setSeries(series.map((s) => (s.id === selectedSeries.id ? updatedSeries : s)))
      setSelectedSeries(updatedSeries)

      toast({
        title: "Video Added",
        description: "Video has been added to the series",
      })
    } catch (error) {
      console.error("Error adding video:", error)
      toast({
        title: "Error",
        description: "Failed to add video",
        variant: "destructive",
      })
    }
  }

  // Handle removing a video from a series
  const handleRemoveVideo = async (seriesVideoId: string) => {
    if (!selectedSeries) return

    try {
      const response = await fetch(`/api/series/${selectedSeries.id}/videos/${seriesVideoId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to remove video")

      const updatedSeries = {
        ...selectedSeries,
        videos: selectedSeries.videos.filter((v) => v.id !== seriesVideoId),
      }

      setSeries(series.map((s) => (s.id === selectedSeries.id ? updatedSeries : s)))
      setSelectedSeries(updatedSeries)

      toast({
        title: "Video Removed",
        description: "Video has been removed from the series",
      })
    } catch (error) {
      console.error("Error removing video:", error)
      toast({
        title: "Error",
        description: "Failed to remove video",
        variant: "destructive",
      })
    }
  }

  // Handle reordering videos in a series
  const handleReorderVideo = async (videoId: string, direction: "up" | "down") => {
    if (!selectedSeries) return

    const videoIndex = selectedSeries.videos.findIndex((v) => v.id === videoId)
    if (videoIndex === -1) return

    const newIndex = direction === "up" ? videoIndex - 1 : videoIndex + 1

    // Check if the new index is valid
    if (newIndex < 0 || newIndex >= selectedSeries.videos.length) return

    try {
      const response = await fetch(`/api/series/${selectedSeries.id}/videos/reorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoId,
          newOrder: newIndex,
        }),
      })

      if (!response.ok) throw new Error("Failed to reorder video")

      const updatedSeries = await response.json()

      setSeries(series.map((s) => (s.id === selectedSeries.id ? updatedSeries : s)))
      setSelectedSeries(updatedSeries)

      toast({
        title: "Video Reordered",
        description: "Video order has been updated",
      })
    } catch (error) {
      console.error("Error reordering video:", error)
      toast({
        title: "Error",
        description: "Failed to reorder video",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Video Series</h2>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Series
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Series</DialogTitle>
              <DialogDescription>Create a new series to organize your videos into collections</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Series Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter series title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter series description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select
                    value={formData.isPublic ? "public" : "private"}
                    onValueChange={(value) => setFormData({ ...formData, isPublic: value === "public" })}
                  >
                    <SelectTrigger id="visibility">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="access">Access Type</Label>
                  <Select
                    value={formData.isPaid ? "paid" : "free"}
                    onValueChange={(value) => setFormData({ ...formData, isPaid: value === "paid" })}
                  >
                    <SelectTrigger id="access">
                      <SelectValue placeholder="Select access type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {formData.isPaid && (
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0.99"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) })}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSeries} disabled={!formData.title || isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Series"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Your Series</CardTitle>
            <CardDescription>Select a series to manage its videos and groups</CardDescription>
          </CardHeader>
          <CardContent>
            {series.length === 0 ? (
              <div className="text-center py-8">
                <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Series Created</h3>
                <p className="text-muted-foreground mt-1">Create your first series to organize your videos</p>
              </div>
            ) : (
              <div className="space-y-2">
                {series.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-md cursor-pointer hover:bg-muted transition-colors ${
                      selectedSeries?.id === item.id ? "bg-muted" : ""
                    }`}
                    onClick={() => setSelectedSeries(item)}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{item.title}</h3>
                      <div className="flex items-center space-x-1">
                        {item.isPaid && (
                          <Badge variant="outline" className="text-xs">
                            ${item.price?.toFixed(2)}
                          </Badge>
                        )}
                        <Badge variant={item.isPublic ? "default" : "secondary"} className="text-xs">
                          {item.isPublic ? "Public" : "Private"}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                    <div className="flex items-center text-xs text-muted-foreground mt-2">
                      <span>{item.videos.length} videos</span>
                      <span className="mx-2">•</span>
                      <span>{item.groups.length} groups</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>
              {selectedSeries ? (
                <div className="flex justify-between items-center">
                  <span>{selectedSeries.title}</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData({
                          title: selectedSeries.title,
                          description: selectedSeries.description,
                          isPublic: selectedSeries.isPublic,
                          isPaid: selectedSeries.isPaid,
                          price: selectedSeries.price || 0,
                        })
                        setIsEditing(true)
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDeleteSeries}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ) : (
                "Series Details"
              )}
            </CardTitle>
            <CardDescription>
              {selectedSeries
                ? `Manage videos and groups in "${selectedSeries.title}"`
                : "Select a series to view and manage its content"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedSeries ? (
              <div className="text-center py-8">
                <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Series Selected</h3>
                <p className="text-muted-foreground mt-1">Select a series from the list to manage its content</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Groups</h3>
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="New group name"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="w-48"
                      />
                      <Button variant="outline" size="sm" onClick={handleAddGroup} disabled={!newGroupName.trim()}>
                        <FolderPlus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>

                  {selectedSeries.groups.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No groups created yet. Add a group to organize your videos.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedSeries.groups.map((group) => (
                        <div key={group.id} className="p-2 rounded-md bg-muted">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">{group.name}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Handle edit group
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Videos</h3>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Video className="h-4 w-4 mr-2" />
                          Add Video
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Video to Series</DialogTitle>
                          <DialogDescription>Select a video to add to this series</DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <div className="space-y-2 mb-4">
                            <Label>Group (Optional)</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a group" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No group</SelectItem>
                                {selectedSeries.groups.map((group) => (
                                  <SelectItem key={group.id} value={group.id}>
                                    {group.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="max-h-[300px] overflow-y-auto space-y-2">
                            {userVideos.length === 0 ? (
                              <p className="text-center text-muted-foreground py-4">You don't have any videos to add</p>
                            ) : (
                              userVideos
                                .filter((video) => !selectedSeries.videos.some((v) => v.videoId === video.id))
                                .map((video) => (
                                  <div
                                    key={video.id}
                                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                                  >
                                    <div className="flex items-center">
                                      <div className="w-16 h-9 bg-muted rounded overflow-hidden mr-3">
                                        {video.thumbnailUrl && (
                                          <img
                                            src={video.thumbnailUrl || "/placeholder.svg"}
                                            alt={video.title}
                                            className="w-full h-full object-cover"
                                          />
                                        )}
                                      </div>
                                      <div>
                                        <p className="font-medium text-sm">{video.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {Math.floor(video.duration / 60)}:
                                          {(video.duration % 60).toString().padStart(2, "0")}
                                        </p>
                                      </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => handleAddVideo(video.id)}>
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {selectedSeries.videos.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No videos added to this series yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order</TableHead>
                          <TableHead>Video</TableHead>
                          <TableHead>Group</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedSeries.videos
                          .sort((a, b) => a.order - b.order)
                          .map((video, index) => (
                            <TableRow key={video.id}>
                              <TableCell className="w-16">
                                <div className="flex items-center space-x-1">
                                  <span>{index + 1}</span>
                                  <div className="flex flex-col">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-5 w-5 p-0"
                                      disabled={index === 0}
                                      onClick={() => handleReorderVideo(video.id, "up")}
                                    >
                                      <MoveUp className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-5 w-5 p-0"
                                      disabled={index === selectedSeries.videos.length - 1}
                                      onClick={() => handleReorderVideo(video.id, "down")}
                                    >
                                      <MoveDown className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <div className="w-16 h-9 bg-muted rounded overflow-hidden mr-3">
                                    {video.thumbnailUrl && (
                                      <img
                                        src={video.thumbnailUrl || "/placeholder.svg"}
                                        alt={video.title}
                                        className="w-full h-full object-cover"
                                      />
                                    )}
                                  </div>
                                  <span className="font-medium">{video.title}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {video.groupId
                                  ? selectedSeries.groups.find((g) => g.id === video.groupId)?.name || "Unknown"
                                  : "None"}
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" onClick={() => handleRemoveVideo(video.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Series</DialogTitle>
            <DialogDescription>Update the details of your series</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Series Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-visibility">Visibility</Label>
                <Select
                  value={formData.isPublic ? "public" : "private"}
                  onValueChange={(value) => setFormData({ ...formData, isPublic: value === "public" })}
                >
                  <SelectTrigger id="edit-visibility">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-access">Access Type</Label>
                <Select
                  value={formData.isPaid ? "paid" : "free"}
                  onValueChange={(value) => setFormData({ ...formData, isPaid: value === "paid" })}
                >
                  <SelectTrigger id="edit-access">
                    <SelectValue placeholder="Select access type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {formData.isPaid && (
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price ($)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  min="0.99"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) })}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSeries} disabled={!formData.title || isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

