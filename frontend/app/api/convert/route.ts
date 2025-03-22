import { type NextRequest, NextResponse } from "next/server"
import { createCanvas } from "canvas"
import { Document, Packer, Paragraph, ImageRun, HeadingLevel } from "docx"

/**
 * Generates a PNG buffer of a code snippet rendered with a dark background,
 * Carbon-inspired styling, and line numbers.
 */
async function generateCodeImage(code: string, options: any = {}) {
  const {
    fontFamily = "monospace",
    fontSize = 16,
    lineHeight = 24,
    backgroundColor = "#171C2E", // Carbon.sh dark blue background
    textColor = "#FFFFFF",       // Brighter white text for better contrast
    lineNumberColor = "#3A3A3A", // Darker line numbers
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

  // Create a temporary canvas context for measurements
  const tmpCanvas = createCanvas(0, 0)
  const tmpCtx = tmpCanvas.getContext("2d")
  tmpCtx.font = `${fontSize}px ${fontFamily}`

  // Compute the width needed for line numbers
  const lineNumbersWidth = tmpCtx.measureText(String(lines.length)).width + 30

  // Determine maximum width of code lines
  let maxWidth = 0
  for (const line of lines) {
    const textWidth = tmpCtx.measureText(line).width
    if (textWidth > maxWidth) maxWidth = textWidth
  }

  // Window header height
  const headerHeight = 40
  
  // Calculate canvas dimensions
  const canvasWidth = padding * 2 + lineNumbersWidth + maxWidth
  const canvasHeight = padding * 2 + lines.length * lineHeight + headerHeight

  // Create the final canvas
  const canvas = createCanvas(canvasWidth, canvasHeight)
  const ctx = canvas.getContext("2d")

  // Draw background with rounded corners (simulating by filling a rect and then drawing a border)
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  
  // Draw window header
  ctx.fillStyle = "#1A1E30" // Slightly lighter than background
  ctx.fillRect(0, 0, canvasWidth, headerHeight)
  
  // Draw window control dots
  const dotColors = ["#FF5F56", "#FFBD2E", "#27C93F"] // Red, Yellow, Green
  const dotSpacing = windowControlSize * 2
  
  dotColors.forEach((color, i) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(padding + i * dotSpacing, headerHeight / 2, windowControlSize / 2, 0, Math.PI * 2)
    ctx.fill()
  })
  
  // Draw a subtle grid pattern in the background for extra Carbon.sh effect
  ctx.strokeStyle = "rgba(255, 255, 255, 0.03)"
  ctx.lineWidth = 1
  const gridSize = 20
  
  for (let x = padding; x < canvasWidth - padding; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, headerHeight + padding)
    ctx.lineTo(x, canvasHeight - padding)
    ctx.stroke()
  }
  
  for (let y = headerHeight + padding; y < canvasHeight - padding; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(canvasWidth - padding, y)
    ctx.stroke()
  }

  // Set text properties
  ctx.font = `${fontSize}px ${fontFamily}`
  ctx.textBaseline = "top"

  // Render each line with line numbers and syntax highlighting
  const codeStartX = padding + lineNumbersWidth
  lines.forEach((line, index) => {
    const y = headerHeight + padding + index * lineHeight
    
    // Draw line number
    ctx.fillStyle = lineNumberColor
    const lineNumber = String(index + 1)
    ctx.fillText(lineNumber, padding, y)
    
    // Basic syntax highlighting (simplified)
    // In a real implementation, you would need a proper tokenizer
    let x = codeStartX
    let segments = highlightSyntax(line, syntaxColors)
    
    for (const segment of segments) {
      ctx.fillStyle = segment.color
      ctx.fillText(segment.text, x, y)
      x += ctx.measureText(segment.text).width
    }
  })

  // Return the canvas as a PNG buffer
  return canvas.toBuffer()
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
async function createDocxFromNotebook(notebookData: any) {
  try {
    // Create a new DOCX document with an initial heading
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: "Notebook Code Cells",
              heading: HeadingLevel.HEADING_1,
            }),
          ],
        },
      ],
    });

    // Create an array to hold all sections
    const sections = [];

    // Iterate through notebook cells and process code cells
    for (const cell of notebookData.cells) {
      if (cell.cell_type === "code") {
        const code = cell.source.join("");
        if (code.trim()) {
          try {
            // Generate a styled code image
            const imgBuffer = await generateCodeImage(code, {
              fontFamily: "monospace",
              fontSize: 16,
              lineHeight: 24,
              backgroundColor: "#171C2E", // Carbon.sh dark blue background
              textColor: "#FFFFFF",       // Brighter white text
              lineNumberColor: "#3A3A3A", // Darker line numbers
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

            // Create an ImageRun for the DOCX
            const imageRun = new ImageRun({
              data: imgBuffer,
              transformation: {
                width: 600,
                height: 300,
              },
            });

            // Create a paragraph to hold the image
            const imageParagraph = new Paragraph({
              children: [imageRun],
            });

            // Add to sections
            sections.push(imageParagraph);
            sections.push(new Paragraph(""));
          } catch (err) {
            console.error("Error processing cell:", err);
            // Continue with other cells if one fails
          }
        }
      }
    }

    // Add all sections to the document
    doc.addSection({
      properties: {},
      children: sections,
    });

    // Pack the DOCX document into a Buffer
    return await Packer.toBuffer(doc);
  } catch (error) {
    console.error("Error creating DOCX:", error);
    throw error;
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

