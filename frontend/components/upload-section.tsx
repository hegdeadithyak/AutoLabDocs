"use client"

import { useCallback, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { LoaderCircle, Upload, FileWarning, CheckCircle2, Download, AlertCircle } from "lucide-react"

export default function UploadSection() {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [docxUrl, setDocxUrl] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [conversionType, setConversionType] = useState<"docx" | "pdf" | null>(null)
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [fileRejected, setFileRejected] = useState(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const progressRef = useRef<HTMLDivElement | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const processFile = (file: File) => {
    if (file.name.endsWith(".ipynb")) {
      setSelectedFile(file)
      setErrorMessage(null)
      setFileRejected(false)
    } else {
      setSelectedFile(null)
      setFileRejected(true)
      setErrorMessage("Only .ipynb files are accepted")
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      processFile(file)
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const file = e.target.files[0]
      processFile(file)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress > 90) {
        progress = 90; // Hold at 90% until complete
        clearInterval(interval);
      }
      setProgressPercentage(progress);
    }, 300);
    
    return interval;
  };

  const convertToFormat = async (format: "docx" | "pdf") => {
    if (!selectedFile) return

    setConversionType(format)
    setIsUploading(true)
    setIsComplete(false)
    setErrorMessage(null)
    setErrorDetails(null)
    setProgressPercentage(0)
    
    const progressInterval = simulateProgress();

    const formData = new FormData()
    formData.append("file", selectedFile)

    try {
      const response = await fetch(`/api/convert${format === "pdf" ? "-pdf" : ""}`, {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval);
      setProgressPercentage(100);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Error ${response.status}`;
        let errorDetails = errorText;
        
        try {
          // Try to parse the error as JSON
          const errorJson = JSON.parse(errorText);
          if (errorJson.error) {
            errorMessage = errorJson.error;
            errorDetails = errorJson.details || errorText;
          }
        } catch (e) {
          // Not JSON, use as is
          errorMessage = `Server error (${response.status})`;
          errorDetails = errorText.substring(0, 500); // Limit length
        }
        
        throw new Error(errorMessage);
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      if (format === "docx") {
        setDocxUrl(url)
      } else {
        setPdfUrl(url)
      }

      setIsUploading(false)
      setIsComplete(true)
    } catch (error) {
      clearInterval(progressInterval);
      setProgressPercentage(0);
      setIsUploading(false);
      
      if (error instanceof Error) {
        setErrorMessage(error.message);
        // Store any additional error details
        setErrorDetails(typeof error.cause === 'string' ? error.cause : null);
      } else {
        setErrorMessage("An unknown error occurred");
        setErrorDetails("The server may be experiencing technical difficulties. Please try again later.");
      }
    }
  }

  const handleDownload = (url: string, fileName: string) => {
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const resetFileSelection = () => {
    setSelectedFile(null)
    setIsUploading(false)
    setIsComplete(false)
    setErrorMessage(null)
    setErrorDetails(null)
    setDocxUrl(null)
    setPdfUrl(null)
    setConversionType(null)
    setProgressPercentage(0)
    setFileRejected(false)
  }

  // Get file name without extension
  const getFileNameWithoutExtension = () => {
    if (!selectedFile) return ""
    return selectedFile.name.replace(".ipynb", "")
  }

  return (
    <section id="upload" className="py-20 relative">
      <div className="container px-4 mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
            Convert Your Notebook
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Drag and drop your .ipynb file or click to upload
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-10 mb-8 transition-all duration-300 bg-card/20 backdrop-blur-sm
              ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-card/30"}
              ${selectedFile && !isUploading && !isComplete && !errorMessage ? "bg-primary/5 border-primary/50" : ""}
              ${isUploading ? "bg-primary/5 border-primary/50" : ""}
              ${isComplete ? "bg-success/5 border-success/50" : ""}
              ${errorMessage ? "bg-destructive/5 border-destructive/50" : ""}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".ipynb"
              className="sr-only"
            />

            {!selectedFile && !errorMessage && (
              <div className="text-center">
                <Upload className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-1">Drop your .ipynb file here</h3>
                <p className="text-muted-foreground mb-4">or</p>
                <Button onClick={handleButtonClick}>
                  Select file
                </Button>
              </div>
            )}

            {selectedFile && !isUploading && !isComplete && !errorMessage && (
              <div className="text-center">
                <Upload className="mx-auto h-16 w-16 text-primary mb-4" />
                <h3 className="text-xl font-medium mb-1 break-all">{selectedFile.name}</h3>
                <p className="text-muted-foreground mb-4">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
                  <Button 
                    onClick={() => convertToFormat("docx")} 
                    className="bg-indigo-500 hover:bg-indigo-600"
                  >
                    Convert to DOCX
                  </Button>
                  
                  <Button 
                    onClick={() => convertToFormat("pdf")}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    Convert to PDF
                  </Button>
                </div>
              </div>
            )}

            {isUploading && (
              <div className="text-center">
                <LoaderCircle className="mx-auto h-16 w-16 text-primary mb-4 animate-spin" />
                <h3 className="text-xl font-medium mb-1">
                  Converting to {conversionType === "docx" ? "DOCX" : "PDF"}...
                </h3>
                <p className="text-muted-foreground mb-4">This may take a moment</p>
                
                <div className="w-full bg-muted rounded-full h-2 mb-6 overflow-hidden">
                  <div 
                    ref={progressRef}
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}

            {isComplete && !isUploading && (
              <div className="text-center">
                <CheckCircle2 className="mx-auto h-16 w-16 text-success mb-4" />
                <h3 className="text-xl font-medium mb-1">Conversion Complete!</h3>
                <p className="text-muted-foreground mb-4">Your file is ready to download</p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
                  {conversionType === "docx" && docxUrl && (
                    <Button
                      onClick={() => handleDownload(docxUrl, `${getFileNameWithoutExtension()}.docx`)}
                      className="flex items-center gap-2 bg-primary/90 hover:bg-primary"
                    >
                      <Download className="h-4 w-4" />
                      Download DOCX
                    </Button>
                  )}
                  
                  {conversionType === "pdf" && pdfUrl && (
                    <Button
                      onClick={() => handleDownload(pdfUrl, `${getFileNameWithoutExtension()}.pdf`)}
                      className="flex items-center gap-2 bg-primary/90 hover:bg-primary"
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </Button>
                  )}
                  
                  <Button
                    onClick={resetFileSelection}
                    variant="outline"
                  >
                    Convert Another File
                  </Button>
                </div>
              </div>
            )}

            {(errorMessage || fileRejected) && (
              <div className="text-center">
                <FileWarning className="mx-auto h-16 w-16 text-destructive mb-4" />
                <h3 className="text-xl font-medium mb-1 text-destructive">Error</h3>
                <p className="text-muted-foreground mb-4">{errorMessage}</p>
                {errorDetails && (
                  <div className="mb-4 p-3 bg-destructive/5 rounded-md text-sm text-muted-foreground max-h-[200px] overflow-y-auto">
                    <pre className="text-left whitespace-pre-wrap break-words">{errorDetails}</pre>
                  </div>
                )}
                <Button
                  onClick={resetFileSelection}
                  variant="outline"
                  className="border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Your files are processed locally and never stored on any server
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

