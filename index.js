const fs = require("fs");
const { createCanvas, registerFont } = require("canvas");
const { Document, Packer, Paragraph, ImageRun, HeadingLevel } = require("docx");

// (Optional) Register a custom monospaced font if desired.
// Uncomment and adjust the following line if you have a local TTF file for a font like Fira Code:
// registerFont('path/to/FiraCode-Regular.ttf', { family: 'Fira Code' });

/**
 * Generates a PNG buffer of a code snippet rendered with a dark background,
 * Carbon-inspired styling, and line numbers.
 *
 * @param {string} code - The code to render.
 * @param {object} options - Optional styling options.
 * @returns {Buffer} - PNG image buffer.
 */
async function generateCodeImage(code, options = {}) {
    const {
        fontFamily = "monospace",     // Use a monospaced font (or "Fira Code" if registered)
        fontSize = 16,
        lineHeight = 24,
        backgroundColor = "#1E1E1E",    // Dark background similar to Carbon
        textColor = "#CCCCCC",          // Light gray code text
        lineNumberColor = "#555555",    // Gray line numbers
        padding = 20,
    } = options;
    
    const lines = code.split("\n");
    
    // Create a temporary canvas context for measurements.
    const tmpCanvas = createCanvas(0, 0);
    const tmpCtx = tmpCanvas.getContext("2d");
    tmpCtx.font = `${fontSize}px ${fontFamily}`;
    // Compute the width needed for line numbers (reserve some extra space)
    const lineNumbersWidth = tmpCtx.measureText(String(lines.length)).width + 20;
    
    // Determine maximum width of code lines.
    let maxWidth = 0;
    for (const line of lines) {
        const textWidth = tmpCtx.measureText(line).width;
        if (textWidth > maxWidth) maxWidth = textWidth;
    }
    
    const canvasWidth = padding * 2 + lineNumbersWidth + maxWidth;
    const canvasHeight = padding * 2 + lines.length * lineHeight;
    
    // Create the final canvas.
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");
    
    // Draw background.
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Set text properties.
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textBaseline = "top";
    
    // Render each line with line numbers.
    const codeStartX = padding + lineNumbersWidth;
    lines.forEach((line, index) => {
        const y = padding + index * lineHeight;
        // Draw line number.
        ctx.fillStyle = lineNumberColor;
        const lineNumber = String(index + 1);
        ctx.fillText(lineNumber, padding, y);
        // Draw code text.
        ctx.fillStyle = textColor;
        ctx.fillText(line, codeStartX, y);
    });
    
    // Return the canvas as a PNG buffer.
    return canvas.toBuffer();
}

async function createDocxFromNotebook() {
    const notebookPath = "FPGA.ipynb";
    // Read and parse the IPython Notebook.
    const notebookData = JSON.parse(fs.readFileSync(notebookPath, "utf-8"));

    // Create a new DOCX document with an initial heading.
    const doc = new Document({
        sections: [
            {
                children: [
                    new Paragraph({
                        text: "Notebook Code Cells",
                        heading: HeadingLevel.HEADING_1,
                    }),
                ],
            },
        ],
    });

    // Iterate through notebook cells and process code cells.
    for (const cell of notebookData.cells) {
        if (cell.cell_type === "code") {
            const code = cell.source.join("");
            if (code.trim()) {
                // Generate a styled code image.
                const imgBuffer = await generateCodeImage(code, {
                    // You can adjust options here if needed.
                    fontFamily: "monospace", // or "Fira Code" if registered
                    fontSize: 16,
                    lineHeight: 24,
                    backgroundColor: "#1E1E1E",
                    textColor: "#CCCCCC",
                    lineNumberColor: "#555555",
                    padding: 20,
                });

                // Create an ImageRun for the DOCX. Adjust dimensions as needed.
                const imageRun = new ImageRun({
                    data: imgBuffer,
                    transformation: {
                        width: 600,
                        // Scale height proportionally; here we set a fixed height for demonstration.
                        height: 200,
                    },
                });

                // Create a paragraph to hold the image.
                const imageParagraph = new Paragraph({
                    children: [imageRun],
                });

                // Add the image and a spacer paragraph.
                doc.addSection({
                    children: [imageParagraph, new Paragraph("")],
                });
            }
        }
    }

    // Pack the DOCX document into a Buffer.
    const buffer = await Packer.toBuffer(doc);

    // For demonstration, write the DOCX to disk.
    fs.writeFileSync("Notebook_Code_Cells.docx", buffer);
    console.log("Saved DOCX file: Notebook_Code_Cells.docx");

    // If you want to directly upload, you can use the `buffer` variable.
}

createDocxFromNotebook().catch((err) => console.error(err));
