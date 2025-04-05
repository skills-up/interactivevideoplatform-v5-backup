"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { Download, Upload, FileJson, FileSpreadsheet, FileCode } from "lucide-react"
import type { InteractiveElement } from "@/lib/api"
import { convertJsonToCsv, convertJsonToXml, convertCsvToJson, convertXmlToJson } from "@/lib/conversion-utils"

interface ImportExportProps {
  videoId: string
  interactiveElements: InteractiveElement[]
  onImport: (elements: InteractiveElement[]) => void
}

export function ImportExport({ videoId, interactiveElements, onImport }: ImportExportProps) {
  const [importFormat, setImportFormat] = useState<"json" | "csv" | "xml">("json")
  const [exportFormat, setExportFormat] = useState<"json" | "csv" | "xml">("json")
  const [importData, setImportData] = useState("")
  const { toast } = useToast()

  // Generate export data based on selected format
  const generateExportData = () => {
    try {
      // Remove internal fields that shouldn't be exported
      const cleanedElements = interactiveElements.map(({ id, videoId, createdAt, updatedAt, ...rest }) => ({
        ...rest,
        originalId: id, // Keep original ID as reference
      }))

      switch (exportFormat) {
        case "json":
          return JSON.stringify(cleanedElements, null, 2)
        case "csv":
          return convertJsonToCsv(cleanedElements)
        case "xml":
          return convertJsonToXml(cleanedElements, "interactiveElements")
        default:
          return JSON.stringify(cleanedElements, null, 2)
      }
    } catch (error) {
      console.error("Error generating export data:", error)
      toast({
        title: "Export Error",
        description: "Failed to generate export data",
        variant: "destructive",
      })
      return ""
    }
  }

  // Handle export button click
  const handleExport = () => {
    const data = generateExportData()
    if (!data) return

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
  const handleImport = () => {
    if (!importData.trim()) {
      toast({
        title: "Import Error",
        description: "Please provide data to import",
        variant: "destructive",
      })
      return
    }

    try {
      let parsedData

      switch (importFormat) {
        case "json":
          parsedData = JSON.parse(importData)
          break
        case "csv":
          parsedData = convertCsvToJson(importData)
          break
        case "xml":
          parsedData = convertXmlToJson(importData)
          break
        default:
          parsedData = JSON.parse(importData)
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

      onImport(processedData)

      setImportData("")
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
                  onValueChange={(value) => setExportFormat(value as "json" | "csv" | "xml")}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="json" id="export-json" />
                    <Label htmlFor="export-json" className="flex items-center">
                      <FileJson className="h-4 w-4 mr-2" />
                      JSON
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="csv" id="export-csv" />
                    <Label htmlFor="export-csv" className="flex items-center">
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      CSV
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="xml" id="export-xml" />
                    <Label htmlFor="export-xml" className="flex items-center">
                      <FileCode className="h-4 w-4 mr-2" />
                      XML
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="export-preview">Preview</Label>
                <Textarea
                  id="export-preview"
                  value={generateExportData()}
                  readOnly
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              <Button onClick={handleExport} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export {interactiveElements.length} Elements
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
                  onValueChange={(value) => setImportFormat(value as "json" | "csv" | "xml")}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="json" id="import-json" />
                    <Label htmlFor="import-json" className="flex items-center">
                      <FileJson className="h-4 w-4 mr-2" />
                      JSON
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="csv" id="import-csv" />
                    <Label htmlFor="import-csv" className="flex items-center">
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      CSV
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="xml" id="import-xml" />
                    <Label htmlFor="import-xml" className="flex items-center">
                      <FileCode className="h-4 w-4 mr-2" />
                      XML
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="import-data">Paste {importFormat.toUpperCase()} Data</Label>
                <Textarea
                  id="import-data"
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder={`Paste your ${importFormat.toUpperCase()} data here...`}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              <Button onClick={handleImport} className="w-full">
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

