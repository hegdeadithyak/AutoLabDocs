"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { LoaderCircle, Upload, FileWarning, CheckCircle2, Download, AlertCircle } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

export default function UploadSection() {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [docxUrl, setDocxUrl] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [conversionType, setConversionType] = useState<"docx" | "pdf" | null>(null)
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [fileRejected, setFileRejected] = useState(false)

  const uploadSectionRef = useRef<HTMLElement | null>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const uploadAreaRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const progressRef = useRef<HTMLDivElement | null>(null)
  const animationRef = useRef<gsap.core.Timeline | null>(null)
  const particlesContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    // Generate particles for the upload area background
    const createParticles = () => {
      if (!particlesContainerRef.current) return;
      
      particlesContainerRef.current.innerHTML = '';
      
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        const size = Math.random() * 5 + 2;
        
        gsap.set(particle, {
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: i % 2 === 0 ? 'rgba(99, 102, 241, 0.3)' : 'rgba(139, 92, 246, 0.3)',
          x: Math.random() * 100 + '%',
          y: Math.random() * 100 + '%',
          scale: 0,
          opacity: 0
        });
        
        particlesContainerRef.current.appendChild(particle);
        
        gsap.to(particle, {
          scale: 1,
          opacity: Math.random() * 0.7 + 0.3,
          duration: Math.random() * 2 + 1,
          ease: 'power2.out',
          delay: Math.random() * 2
        });
        
        gsap.to(particle, {
          x: `+=${(Math.random() - 0.5) * 40}%`,
          y: `+=${(Math.random() - 0.5) * 40}%`,
          duration: Math.random() * 10 + 10,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true
        });
      }
    };

    const ctx = gsap.context(() => {
      // Title animation
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 80%",
        },
      })

      // Upload area animation
      gsap.from(uploadAreaRef.current, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        delay: 0.2,
        scrollTrigger: {
          trigger: uploadAreaRef.current,
          start: "top 80%",
        },
        onComplete: createParticles,
      })
    }, uploadSectionRef)

    // Progress animation
    if (isUploading && progressRef.current) {
      // Kill previous animation if it exists
      if (animationRef.current) {
        animationRef.current.kill();
      }
      
      // Animate progress bar
      const tl = gsap.timeline();
      tl.fromTo(progressRef.current, 
        { width: "0%" }, 
        { 
          width: `${progressPercentage}%`, 
          duration: 1.5, 
          ease: "power2.inOut" 
        }
      );
      
      animationRef.current = tl;
    }

    // Success animation
    if (isComplete && !isUploading) {
      gsap.fromTo('.success-icon', 
        { scale: 0, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
      );
      
      gsap.fromTo('.download-button', 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, delay: 0.3, ease: "power2.out" }
      );
    }

    // Error animation
    if (errorMessage) {
      gsap.fromTo('.error-container', 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    }

    return () => ctx.revert()
  }, [isUploading, isComplete, errorMessage, progressPercentage])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    
    // Add pulsing effect
    if (uploadAreaRef.current) {
      gsap.to(uploadAreaRef.current, {
        boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.4)",
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    // Remove pulsing effect
    if (uploadAreaRef.current) {
      gsap.to(uploadAreaRef.current, {
        boxShadow: "0 0 0 1px rgba(99, 102, 241, 0.1)",
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  }, [])

  const processFile = (file: File) => {
    if (file.name.endsWith(".ipynb")) {
      setSelectedFile(file)
      setErrorMessage(null)
      setFileRejected(false)
      
      // Show file accepted animation
      gsap.fromTo('.file-icon', 
        { scale: 0, rotation: -30 }, 
        { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(1.7)" }
      );
    } else {
      setSelectedFile(null)
      setFileRejected(true)
      setErrorMessage("Only .ipynb files are accepted")
      
      // Show file rejected animation
      gsap.timeline()
        .fromTo('.file-warning', 
          { scale: 0 }, 
          { scale: 1, duration: 0.5, ease: "back.out(1.7)" }
        )
        .to('.file-warning', 
          { rotation: '+=10', duration: 0.1, ease: "power1.inOut" }
        )
        .to('.file-warning', 
          { rotation: '-=20', duration: 0.2, ease: "power1.inOut" }
        )
        .to('.file-warning', 
          { rotation: '+=10', duration: 0.1, ease: "power1.inOut" }
        );
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    // Remove pulsing effect
    if (uploadAreaRef.current) {
      gsap.to(uploadAreaRef.current, {
        boxShadow: "0 0 0 1px rgba(99, 102, 241, 0.1)",
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    }

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
        throw new Error(`Error ${response.status}: ${await response.text()}`)
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
      setIsUploading(false)
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred")
    }
  }

  const handleDownload = (url: string, fileName: string) => {
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    // Animate download button
    gsap.fromTo('.download-icon', 
      { y: 0 }, 
      { 
        y: 10, 
        duration: 0.3, 
        ease: "power2.inOut",
        yoyo: true,
        repeat: 1
      }
    );
  }

  const resetFileSelection = () => {
    setSelectedFile(null)
    setIsUploading(false)
    setIsComplete(false)
    setErrorMessage(null)
    setDocxUrl(null)
    setPdfUrl(null)
    setConversionType(null)
    setProgressPercentage(0)
    setFileRejected(false)
    
    // Create a new animation for resetting
    gsap.fromTo(uploadAreaRef.current, 
      { opacity: 0.5 }, 
      { opacity: 1, duration: 0.5, ease: "power2.inOut" }
    );
    
    if (particlesContainerRef.current) {
      gsap.to(particlesContainerRef.current.children, {
        scale: 0,
        opacity: 0,
        stagger: 0.02,
        duration: 0.5,
        onComplete: () => {
          const ctx = gsap.context(() => {
            if (particlesContainerRef.current) {
              particlesContainerRef.current.innerHTML = '';
            }
          });
          ctx.revert();
        }
      });
    }
  }

  // Get file name without extension
  const getFileNameWithoutExtension = () => {
    if (!selectedFile) return ""
    return selectedFile.name.replace(".ipynb", "")
  }

  return (
    <section id="upload" ref={uploadSectionRef} className="py-20 relative">
      <div className="container px-4 mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 ref={titleRef} className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 animate-gradient">
            Convert Your Notebook
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Drag and drop your .ipynb file or click to upload
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div
            ref={uploadAreaRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-10 mb-8 transition-all duration-300 overflow-hidden bg-card/20 backdrop-blur-sm
              ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-card/30"}
              ${selectedFile && !isUploading && !isComplete && !errorMessage ? "bg-primary/5 border-primary/50" : ""}
              ${isUploading ? "bg-primary/5 border-primary/50" : ""}
              ${isComplete ? "bg-success/5 border-success/50" : ""}
              ${errorMessage ? "bg-destructive/5 border-destructive/50" : ""}
            `}
          >
            {/* Particles container */}
            <div ref={particlesContainerRef} className="absolute inset-0 pointer-events-none"></div>
            
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".ipynb"
              className="sr-only"
            />

            {!selectedFile && !errorMessage && (
              <div className="text-center">
                <Upload className="mx-auto h-16 w-16 text-muted-foreground mb-4 animate-float-slow" />
                <h3 className="text-xl font-medium mb-1">Drop your .ipynb file here</h3>
                <p className="text-muted-foreground mb-4">or</p>
                <Button onClick={handleButtonClick} className="animate-pulse-slow">
                  Select file
                </Button>
              </div>
            )}

            {selectedFile && !isUploading && !isComplete && !errorMessage && (
              <div className="text-center">
                <div className="file-icon">
                  <Upload className="mx-auto h-16 w-16 text-primary mb-4" />
                </div>
                <h3 className="text-xl font-medium mb-1 break-all">{selectedFile.name}</h3>
                <p className="text-muted-foreground mb-4">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
                  <Button 
                    onClick={() => convertToFormat("docx")} 
                    className="relative overflow-hidden group bg-indigo-500 hover:bg-indigo-600"
                  >
                    <span className="relative z-10">Convert to DOCX</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  </Button>
                  
                  <Button 
                    onClick={() => convertToFormat("pdf")}
                    className="relative overflow-hidden group bg-purple-500 hover:bg-purple-600"
                  >
                    <span className="relative z-10">Convert to PDF</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
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
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}

            {isComplete && !isUploading && (
              <div className="text-center">
                <CheckCircle2 className="success-icon mx-auto h-16 w-16 text-success mb-4" />
                <h3 className="text-xl font-medium mb-1">Conversion Complete!</h3>
                <p className="text-muted-foreground mb-4">Your file is ready to download</p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
                  {conversionType === "docx" && docxUrl && (
                    <Button
                      onClick={() => handleDownload(docxUrl, `${getFileNameWithoutExtension()}.docx`)}
                      className="download-button flex items-center gap-2 bg-primary/90 hover:bg-primary"
                    >
                      <Download className="download-icon h-4 w-4" />
                      Download DOCX
                    </Button>
                  )}
                  
                  {conversionType === "pdf" && pdfUrl && (
                    <Button
                      onClick={() => handleDownload(pdfUrl, `${getFileNameWithoutExtension()}.pdf`)}
                      className="download-button flex items-center gap-2 bg-primary/90 hover:bg-primary"
                    >
                      <Download className="download-icon h-4 w-4" />
                      Download PDF
                    </Button>
                  )}
                  
                  <Button
                    onClick={resetFileSelection}
                    variant="outline"
                    className="download-button"
                  >
                    Convert Another File
                  </Button>
                </div>
              </div>
            )}

            {(errorMessage || fileRejected) && (
              <div className="error-container text-center">
                <FileWarning className="file-warning mx-auto h-16 w-16 text-destructive mb-4" />
                <h3 className="text-xl font-medium mb-1 text-destructive">Error</h3>
                <p className="text-muted-foreground mb-4">{errorMessage}</p>
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

