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
              backgroundColor: "#1E1E1E",
              textColor: "#CCCCCC",
              lineNumberColor: "#555555",
              padding: 20,
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

