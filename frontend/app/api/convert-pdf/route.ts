'use server';

import { type NextRequest, NextResponse } from "next/server"
import { createCanvas, registerFont } from "canvas"
import * as pdfkit from "pdfkit"
import { Readable } from "stream"
import path from 'path';
import fs from 'fs';

// Register a monospace font that will be available in all environments
try {
  // Try multiple possible font paths - Vercel might place them in different locations
  const possibleFontPaths = [
    path.join(process.cwd(), 'fonts', 'SourceCodePro-Regular.ttf'),
    path.join(process.cwd(), 'public', 'fonts', 'SourceCodePro-Regular.ttf'),
    path.join(process.cwd(), '.next', 'fonts', 'SourceCodePro-Regular.ttf'),
    path.join(process.cwd(), '.next', 'public', 'fonts', 'SourceCodePro-Regular.ttf')
  ];
  
  // Try each path until we find the font
  let fontLoaded = false;
  for (const fontPath of possibleFontPaths) {
    if (fs.existsSync(fontPath)) {
      registerFont(fontPath, { family: 'SourceCodePro' });
      console.log('Source Code Pro font registered successfully from:', fontPath);
      fontLoaded = true;
      break;
    }
  }
  
  if (!fontLoaded) {
    // Log more details for debugging
    console.log('Font file not found in any of the expected locations');
    console.log('Current working directory:', process.cwd());
    console.log('Directory contents:', fs.readdirSync(process.cwd()));
    console.log('Will fall back to system fonts');
  }
} catch (error) {
  console.error('Failed to register font:', error);
  // Continue execution even if font registration fails
}

/**
 * Generates a PNG buffer of a code snippet rendered with a dark background
 */
async function generateCodeImage(code: string, options: any = {}) {
  // Use registered font if available, otherwise fall back to system fonts
  const fontFamily = options.fontFamily || 'SourceCodePro, "Courier New", Courier, monospace';

  const {
    fontSize = 14,                      // Adjusted for better readability
    lineHeight = 22,                    // Adjusted line height for monospace
    backgroundColor = "#171C2E",        // Carbon.sh dark blue background
    textColor = "#FFFFFF",              // Brighter white text for better contrast
    lineNumberColor = "#6272A4",        // More visible line numbers
    syntaxColors = {
      keyword: "#FF79C6",      // Pink for keywords
      string: "#F1FA8C",       // Yellow for strings
      comment: "#6272A4",      // Blue-grey for comments
      function: "#50FA7B",     // Green for functions
      operator: "#FF79C6",     // Pink for operators
      variable: "#BD93F9",     // Purple for variables
      number: "#BD93F9",       // Purple for numbers
      property: "#8BE9FD",     // Cyan for properties
    },
    padding = 32,              // More padding for a more spacious look
    windowControlSize = 12,    // Size of window control dots
    cornerRadius = 10,         // Rounded corner radius
  } = options

  const lines = code.split("\n")
  const lineCount = lines.length

  // Create a temporary canvas context for measurements
  const tmpCanvas = createCanvas(0, 0)
  const tmpCtx = tmpCanvas.getContext("2d")
  tmpCtx.font = `${fontSize}px ${fontFamily}`

  // Compute the width needed for line numbers
  const lineNumbersWidth = tmpCtx.measureText(String(lines.length)).width + 40

  // Determine maximum width of code lines
  let maxWidth = 0
  for (const line of lines) {
    const textWidth = tmpCtx.measureText(line).width
    if (textWidth > maxWidth) maxWidth = textWidth
  }

  // Ensure a minimum width for very short lines
  maxWidth = Math.max(maxWidth, 300)

  // Window header height
  const headerHeight = 40
  
  // Calculate canvas dimensions - ensure reasonable proportions
  const canvasWidth = Math.min(Math.max(padding * 2 + lineNumbersWidth + maxWidth, 400), 1200) 
  // Adjust height based on line count but keep it reasonable
  const canvasHeight = padding * 2 + Math.min(lines.length, 50) * lineHeight + headerHeight
  
  // Create the final canvas
  const canvas = createCanvas(canvasWidth, canvasHeight)
  const ctx = canvas.getContext("2d")

  // Apply rounded corners - proper Carbon.sh look
  ctx.fillStyle = backgroundColor
  ctx.beginPath()
  ctx.moveTo(cornerRadius, 0)
  ctx.lineTo(canvasWidth - cornerRadius, 0)
  ctx.quadraticCurveTo(canvasWidth, 0, canvasWidth, cornerRadius)
  ctx.lineTo(canvasWidth, canvasHeight - cornerRadius)
  ctx.quadraticCurveTo(canvasWidth, canvasHeight, canvasWidth - cornerRadius, canvasHeight)
  ctx.lineTo(cornerRadius, canvasHeight)
  ctx.quadraticCurveTo(0, canvasHeight, 0, canvasHeight - cornerRadius)
  ctx.lineTo(0, cornerRadius)
  ctx.quadraticCurveTo(0, 0, cornerRadius, 0)
  ctx.closePath()
  ctx.fill()
  
  // Draw window header
  ctx.fillStyle = "#1A1E30" // Slightly lighter than background
  ctx.beginPath()
  ctx.moveTo(cornerRadius, 0)
  ctx.lineTo(canvasWidth - cornerRadius, 0)
  ctx.quadraticCurveTo(canvasWidth, 0, canvasWidth, cornerRadius)
  ctx.lineTo(canvasWidth, headerHeight)
  ctx.lineTo(0, headerHeight)
  ctx.lineTo(0, cornerRadius)
  ctx.quadraticCurveTo(0, 0, cornerRadius, 0)
  ctx.closePath()
  ctx.fill()
  
  // Add "ipynb" text to header like Carbon.sh filename
  ctx.fillStyle = "#6272A4"
  ctx.font = `${fontSize - 2}px ${fontFamily}`
  ctx.fillText("ipynb", canvasWidth / 2 - 20, headerHeight / 2 + 4)
  
  // Draw window control dots
  const dotColors = ["#FF5F56", "#FFBD2E", "#27C93F"] // Red, Yellow, Green
  const dotSpacing = windowControlSize * 2
  
  dotColors.forEach((color, i) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(padding + i * dotSpacing, headerHeight / 2, windowControlSize / 2, 0, Math.PI * 2)
    ctx.fill()
  })
  
  // NOTE: Grid pattern removed to improve text visibility
  
  // Set text properties
  ctx.font = `${fontSize}px ${fontFamily}`
  ctx.textBaseline = "top"

  // Create a vertical separator line between line numbers and code
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(padding + lineNumbersWidth - 15, headerHeight)
  ctx.lineTo(padding + lineNumbersWidth - 15, canvasHeight)
  ctx.stroke()

  // Render each line with line numbers and syntax highlighting
  const codeStartX = padding + lineNumbersWidth
  lines.forEach((line, index) => {
    const y = headerHeight + padding + index * lineHeight
    
    // Draw line number
    ctx.fillStyle = lineNumberColor
    const lineNumber = String(index + 1)
    ctx.fillText(lineNumber, padding + (lineNumbersWidth - 40) / 2, y)
    
    // Basic syntax highlighting with improved text clarity
    let x = codeStartX
    let segments = highlightSyntax(line, syntaxColors)
    
    for (const segment of segments) {
      ctx.fillStyle = segment.color
      // Add a subtle text shadow for better visibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
      ctx.shadowBlur = 2
      ctx.shadowOffsetX = 1
      ctx.shadowOffsetY = 1
      ctx.fillText(segment.text, x, y)
      ctx.shadowColor = 'transparent' // Reset shadow for next segment
      x += ctx.measureText(segment.text).width
    }
  })

  // Return the canvas as a PNG buffer
  return {
    buffer: canvas.toBuffer(),
    width: canvasWidth,
    height: canvasHeight,
    lineCount
  }
}

// Simple syntax highlighting helper
function highlightSyntax(line: string, colors: any) {
  // This is a very basic implementation
  // For production, you'd want a proper syntax parser
  const segments = []
  
  // Check for comments
  const commentStart = line.indexOf('//')
  if (commentStart !== -1) {
    if (commentStart > 0) {
      segments.push({
        text: line.substring(0, commentStart),
        color: colors.textColor
      })
    }
    segments.push({
      text: line.substring(commentStart),
      color: colors.comment
    })
    return segments
  }
  
  // Check for strings
  const stringRegex = /(['"`])(.*?)\1/g
  let stringMatch;
  let lastIndex = 0;
  
  // Find all string literals
  const matches = []
  while ((stringMatch = stringRegex.exec(line)) !== null) {
    matches.push({
      start: stringMatch.index,
      end: stringMatch.index + stringMatch[0].length,
      text: stringMatch[0],
      type: 'string'
    })
  }
  
  // Find keywords
  const keywordRegex = /\b(function|return|const|let|var|if|else|for|while|import|export|from|class|new|this)\b/g
  let keywordMatch;
  while ((keywordMatch = keywordRegex.exec(line)) !== null) {
    // Don't add if inside a string
    if (!isInsideRanges(keywordMatch.index, matches)) {
      matches.push({
        start: keywordMatch.index,
        end: keywordMatch.index + keywordMatch[0].length,
        text: keywordMatch[0],
        type: 'keyword'
      })
    }
  }
  
  // Sort matches by start position
  matches.sort((a, b) => a.start - b.start)
  
  // Create segments
  let currentPosition = 0
  for (const match of matches) {
    if (match.start > currentPosition) {
      segments.push({
        text: line.substring(currentPosition, match.start),
        color: colors.textColor
      })
    }
    
    segments.push({
      text: match.text,
      color: colors[match.type]
    })
    
    currentPosition = match.end
  }
  
  // Add remaining text
  if (currentPosition < line.length) {
    segments.push({
      text: line.substring(currentPosition),
      color: colors.textColor
    })
  }
  
  // If no segments were created, add the whole line
  if (segments.length === 0) {
    segments.push({
      text: line,
      color: colors.textColor
    })
  }
  
  return segments
}

function isInsideRanges(position: number, ranges: Array<{start: number, end: number}>) {
  for (const range of ranges) {
    if (position >= range.start && position < range.end) {
      return true
    }
  }
  return false
}

/**
 * Creates a PDF document from a notebook JSON
 */
async function createPdfFromNotebook(notebookData: any) {
  try {
    // Create a new PDF document
    const doc = new pdfkit.default({ margin: 50 })

    // Create a buffer to store the PDF
    const chunks: Buffer[] = []
    const stream = new Readable()

    stream._read = () => {}

    doc.on("data", (chunk: Buffer) => {
      chunks.push(chunk)
    })

    const pdfCompleted = new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => {
        try {
          const result = Buffer.concat(chunks)
          resolve(result)
        } catch (err) {
          reject(err)
        }
      })
      
      doc.on("error", (err) => {
        reject(err)
      })
    })

    // Add title
    doc.fontSize(24).text("Notebook Code Cells", { align: "center" })
    doc.moveDown(2)

    // Iterate through notebook cells and process code cells
    for (const cell of notebookData.cells) {
      if (cell.cell_type === "code") {
        const code = cell.source.join("")
        if (code.trim()) {
          try {
            // Generate a styled code image with Carbon.sh styling
            const imgResult = await generateCodeImage(code, {
              fontFamily: "SourceCodePro, 'Courier New', Courier, monospace",
              fontSize: 14,
              lineHeight: 22,
              backgroundColor: "#171C2E", // Carbon.sh dark blue background
              textColor: "#FFFFFF",       // Brighter white text
              lineNumberColor: "#6272A4", // More visible line numbers
              syntaxColors: {
                keyword: "#FF79C6",      // Pink for keywords
                string: "#F1FA8C",       // Yellow for strings
                comment: "#6272A4",      // Blue-grey for comments
                function: "#50FA7B",     // Green for functions
                operator: "#FF79C6",     // Pink for operators
                variable: "#BD93F9",     // Purple for variables
                number: "#BD93F9",       // Purple for numbers
                property: "#8BE9FD",     // Cyan for properties
              },
              padding: 32,               // More padding for a more spacious look
              windowControlSize: 12,     // Size of window control dots
              cornerRadius: 10,          // Rounded corner radius
            });

            // Scale image size based on line count
            // Keep the aspect ratio but limit size for both very small and very large code blocks
            const aspectRatio = imgResult.width / imgResult.height;
            
            // Calculate appropriate dimensions based on line count
            let fitWidth, fitHeight;
            
            if (imgResult.lineCount <= 5) {
              // Small code snippets
              fitWidth = 400;
            } else if (imgResult.lineCount <= 15) {
              // Medium code snippets
              fitWidth = 450;
            } else if (imgResult.lineCount <= 30) {
              // Larger code snippets
              fitWidth = 500;
            } else {
              // Very large code snippets
              fitWidth = 550;
            }
            
            fitHeight = fitWidth / aspectRatio;

            // Add the image to the PDF with appropriate sizing
            doc.image(imgResult.buffer, {
              fit: [fitWidth, fitHeight],
              align: "center",
            });

            doc.moveDown(2);
          } catch (err) {
            console.error("Error processing cell:", err);
            // Continue with other cells if one fails
          }
        }
      }
    }

    // Finalize the PDF
    doc.end()

    // Return the PDF buffer
    return pdfCompleted
  } catch (error) {
    console.error("Error creating PDF:", error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check if the file is a .ipynb file
    if (!file.name.endsWith(".ipynb")) {
      return NextResponse.json({ error: "File must be a .ipynb notebook" }, { status: 400 })
    }

    // Read the file content
    const fileContent = await file.text()
    const notebookData = JSON.parse(fileContent)

    // Generate the PDF document
    const pdfBuffer = await createPdfFromNotebook(notebookData)

    // Return the document as a downloadable file
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${file.name.replace(".ipynb", ".pdf")}"`,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Accept",
        "Cache-Control": "no-cache"
      },
    })
  } catch (error) {
    console.error("Error processing file:", error)
    return NextResponse.json({ error: "Failed to process notebook" }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
      "Access-Control-Max-Age": "86400" // 24 hours
    }
  })
}

