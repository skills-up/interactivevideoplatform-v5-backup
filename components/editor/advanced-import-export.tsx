"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Download, Upload, FileJson, FileSpreadsheet, FileCode, Package, File } from "lucide-react"
import type { InteractiveElement } from "@/lib/api"

interface AdvancedImportExportProps {
  videoId: string
  interactiveElements: InteractiveElement[]
  onImport: (elements: InteractiveElement[]) => void
}

export function AdvancedImportExport({ videoId, interactiveElements, onImport }: AdvancedImportExportProps) {
  const [importFormat, setImportFormat] = useState<"json" | "csv" | "xml" | "scorm" | "h5p" | "ims">("json")
  const [exportFormat, setExportFormat] = useState<"json" | "csv" | "xml" | "scorm" | "h5p" | "ims">("json")
  const [importData, setImportData] = useState("")
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0])
    }
  }

  // Generate export data based on selected format
  const generateExportData = async () => {
    try {
      setIsProcessing(true)
      setProgress(10)

      // Clean elements for export
      const cleanedElements = interactiveElements.map(({ id, videoId, createdAt, updatedAt, ...rest }) => ({
        ...rest,
        originalId: id, // Keep original ID as reference
      }))

      setProgress(30)

      let result
      switch (exportFormat) {
        case "json":
          result = JSON.stringify(cleanedElements, null, 2)
          break
        case "csv":
          result = await fetch("/api/convert/json-to-csv", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cleanedElements),
          }).then((res) => res.text())
          break
        case "xml":
          result = await fetch("/api/convert/json-to-xml", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: cleanedElements, rootElement: "interactiveElements" }),
          }).then((res) => res.text())
          break
        case "scorm":
          // Call API to generate SCORM package
          const scormResponse = await fetch(`/api/export/scorm/${videoId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ elements: cleanedElements }),
          })

          if (!scormResponse.ok) throw new Error("Failed to generate SCORM package")

          // Download the SCORM package directly
          const blob = await scormResponse.blob()
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `interactive-video-${videoId}-scorm.zip`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)

          setIsProcessing(false)
          setProgress(100)

          toast({
            title: "Export Successful",
            description: "SCORM package has been generated and downloaded",
          })

          return null
        case "h5p":
          // Call API to generate H5P package
          const h5pResponse = await fetch(`/api/export/h5p/${videoId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ elements: cleanedElements }),
          })

          if (!h5pResponse.ok) throw new Error("Failed to generate H5P package")

          // Download the H5P package directly
          const h5pBlob = await h5pResponse.blob()
          const h5pUrl = URL.createObjectURL(h5pBlob)
          const h5pLink = document.createElement("a")
          h5pLink.href = h5pUrl
          h5pLink.download = `interactive-video-${videoId}.h5p`
          document.body.appendChild(h5pLink)
          h5pLink.click()
          document.body.removeChild(h5pLink)
          URL.revokeObjectURL(h5pUrl)

          setIsProcessing(false)
          setProgress(100)

          toast({
            title: "Export Successful",
            description: "H5P package has been generated and downloaded",
          })

          return null
        case "ims":
          // Call API to generate IMS package
          const imsResponse = await fetch(`/api/export/ims/${videoId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ elements: cleanedElements }),
          })

          if (!imsResponse.ok) throw new Error("Failed to generate IMS package")

          // Download the IMS package directly
          const imsBlob = await imsResponse.blob()
          const imsUrl = URL.createObjectURL(imsBlob)
          const imsLink = document.createElement("a")
          imsLink.href = imsUrl
          imsLink.download = `interactive-video-${videoId}-ims.zip`
          document.body.appendChild(imsLink)
          imsLink.click()
          document.body.removeChild(imsLink)
          URL.revokeObjectURL(imsUrl)

          setIsProcessing(false)
          setProgress(100)

          toast({
            title: "Export Successful",
            description: "IMS package has been generated and downloaded",
          })

          return null
        default:
          result = JSON.stringify(cleanedElements, null, 2)
      }

      setProgress(90)
      setIsProcessing(false)
      setProgress(100)

      return result
    } catch (error) {
      console.error("Error generating export data:", error)
      setIsProcessing(false)
      setProgress(0)

      toast({
        title: "Export Error",
        description: "Failed to generate export data",
        variant: "destructive",
      })
      return ""
    }
  }

  // Handle export button click
  const handleExport = async () => {
    const data = await generateExportData()
    if (!data) return // For SCORM, H5P, IMS which handle their own downloads

    const blob = new Blob([data], { type: getContentType() })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `interactive-elements-${videoId}.${exportFormat}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Export Successful",
      description: `Exported ${interactiveElements.length} interactive elements as ${exportFormat.toUpperCase()}`,
    })
  }

  // Get content type based on export format
  const getContentType = () => {
    switch (exportFormat) {
      case "json":
        return "application/json"
      case "csv":
        return "text/csv"
      case "xml":
        return "application/xml"
      default:
        return "text/plain"
    }
  }

  // Handle import button click
  const handleImport = async () => {
    if ((!importData.trim() && !importFile) || isProcessing) {
      toast({
        title: "Import Error",
        description: "Please provide data or a file to import",
        variant: "destructive",
      })
      return
    }

    try {
      setIsProcessing(true)
      setProgress(10)

      let parsedData

      // Handle file-based imports (SCORM, H5P, IMS)
      if (importFile && ["scorm", "h5p", "ims"].includes(importFormat)) {
        const formData = new FormData()
        formData.append("file", importFile)
        formData.append("videoId", videoId)

        setProgress(30)

        const response = await fetch(`/api/import/${importFormat}`, {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Failed to import ${importFormat.toUpperCase()} file`)
        }

        setProgress(70)

        const result = await response.json()
        parsedData = result.elements
      }
      // Handle text-based imports (JSON, CSV, XML)
      else {
        let data = importData

        if (importFile) {
          const text = await importFile.text()
          data = text
        }

        setProgress(30)

        switch (importFormat) {
          case "json":
            parsedData = JSON.parse(data)
            break
          case "csv":
            const csvResponse = await fetch("/api/convert/csv-to-json", {
              method: "POST",
              headers: { "Content-Type": "text/plain" },
              body: data,
            })
            parsedData = await csvResponse.json()
            break
          case "xml":
            const xmlResponse = await fetch("/api/convert/xml-to-json", {
              method: "POST",
              headers: { "Content-Type": "text/plain" },
              body: data,
            })
            parsedData = await xmlResponse.json()
            break
          default:
            parsedData = JSON.parse(data)
        }

        setProgress(70)
      }

      // Validate the imported data
      if (!Array.isArray(parsedData)) {
        parsedData = [parsedData]
      }

      // Add videoId to each element
      const processedData = parsedData.map((item) => ({
        ...item,
        videoId,
      }))

      setProgress(90)

      onImport(processedData)

      setImportData("")
      setImportFile(null)
      setProgress(100)

      toast({
        title: "Import Successful",
        description: `Imported ${processedData.length} interactive elements`,
      })
    } catch (error) {
      console.error("Error importing data:", error)
      toast({
        title: "Import Error",
        description: "Failed to parse import data. Please check the format.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="export" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Interactive Elements</CardTitle>
              <CardDescription>
                Export your interactive elements in various formats for backup or sharing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Export Format</Label>
                <RadioGroup
                  value={exportFormat}
                  onValueChange={(value) => setExportFormat(value as any)}
                  className="grid grid-cols-3 gap-4"
                >
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="json" id="export-json" />
                    <Label htmlFor="export-json" className="flex items-center cursor-pointer">
                      <FileJson className="h-4 w-4 mr-2" />
                      JSON
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="csv" id="export-csv" />
                    <Label htmlFor="export-csv" className="flex items-center cursor-pointer">
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      CSV
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="xml" id="export-xml" />
                    <Label htmlFor="export-xml" className="flex items-center cursor-pointer">
                      <FileCode className="h-4 w-4 mr-2" />
                      XML
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="scorm" id="export-scorm" />
                    <Label htmlFor="export-scorm" className="flex items-center cursor-pointer">
                      <Package className="h-4 w-4 mr-2" />
                      SCORM
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="h5p" id="export-h5p" />
                    <Label htmlFor="export-h5p" className="flex items-center cursor-pointer">
                      <File className="h-4 w-4 mr-2" />
                      H5P
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="ims" id="export-ims" />
                    <Label htmlFor="export-ims" className="flex items-center cursor-pointer">
                      <Package className="h-4 w-4 mr-2" />
                      IMS
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {["json", "csv", "xml"].includes(exportFormat) && (
                <div className="space-y-2">
                  <Label htmlFor="export-preview">Preview</Label>
                  <Textarea
                    id="export-preview"
                    value={isProcessing ? "Generating preview..." : "Click Export to generate and download"}
                    readOnly
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>
              )}

              {isProcessing && (
                <div className="space-y-2">
                  <Label>Processing</Label>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              <Button onClick={handleExport} className="w-full" disabled={isProcessing}>
                <Download className="h-4 w-4 mr-2" />
                Export {interactiveElements.length} Elements as {exportFormat.toUpperCase()}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Interactive Elements</CardTitle>
              <CardDescription>Import interactive elements from various formats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Import Format</Label>
                <RadioGroup
                  value={importFormat}
                  onValueChange={(value) => setImportFormat(value as any)}
                  className="grid grid-cols-3 gap-4"
                >
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="json" id="import-json" />
                    <Label htmlFor="import-json" className="flex items-center cursor-pointer">
                      <FileJson className="h-4 w-4 mr-2" />
                      JSON
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="csv" id="import-csv" />
                    <Label htmlFor="import-csv" className="flex items-center cursor-pointer">
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      CSV
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="xml" id="import-xml" />
                    <Label htmlFor="import-xml" className="flex items-center cursor-pointer">
                      <FileCode className="h-4 w-4 mr-2" />
                      XML
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="scorm" id="import-scorm" />
                    <Label htmlFor="import-scorm" className="flex items-center cursor-pointer">
                      <Package className="h-4 w-4 mr-2" />
                      SCORM
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="h5p" id="import-h5p" />
                    <Label htmlFor="import-h5p" className="flex items-center cursor-pointer">
                      <File className="h-4 w-4 mr-2" />
                      H5P
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="ims" id="import-ims" />
                    <Label htmlFor="import-ims" className="flex items-center cursor-pointer">
                      <Package className="h-4 w-4 mr-2" />
                      IMS
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="import-file">Upload File</Label>
                <Input
                  id="import-file"
                  type="file"
                  onChange={handleFileChange}
                  accept={
                    importFormat === "json"
                      ? ".json"
                      : importFormat === "csv"
                        ? ".csv"
                        : importFormat === "xml"
                          ? ".xml"
                          : importFormat === "scorm"
                            ? ".zip"
                            : importFormat === "h5p"
                              ? ".h5p"
                              : importFormat === "ims"
                                ? ".zip"
                                : undefined
                  }
                />
              </div>

              {["json", "csv", "xml"].includes(importFormat) && (
                <div className="space-y-2">
                  <Label htmlFor="import-data">Or Paste {importFormat.toUpperCase()} Data</Label>
                  <Textarea
                    id="import-data"
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder={`Paste your ${importFormat.toUpperCase()} data here...`}
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>
              )}

              {isProcessing && (
                <div className="space-y-2">
                  <Label>Processing</Label>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              <Button onClick={handleImport} className="w-full" disabled={isProcessing}>
                <Upload className="h-4 w-4 mr-2" />
                Import Elements
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

