// Utility functions for data conversion between formats

/**
 * Convert JSON data to CSV format
 * @param jsonData Array of objects to convert to CSV
 * @returns CSV string
 */
export function convertJsonToCsv(jsonData: any[]): string {
  if (!Array.isArray(jsonData) || jsonData.length === 0) {
    return ""
  }

  // Get headers from the first object
  const headers = Object.keys(jsonData[0])

  // Create CSV header row
  let csv = headers.join(",") + "\n"

  // Add data rows
  jsonData.forEach((item) => {
    const row = headers.map((header) => {
      const value = item[header]

      // Handle different value types
      if (value === null || value === undefined) {
        return ""
      } else if (typeof value === "object") {
        // Convert objects to JSON strings
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`
      } else if (typeof value === "string") {
        // Escape quotes in strings
        return `"${value.replace(/"/g, '""')}"`
      } else {
        return value
      }
    })

    csv += row.join(",") + "\n"
  })

  return csv
}

/**
 * Convert CSV data to JSON format
 * @param csvData CSV string to convert to JSON
 * @returns Array of objects
 */
export function convertCsvToJson(csvData: string): any[] {
  if (!csvData.trim()) {
    return []
  }

  // Split into rows
  const rows = csvData.split(/\r?\n/)

  // Extract headers
  const headers = rows[0].split(",").map((header) => header.trim())

  // Process data rows
  const jsonData = []

  for (let i = 1; i < rows.length; i++) {
    if (!rows[i].trim()) continue

    const row = rows[i]
    const values = parseCSVRow(row)

    if (values.length !== headers.length) {
      console.warn(`Row ${i} has ${values.length} values, expected ${headers.length}`)
      continue
    }

    const obj: Record<string, any> = {}

    headers.forEach((header, index) => {
      let value = values[index]

      // Try to parse JSON objects
      if (value && value.startsWith("{") && value.endsWith("}")) {
        try {
          value = JSON.parse(value)
        } catch (e) {
          // Keep as string if parsing fails
        }
      }

      obj[header] = value
    })

    jsonData.push(obj)
  }

  return jsonData
}

/**
 * Parse a CSV row, handling quoted values correctly
 * @param row CSV row to parse
 * @returns Array of values
 */
function parseCSVRow(row: string): string[] {
  const values: string[] = []
  let currentValue = ""
  let inQuotes = false

  for (let i = 0; i < row.length; i++) {
    const char = row[i]

    if (char === '"') {
      // Check if this is an escaped quote
      if (i + 1 < row.length && row[i + 1] === '"') {
        currentValue += '"'
        i++ // Skip the next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      // End of value
      values.push(currentValue)
      currentValue = ""
    } else {
      // Add character to current value
      currentValue += char
    }
  }

  // Add the last value
  values.push(currentValue)

  return values
}

/**
 * Convert JSON data to XML format
 * @param jsonData Object or array to convert to XML
 * @param rootElement Name of the root XML element
 * @returns XML string
 */
export function convertJsonToXml(jsonData: any, rootElement = "root"): string {
  // Start with XML declaration
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'

  // Add root element
  xml += `<${rootElement}>\n`

  // Convert JSON to XML elements
  if (Array.isArray(jsonData)) {
    // Handle array
    jsonData.forEach((item, index) => {
      xml += `  <item index="${index}">\n`
      xml += jsonToXmlElements(item, 4)
      xml += `  </item>\n`
    })
  } else {
    // Handle object
    xml += jsonToXmlElements(jsonData, 2)
  }

  // Close root element
  xml += `</${rootElement}>`

  return xml
}

/**
 * Helper function to convert JSON object to XML elements
 * @param obj Object to convert
 * @param indent Indentation level
 * @returns XML string
 */
function jsonToXmlElements(obj: any, indent: number): string {
  let xml = ""
  const spaces = " ".repeat(indent)

  Object.entries(obj).forEach(([key, value]) => {
    // Skip null or undefined values
    if (value === null || value === undefined) {
      return
    }

    // Handle different value types
    if (Array.isArray(value)) {
      // Handle array
      xml += `${spaces}<${key}>\n`

      value.forEach((item, index) => {
        xml += `${spaces}  <item index="${index}">\n`

        if (typeof item === "object" && item !== null) {
          xml += jsonToXmlElements(item, indent + 4)
        } else {
          xml += `${spaces}    ${escapeXml(item)}\n`
        }

        xml += `${spaces}  </item>\n`
      })

      xml += `${spaces}</${key}>\n`
    } else if (typeof value === "object" && value !== null) {
      // Handle nested object
      xml += `${spaces}<${key}>\n`
      xml += jsonToXmlElements(value, indent + 2)
      xml += `${spaces}</${key}>\n`
    } else {
      // Handle primitive value
      xml += `${spaces}<${key}>${escapeXml(value)}</${key}>\n`
    }
  })

  return xml
}

/**
 * Escape special characters for XML
 * @param value Value to escape
 * @returns Escaped string
 */
function escapeXml(value: any): string {
  if (typeof value !== "string") {
    value = String(value)
  }

  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

/**
 * Convert XML data to JSON format
 * @param xmlData XML string to convert to JSON
 * @returns JSON object
 */
export function convertXmlToJson(xmlData: string): any {
  // This is a simplified implementation
  // In a real application, you would use a library like xml2js

  // For now, we'll use a simple regex-based approach
  // This is not a complete XML parser and has limitations

  // Remove XML declaration
  xmlData = xmlData.replace(/<\?xml.*?\?>/, "")

  // Find root element
  const rootMatch = xmlData.match(/<([^\s>]+)/)
  if (!rootMatch) {
    throw new Error("Invalid XML: No root element found")
  }

  const rootElement = rootMatch[1]

  // Remove root element tags
  xmlData = xmlData.replace(new RegExp(`<${rootElement}[^>]*>|</${rootElement}>`, "g"), "")

  // Parse the content
  return parseXmlContent(xmlData.trim())
}

/**
 * Parse XML content into JSON
 * @param content XML content to parse
 * @returns Parsed JSON object or array
 */
function parseXmlContent(content: string): any {
  const result: Record<string, any> = {}
  const itemsArray: any[] = []
  let isArray = false

  // Find all top-level elements
  const elementRegex = /<([^\s>]+)(?:\s+[^>]*)?>([\s\S]*?)<\/\1>/g
  let match

  while ((match = elementRegex.exec(content)) !== null) {
    const [fullMatch, tagName, innerContent] = match

    // Check if this is an array item
    if (tagName === "item") {
      isArray = true

      // Extract index attribute if present
      const indexMatch = fullMatch.match(/index="([^"]*)"/)
      const index = indexMatch ? Number.parseInt(indexMatch[1]) : itemsArray.length

      // Parse inner content
      const itemContent = innerContent.trim()

      if (itemContent.startsWith("<")) {
        // Nested elements
        itemsArray[index] = parseXmlContent(itemContent)
      } else {
        // Simple value
        itemsArray[index] = itemContent
      }
    } else {
      // Regular element
      if (innerContent.trim().startsWith("<")) {
        // Nested elements
        result[tagName] = parseXmlContent(innerContent)
      } else {
        // Simple value
        result[tagName] = innerContent.trim()
      }
    }
  }

  return isArray ? itemsArray : result
}

