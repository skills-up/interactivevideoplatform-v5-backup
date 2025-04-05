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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2, Download, Upload, Copy, FileJson } from "lucide-react"

interface ImportExportDialogProps {
  videoId: string
  interactiveElements: any[]
  onImport: (importedData: any) => void
  onClose: () => void
}

export function ImportExportDialog({ videoId, interactiveElements, onImport, onClose }: ImportExportDialogProps) {
  const [activeTab, setActiveTab] = useState("export")
  const [exportFormat, setExportFormat] = useState("json")
  const [exportData, setExportData] = useState("")
  const [importData, setImportData] = useState("")
  const [replaceExisting, setReplaceExisting] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  // Generate export data
  const generateExport = () => {
    setIsProcessing(true)
    setError("")

    try {
      const data = {
        videoId,
        interactiveElements,
        exportDate: new Date().toISOString(),
        version: "1.0",
      }

      if (exportFormat === "json") {
        setExportData(JSON.stringify(data, null, 2))
      } else if (exportFormat === "csv") {
        // Convert to CSV format
        const headers = ["id", "type", "title", "startTime", "endTime", "position.x", "position.y", "style", "content"]

        const rows = interactiveElements.map((element) => {
          return [
            element.id,
            element.type,
            element.title,
            element.startTime,
            element.endTime || "",
            element.position?.x || 0.5,
            element.position?.y || 0.5,
            JSON.stringify(element.style || {}),
            JSON.stringify(element.options || element.question || element.hotspots || element.content || {}),
          ]
        })

        const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

        setExportData(csvContent)
      }
    } catch (err) {
      console.error("Error generating export:", err)
      setError("Failed to generate export data")
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle import
  const handleImport = () => {
    setIsProcessing(true)
    setError("")

    try {
      if (!importData.trim()) {
        setError("Please enter import data")
        setIsProcessing(false)
        return
      }

      // Parse JSON data
      const parsedData = JSON.parse(importData)

      // Validate the data
      if (!parsedData.interactiveElements || !Array.isArray(parsedData.interactiveElements)) {
        setError("Invalid import data format")
        setIsProcessing(false)
        return
      }

      // Process the import
      onImport({
        interactiveElements: parsedData.interactiveElements,
        replaceExisting,
      })
    } catch (err) {
      console.error("Error processing import:", err)
      setError("Failed to process import data. Please check the format.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Copy export data to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportData)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Download export data as file
  const downloadExport = () => {
    const blob = new Blob([exportData], {
      type: exportFormat === "json" ? "application/json" : "text/csv",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `video-interactions-${videoId}.${exportFormat}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import/Export Interactions</DialogTitle>
          <DialogDescription>Import or export interactive elements for this video</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4">
            <div className="flex items-center space-x-4">
              <Label>Format:</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="json"
                  name="exportFormat"
                  value="json"
                  checked={exportFormat === "json"}
                  onChange={() => setExportFormat("json")}
                />
                <Label htmlFor="json">JSON</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="csv"
                  name="exportFormat"
                  value="csv"
                  checked={exportFormat === "csv"}
                  onChange={() => setExportFormat("csv")}
                />
                <Label htmlFor="csv">CSV</Label>
              </div>
              <Button variant="outline" size="sm" onClick={generateExport} disabled={isProcessing}>
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileJson className="h-4 w-4 mr-2" />
                )}
                Generate
              </Button>
            </div>

            <div>
              <Textarea
                value={exportData}
                readOnly
                className="font-mono h-64"
                placeholder="Click 'Generate' to create export data"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={copyToClipboard} disabled={!exportData}>
                <Copy className="h-4 w-4 mr-2" />
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button variant="default" onClick={downloadExport} disabled={!exportData}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <div>
              <Label htmlFor="importData">Paste JSON data:</Label>
              <Textarea
                id="importData"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                className="font-mono h-64"
                placeholder='Paste JSON data here. Format: {"videoId": "...", "interactiveElements": [...]}'
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="replaceExisting" checked={replaceExisting} onCheckedChange={setReplaceExisting} />
              <Label htmlFor="replaceExisting">Replace existing interactions</Label>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="default" onClick={handleImport} disabled={isProcessing || !importData.trim()}>
                {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                Import
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

