"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Trash, Video } from "lucide-react"
import { cn } from "@/lib/utils"

interface BranchingOption {
  id: string
  text: string
  action: string
  actionType: "timestamp" | "video" | "url"
  actionValue: string
}

interface BranchingScenarioEditorProps {
  options: BranchingOption[]
  onChange: (options: BranchingOption[]) => void
  videos?: Array<{ id: string; title: string }>
}

export function BranchingScenarioEditor({ options, onChange, videos = [] }: BranchingScenarioEditorProps) {
  const [selectedOption, setSelectedOption] = useState<BranchingOption | null>(null)
  const { toast } = useToast()

  // Handle adding a new branch
  const handleAddBranch = () => {
    const newOption: BranchingOption = {
      id: `branch-${Date.now()}`,
      text: "New Branch",
      action: "Go to timestamp",
      actionType: "timestamp",
      actionValue: "0",
    }

    onChange([...options, newOption])
    setSelectedOption(newOption)
  }

  // Handle updating a branch
  const handleUpdateBranch = (updatedOption: BranchingOption) => {
    const updatedOptions = options.map((option) => (option.id === updatedOption.id ? updatedOption : option))

    onChange(updatedOptions)
    setSelectedOption(updatedOption)
  }

  // Handle deleting a branch
  const handleDeleteBranch = (optionId: string) => {
    const updatedOptions = options.filter((option) => option.id !== optionId)
    onChange(updatedOptions)

    if (selectedOption?.id === optionId) {
      setSelectedOption(null)
    }
  }

  // Handle action type change
  const handleActionTypeChange = (optionId: string, actionType: "timestamp" | "video" | "url") => {
    const option = options.find((o) => o.id === optionId)
    if (!option) return

    let actionValue = ""
    let action = ""

    switch (actionType) {
      case "timestamp":
        actionValue = "0"
        action = "Go to timestamp"
        break
      case "video":
        actionValue = videos.length > 0 ? videos[0].id : ""
        action = "Go to another video"
        break
      case "url":
        actionValue = "https://"
        action = "Open external URL"
        break
    }

    const updatedOption = {
      ...option,
      actionType,
      actionValue,
      action,
    }

    handleUpdateBranch(updatedOption)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Branching Scenario</h3>
        <Button onClick={handleAddBranch} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Branch
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option) => (
          <Card
            key={option.id}
            className={cn(
              "cursor-pointer transition-all",
              selectedOption?.id === option.id ? "ring-2 ring-primary" : "",
            )}
            onClick={() => setSelectedOption(option)}
          >
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base flex justify-between items-center">
                <span className="truncate">{option.text}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteBranch(option.id)
                  }}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="mr-2">{option.action}:</span>
                {option.actionType === "timestamp" && <span>{Number.parseInt(option.actionValue)}s</span>}
                {option.actionType === "video" && (
                  <span className="flex items-center">
                    <Video className="h-3 w-3 mr-1" />
                    {videos.find((v) => v.id === option.actionValue)?.title || "Unknown video"}
                  </span>
                )}
                {option.actionType === "url" && <span className="truncate">{option.actionValue}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedOption && (
        <div className="border rounded-md p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Edit Branch</h4>
            <Button variant="destructive" size="sm" onClick={() => handleDeleteBranch(selectedOption.id)}>
              <Trash className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch-text">Option Text</Label>
            <Input
              id="branch-text"
              value={selectedOption.text}
              onChange={(e) => handleUpdateBranch({ ...selectedOption, text: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="action-type">Action Type</Label>
            <Select
              value={selectedOption.actionType}
              onValueChange={(value) => handleActionTypeChange(selectedOption.id, value as any)}
            >
              <SelectTrigger id="action-type">
                <SelectValue placeholder="Select action type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timestamp">Go to timestamp</SelectItem>
                <SelectItem value="video">Go to another video</SelectItem>
                <SelectItem value="url">Open external URL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedOption.actionType === "timestamp" && (
            <div className="space-y-2">
              <Label htmlFor="timestamp-value">Timestamp (seconds)</Label>
              <Input
                id="timestamp-value"
                type="number"
                min="0"
                value={selectedOption.actionValue}
                onChange={(e) =>
                  handleUpdateBranch({
                    ...selectedOption,
                    actionValue: e.target.value,
                  })
                }
              />
            </div>
          )}

          {selectedOption.actionType === "video" && (
            <div className="space-y-2">
              <Label htmlFor="video-value">Select Video</Label>
              <Select
                value={selectedOption.actionValue}
                onValueChange={(value) =>
                  handleUpdateBranch({
                    ...selectedOption,
                    actionValue: value,
                  })
                }
              >
                <SelectTrigger id="video-value">
                  <SelectValue placeholder="Select a video" />
                </SelectTrigger>
                <SelectContent>
                  {videos.length > 0 ? (
                    videos.map((video) => (
                      <SelectItem key={video.id} value={video.id}>
                        {video.title}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      No videos available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedOption.actionType === "url" && (
            <div className="space-y-2">
              <Label htmlFor="url-value">External URL</Label>
              <Input
                id="url-value"
                type="url"
                value={selectedOption.actionValue}
                onChange={(e) =>
                  handleUpdateBranch({
                    ...selectedOption,
                    actionValue: e.target.value,
                  })
                }
                placeholder="https://example.com"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

