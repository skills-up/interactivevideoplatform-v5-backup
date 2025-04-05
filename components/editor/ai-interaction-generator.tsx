"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Sparkles, Upload, FileText } from "lucide-react"
import type { InteractiveElement } from "@/lib/api"

interface AIInteractionGeneratorProps {
  videoId: string
  onGeneratedInteractions: (elements: InteractiveElement[]) => void
}

export function AIInteractionGenerator({ videoId, onGeneratedInteractions }: AIInteractionGeneratorProps) {
  const [transcript, setTranscript] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [density, setDensity] = useState(5) // Number of interactions to generate
  const [includeQuizzes, setIncludeQuizzes] = useState(true)
  const [includePolls, setIncludePolls] = useState(true)
  const [includeHotspots, setIncludeHotspots] = useState(true)
  const { toast } = useToast()

  // Handle transcript file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)

      // Check file type
      if (!file.name.endsWith(".txt") && !file.name.endsWith(".srt") && !file.name.endsWith(".vtt")) {
        toast({
          title: "Invalid File",
          description: "Please upload a .txt, .srt, or .vtt file",
          variant: "destructive",
        })
        return
      }

      // Read file content
      const text = await file.text()

      // Process SRT or VTT files to extract plain text
      let processedText = text
      if (file.name.endsWith(".srt") || file.name.endsWith(".vtt")) {
        // Simple regex to remove timestamps and indices
        processedText = text
          .replace(/\d+\r?\n\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}\r?\n/g, "") // SRT format
          .replace(/\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}\r?\n/g, "") // VTT format
          .replace(/<[^>]*>/g, "") // Remove HTML tags
      }

      setTranscript(processedText)

      toast({
        title: "Transcript Uploaded",
        description: `Successfully uploaded transcript from ${file.name}`,
      })
    } catch (error) {
      console.error("Error uploading transcript:", error)
      toast({
        title: "Upload Error",
        description: "Failed to read transcript file",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Generate interactions from transcript
  const generateInteractions = async () => {
    if (!transcript.trim()) {
      toast({
        title: "No Transcript",
        description: "Please provide a transcript to generate interactions",
        variant: "destructive",
      })
      return
    }

    try {
      setIsGenerating(true)

      // Prepare request data
      const requestData = {
        videoId,
        transcript,
        settings: {
          density,
          types: {
            quiz: includeQuizzes,
            poll: includePolls,
            hotspot: includeHotspots,
          },
        },
      }

      // Call the AI generation API
      const response = await fetch("/api/ai/generate-interactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      // Process the generated interactions
      if (data.interactions && Array.isArray(data.interactions)) {
        // Call the callback with generated interactions
        onGeneratedInteractions(data.interactions)

        toast({
          title: "Interactions Generated",
          description: `Successfully generated ${data.interactions.length} interactions`,
        })
      } else {
        throw new Error("Invalid response format")
      }
    } catch (error) {
      console.error("Error generating interactions:", error)
      toast({
        title: "Generation Error",
        description: "Failed to generate interactions from transcript",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Interaction Generator</CardTitle>
        <CardDescription>Automatically generate interactive elements from your video transcript</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="transcript">Video Transcript</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("transcript-upload")?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </>
              )}
            </Button>
            <input
              id="transcript-upload"
              type="file"
              accept=".txt,.srt,.vtt"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
          <Textarea
            id="transcript"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste your video transcript here or upload a file..."
            rows={10}
          />
          <p className="text-xs text-muted-foreground">
            <FileText className="h-3 w-3 inline mr-1" />
            Supports plain text, SRT, or VTT format
          </p>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium">Generation Settings</h3>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="density">Interaction Density</Label>
              <span className="text-sm text-muted-foreground">{density} interactions</span>
            </div>
            <Slider
              id="density"
              min={1}
              max={20}
              step={1}
              value={[density]}
              onValueChange={(value) => setDensity(value[0])}
            />
            <p className="text-xs text-muted-foreground">Controls how many interactions will be generated</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="include-quizzes" className="flex items-center">
                Include Quizzes
              </Label>
              <Switch id="include-quizzes" checked={includeQuizzes} onCheckedChange={setIncludeQuizzes} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="include-polls" className="flex items-center">
                Include Polls
              </Label>
              <Switch id="include-polls" checked={includePolls} onCheckedChange={setIncludePolls} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="include-hotspots" className="flex items-center">
                Include Hotspots
              </Label>
              <Switch id="include-hotspots" checked={includeHotspots} onCheckedChange={setIncludeHotspots} />
            </div>
          </div>
        </div>

        <Button onClick={generateInteractions} disabled={isGenerating || !transcript.trim()} className="w-full">
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Interactions
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

