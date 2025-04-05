"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Sparkles, FileText, Clock, Wand2 } from "lucide-react"

interface AIInteractionGeneratorProps {
  videoId: string
  onGenerate: (generatedInteractions: any[]) => void
  onClose: () => void
}

export function AIInteractionGenerator({ videoId, onGenerate, onClose }: AIInteractionGeneratorProps) {
  const [prompt, setPrompt] = useState("")
  const [videoTranscript, setVideoTranscript] = useState("")
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState("")
  const [generatedInteractions, setGeneratedInteractions] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("prompt")
  const [interactionType, setInteractionType] = useState("auto")
  const [interactionCount, setInteractionCount] = useState(3)
  const [interactionDensity, setInteractionDensity] = useState(50)
  const [includeTranscript, setIncludeTranscript] = useState(true)
  const [advancedSettings, setAdvancedSettings] = useState({
    difficulty: "medium",
    style: "educational",
    language: "english",
    audience: "general",
  })

  // Load video transcript
  const loadTranscript = async () => {
    setIsLoadingTranscript(true)
    setError("")

    try {
      const response = await fetch(`/api/videos/${videoId}/transcript`)
      if (response.ok) {
        const data = await response.json()
        setVideoTranscript(data.transcript || "No transcript available for this video.")
      } else {
        setVideoTranscript("Failed to load transcript. The video may not have been transcribed yet.")
      }
    } catch (error) {
      console.error("Error loading transcript:", error)
      setVideoTranscript("Error loading transcript. Please try again later.")
    } finally {
      setIsLoadingTranscript(false)
    }
  }

  // Generate interactions
  const generateInteractions = async () => {
    setIsGenerating(true)
    setError("")
    setGeneratedInteractions([])

    try {
      const response = await fetch("/api/ai/generate-interactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoId,
          prompt,
          transcript: includeTranscript ? videoTranscript : "",
          type: interactionType,
          count: interactionCount,
          density: interactionDensity,
          settings: advancedSettings,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedInteractions(data.interactions || [])
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to generate interactions")
      }
    } catch (error) {
      console.error("Error generating interactions:", error)
      setError("An unexpected error occurred. Please try again later.")
    } finally {
      setIsGenerating(false)
    }
  }

  // Apply generated interactions
  const applyInteractions = () => {
    onGenerate(generatedInteractions)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            AI Interaction Generator
          </DialogTitle>
          <DialogDescription>Generate interactive elements for your video using AI</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="prompt">Prompt</TabsTrigger>
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="prompt" className="space-y-4">
            <div>
              <Label htmlFor="prompt">Describe what kind of interactions you want</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., Create quiz questions about the key concepts in this video, or add hotspots to highlight important elements"
                className="h-32"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Be specific about the type of interactions, difficulty level, and content focus
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="includeTranscript" checked={includeTranscript} onCheckedChange={setIncludeTranscript} />
              <Label htmlFor="includeTranscript">Include video transcript for better context</Label>
            </div>
          </TabsContent>

          <TabsContent value="transcript" className="space-y-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="transcript">Video Transcript</Label>
              <Button variant="outline" size="sm" onClick={loadTranscript} disabled={isLoadingTranscript}>
                {isLoadingTranscript ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Load Transcript
                  </>
                )}
              </Button>
            </div>
            <Textarea
              id="transcript"
              value={videoTranscript}
              onChange={(e) => setVideoTranscript(e.target.value)}
              placeholder="The video transcript will appear here. You can also manually enter or edit the transcript."
              className="h-64 font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground">
              The transcript helps the AI understand your video content and create more relevant interactions
            </p>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div>
              <Label htmlFor="interactionType">Interaction Type</Label>
              <Select value={interactionType} onValueChange={setInteractionType}>
                <SelectTrigger id="interactionType">
                  <SelectValue placeholder="Select interaction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Automatic (Mixed)</SelectItem>
                  <SelectItem value="quiz">Quiz Questions</SelectItem>
                  <SelectItem value="poll">Polls</SelectItem>
                  <SelectItem value="hotspot">Hotspots</SelectItem>
                  <SelectItem value="branching">Branching Scenarios</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="interactionCount">Number of Interactions</Label>
                <span className="text-sm">{interactionCount}</span>
              </div>
              <Slider
                id="interactionCount"
                min={1}
                max={10}
                step={1}
                value={[interactionCount]}
                onValueChange={(value) => setInteractionCount(value[0])}
                className="mt-2"
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="interactionDensity">Interaction Density</Label>
                <span className="text-sm">{interactionDensity}%</span>
              </div>
              <Slider
                id="interactionDensity"
                min={10}
                max={100}
                step={10}
                value={[interactionDensity]}
                onValueChange={(value) => setInteractionDensity(value[0])}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lower density spaces interactions further apart, higher density places them closer together
              </p>
            </div>

            <div className="space-y-4 border-t pt-4 mt-4">
              <h3 className="font-medium">Advanced Settings</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={advancedSettings.difficulty}
                    onValueChange={(value) => setAdvancedSettings({ ...advancedSettings, difficulty: value })}
                  >
                    <SelectTrigger id="difficulty">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="style">Interaction Style</Label>
                  <Select
                    value={advancedSettings.style}
                    onValueChange={(value) => setAdvancedSettings({ ...advancedSettings, style: value })}
                  >
                    <SelectTrigger id="style">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="educational">Educational</SelectItem>
                      <SelectItem value="entertaining">Entertaining</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={advancedSettings.language}
                    onValueChange={(value) => setAdvancedSettings({ ...advancedSettings, language: value })}
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="german">German</SelectItem>
                      <SelectItem value="chinese">Chinese</SelectItem>
                      <SelectItem value="japanese">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="audience">Target Audience</Label>
                  <Select
                    value={advancedSettings.audience}
                    onValueChange={(value) => setAdvancedSettings({ ...advancedSettings, audience: value })}
                  >
                    <SelectTrigger id="audience">
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="beginners">Beginners</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="children">Children</SelectItem>
                      <SelectItem value="professionals">Professionals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>}

        {generatedInteractions.length > 0 && (
          <div className="border rounded-md p-4 max-h-64 overflow-y-auto">
            <h3 className="font-medium mb-2">Generated Interactions ({generatedInteractions.length})</h3>
            <ul className="space-y-2">
              {generatedInteractions.map((interaction, index) => (
                <li key={index} className="text-sm border-b pb-2">
                  <div className="font-medium">{interaction.title}</div>
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="capitalize">{interaction.type}</span>
                    <span className="mx-1">•</span>
                    <Clock className="h-3 w-3 mr-1" />
                    <span>
                      {Math.floor(interaction.startTime / 60)}:
                      {(interaction.startTime % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <div className="space-x-2">
            {generatedInteractions.length > 0 ? (
              <Button onClick={applyInteractions}>Apply Interactions</Button>
            ) : (
              <Button onClick={generateInteractions} disabled={isGenerating || !prompt.trim()}>
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

