import { type NextRequest, NextResponse } from "next/server"
import { createCanvas } from "canvas"
import * as pdfkit from "pdfkit"
import { Readable } from "stream"

/**
 * Generates a PNG buffer of a code snippet rendered with a dark background
 */
async function generateCodeImage(code: string, options: any = {}) {
  const {
    fontFamily = "monospace",
    fontSize = 16,
    lineHeight = 24,
    backgroundColor = "#1E1E1E",
    textColor = "#CCCCCC",
    lineNumberColor = "#555555",
    padding = 20,
  } = options

  const lines = code.split("\n")

  // Create a temporary canvas context for measurements
  const tmpCanvas = createCanvas(0, 0)
  const tmpCtx = tmpCanvas.getContext("2d")
  tmpCtx.font = `${fontSize}px ${fontFamily}`

  // Compute the width needed for line numbers
  const lineNumbersWidth = tmpCtx.measureText(String(lines.length)).width + 20

  // Determine maximum width of code lines
  let maxWidth = 0
  for (const line of lines) {
    const textWidth = tmpCtx.measureText(line).width
    if (textWidth > maxWidth) maxWidth = textWidth
  }

  const canvasWidth = padding * 2 + lineNumbersWidth + maxWidth
  const canvasHeight = padding * 2 + lines.length * lineHeight

  // Create the final canvas
  const canvas = createCanvas(canvasWidth, canvasHeight)
  const ctx = canvas.getContext("2d")

  // Draw background
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  // Set text properties
  ctx.font = `${fontSize}px ${fontFamily}`
  ctx.textBaseline = "top"

  // Render each line with line numbers
  const codeStartX = padding + lineNumbersWidth
  lines.forEach((line, index) => {
    const y = padding + index * lineHeight
    // Draw line number
    ctx.fillStyle = lineNumberColor
    const lineNumber = String(index + 1)
    ctx.fillText(lineNumber, padding, y)
    // Draw code text
    ctx.fillStyle = textColor
    ctx.fillText(line, codeStartX, y)
  })

  // Return the canvas as a PNG buffer
  return canvas.toBuffer()
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
            // Generate a styled code image
            const imgBuffer = await generateCodeImage(code, {
              fontFamily: "monospace",
              fontSize: 16,
              lineHeight: 24,
              backgroundColor: "#1E1E1E",
              textColor: "#CCCCCC",
              lineNumberColor: "#555555",
              padding: 20,
            })

            // Add the image to the PDF
            doc.image(imgBuffer, {
              fit: [500, 700],
              align: "center",
            })

            doc.moveDown(2)
          } catch (err) {
            console.error("Error processing cell:", err)
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

