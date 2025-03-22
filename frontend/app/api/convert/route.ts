'use server';

import { type NextRequest, NextResponse } from "next/server"
import { createCanvas, registerFont } from "canvas"
import { Document, Packer, Paragraph, ImageRun, HeadingLevel } from "docx"
import path from 'path';
import fs from 'fs';

// Register a monospace font that will be available in all environments
// First, try to load from a public directory if available
try {
  // Try to find and register the font
  const fontPath = path.join(process.cwd(), 'fonts', 'SourceCodePro-Regular.ttf');
  if (fs.existsSync(fontPath)) {
    registerFont(fontPath, { family: 'SourceCodePro' });
    console.log('Source Code Pro font registered successfully');
  } else {
    console.log('Source Code Pro font file not found, will fall back to default monospace');
  }
} catch (error) {
  console.error('Failed to register font:', error);
  // Continue execution even if font registration fails
}

/**
 * Generates a PNG buffer of a code snippet rendered with a dark background,
 * Carbon-inspired styling, and line numbers.
 */
async function generateCodeImage(code: string, options: any = {}) {
  // Use registered font if available, otherwise fall back to system monospace
  const fontFamily = options.fontFamily || 'SourceCodePro, monospace';

  const {
    fontSize = 14,                      // Adjusted for better monospace readability
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
 * Creates a DOCX document from a notebook JSON
 */
async function createDocxFromNotebook(notebook: any): Promise<Buffer> {
  // Generate all paragraphs first
  const documentChildren = [];
  
  // Convert cells to DOCX content
  for (const cell of notebook.cells) {
    if (cell.cell_type === "markdown") {
      const mdContent = cell.source.join("");
      
      // Add the markdown content as paragraphs
      const paragraph = new Paragraph({
        text: mdContent,
        spacing: {
          before: 200,
          after: 200
        }
      });
      
      // Add to document children array
      documentChildren.push(paragraph);
    } else if (cell.cell_type === "code") {
      const code = cell.source.join("");
      if (code.trim()) {
        // Get the code cell output image
        const imgResult = await generateCodeImage(code, {
          fontFamily: "SourceCodePro, monospace",
          fontSize: 14,
          lineHeight: 22,
          backgroundColor: "#171C2E",
          textColor: "#FFFFFF",
          lineNumberColor: "#6272A4",
          syntaxColors: {
            keyword: "#FF79C6",
            string: "#F1FA8C",
            comment: "#6272A4",
            function: "#50FA7B",
            operator: "#FF79C6",
            variable: "#BD93F9",
            number: "#BD93F9",
            property: "#8BE9FD",
          },
        });

        // Calculate the appropriate dimensions for the image
        let fitWidth = 600; // Default width
        let fitHeight;
        
        // Adjust size based on line count
        if (imgResult.lineCount <= 5) {
          fitWidth = 500; // Smaller width for small snippets
        } else if (imgResult.lineCount > 30) {
          fitWidth = 650; // Larger width for very large snippets
        }
        
        // Calculate height maintaining aspect ratio
        fitHeight = (imgResult.height / imgResult.width) * fitWidth;
        
        // Create a paragraph with image
        const paragraph = new Paragraph({
          spacing: {
            before: 200,
            after: 200
          },
          children: [
            new ImageRun({
              data: imgResult.buffer,
              transformation: {
                width: fitWidth,
                height: fitHeight
              },
              type: 'png'
            })
          ]
        });
        
        // Add to document children array
        documentChildren.push(paragraph);
      }
    }
  }
  
  // Create the document with all the content
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: documentChildren
      }
    ]
  });
  
  // Generate the DOCX file
  return await Packer.toBuffer(doc);
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

    // Generate the DOCX document
    const docxBuffer = await createDocxFromNotebook(notebookData)

    // Return the document as a downloadable file
    return new NextResponse(docxBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${file.name.replace(".ipynb", ".docx")}"`,
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


