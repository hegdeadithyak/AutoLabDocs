"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileType, Loader2, Check, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

export default function UploadSection() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversionType, setConversionType] = useState<"docx" | "pdf" | null>(null)

  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const uploadRef = useRef(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 80%",
        },
      })

      gsap.from(uploadRef.current, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        delay: 0.2,
        scrollTrigger: {
          trigger: uploadRef.current,
          start: "top 80%",
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    // Check if the file is a .ipynb file
    if (!file.name.endsWith(".ipynb")) {
      setError("Please upload a valid .ipynb notebook file")
      return
    }

    setError(null)
    setFile(file)
  }

  const convertFile = async (type: "docx" | "pdf") => {
    if (!file) return

    setIsUploading(true)
    setError(null)
    setConversionType(type)

    try {
      const formData = new FormData()
      formData.append("file", file)

      // Use fetch to send the file to our API route
      const endpoint = type === "docx" ? "/api/convert" : "/api/convert-pdf"
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          // Don't set Content-Type when using FormData, browser will set it automatically with boundary
          "Accept": type === "docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "application/pdf",
        },
        body: formData,
      })

      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error;
        } catch (e) {
          errorMessage = `Failed to convert file to ${type.toUpperCase()} (Status: ${response.status})`;
        }
        throw new Error(errorMessage || `Failed to convert file to ${type.toUpperCase()}`);
      }

      // Get the blob from the response
      const blob = await response.blob()
      console.log("Received blob:", blob.type, blob.size);

      // Create a download link and trigger it programmatically
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = file.name.replace(".ipynb", `.${type}`)
      document.body.appendChild(a)
      a.click()
      
      // Small delay to ensure the download starts
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setIsComplete(true)
      setIsUploading(false)
    } catch (err: any) {
      console.error(`Error converting file to ${type}:`, err)
      setError(err.message || `Failed to convert file to ${type.toUpperCase()}`)
      setIsUploading(false)
    }
  }

  const resetUpload = () => {
    setFile(null)
    setIsComplete(false)
    setError(null)
    setConversionType(null)
    if (formRef.current) {
      formRef.current.reset()
    }
  }

  return (
    <section ref={sectionRef} className="py-20 bg-background">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <h2 ref={titleRef} className="text-3xl md:text-4xl font-bold mb-4">
            Try It Now
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your Colab notebook and see the magic happen.
          </p>
        </div>

        <div ref={uploadRef} className="max-w-2xl mx-auto">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form 
            ref={formRef}
            onSubmit={(e) => e.preventDefault()}
          >
            <Card
              className={`border-2 ${isDragging ? "border-primary" : "border-dashed border-border"} bg-card/50 backdrop-blur-sm transition-all duration-300`}
            >
              <CardContent className="p-6">
                {!file ? (
                  <div
                    className="flex flex-col items-center justify-center py-12"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                      <Upload className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Upload Your Notebook</h3>
                    <p className="text-muted-foreground text-center mb-6">
                      Drag and drop your .ipynb file here, or click to browse
                    </p>
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".ipynb"
                      onChange={handleFileChange}
                    />
                    <Button size="lg" type="button" onClick={() => document.getElementById("file-upload")?.click()}>
                      Browse Files
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                      {isUploading ? (
                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                      ) : isComplete ? (
                        <Check className="h-10 w-10 text-primary" />
                      ) : (
                        <FileType className="h-10 w-10 text-primary" />
                      )}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {isUploading ? "Processing..." : isComplete ? "Conversion Complete!" : file.name}
                    </h3>
                    <p className="text-muted-foreground text-center mb-6">
                      {isUploading
                        ? `Converting your notebook to ${conversionType?.toUpperCase()} format...`
                        : isComplete
                          ? "Your document has been downloaded"
                          : "Ready to convert this file"}
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                      {isComplete ? (
                        <Button variant="ghost" type="button" onClick={resetUpload}>
                          Upload Another
                        </Button>
                      ) : (
                        <>
                          <Button variant="default" type="button" disabled={isUploading} onClick={() => convertFile("docx")}>
                            {isUploading && conversionType === "docx" && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Convert to DOCX
                          </Button>
                          <Button variant="outline" type="button" disabled={isUploading} onClick={() => convertFile("pdf")}>
                            {isUploading && conversionType === "pdf" && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Convert to PDF
                          </Button>
                          <Button variant="ghost" type="button" onClick={resetUpload}>
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </section>
  )
}

