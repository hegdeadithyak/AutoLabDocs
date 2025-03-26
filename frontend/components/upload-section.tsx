"use client"

import { useCallback, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  LoaderCircle, 
  Upload, 
  FileWarning, 
  CheckCircle2, 
  Download, 
  AlertCircle,
  FileCode,
  FileText,
  Terminal,
  X,
  Plus,
  Trash2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

// Supported file types and their configurations
const SUPPORTED_FILE_TYPES = {
  'ipynb': { name: 'Jupyter Notebook', icon: FileCode, color: 'bg-blue-500' },
  'py': { name: 'Python', icon: FileCode, color: 'bg-green-500' },
  'java': { name: 'Java', icon: FileCode, color: 'bg-orange-500' },
  'cpp': { name: 'C++', icon: FileCode, color: 'bg-purple-500' },
  'c': { name: 'C', icon: FileCode, color: 'bg-purple-500' },
  'h': { name: 'C/C++ Header', icon: FileCode, color: 'bg-purple-500' },
  'hpp': { name: 'C++ Header', icon: FileCode, color: 'bg-purple-500' },
  'txt': { name: 'Text', icon: FileText, color: 'bg-gray-500' },
  'md': { name: 'Markdown', icon: FileText, color: 'bg-gray-500' },
}

type FileStatus = 'idle' | 'processing' | 'complete' | 'error';

interface UploadedFile {
  file: File;
  status: FileStatus;
  progress: number;
  errorMessage?: string;
  errorDetails?: string;
  outputUrl?: string;
  outputType?: 'docx' | 'pdf';
  detectedLanguage?: string;
}

export default function UploadSection() {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([])
  const [outputType, setOutputType] = useState<"docx" | "pdf">("docx")
  const [isProcessing, setIsProcessing] = useState(false)
  const [globalErrorMessage, setGlobalErrorMessage] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

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

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  const detectLanguage = (file: File): string => {
    const ext = getFileExtension(file.name);
    if (ext === 'ipynb') return 'jupyter';
    if (ext === 'py') return 'python';
    if (ext === 'java') return 'java';
    if (ext === 'cpp' || ext === 'c' || ext === 'h' || ext === 'hpp') return 'cpp';
    return 'unknown';
  }

  const processFiles = (files: FileList) => {
    const newFiles: UploadedFile[] = Array.from(files).map(file => ({
      file,
      status: 'idle',
      progress: 0,
      detectedLanguage: detectLanguage(file)
    }));
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files?.length) {
      processFiles(e.dataTransfer.files);
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      processFiles(e.target.files);
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const simulateProgress = (fileIndex: number) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress > 90) {
        progress = 90; // Hold at 90% until complete
        clearInterval(interval);
      }
      setSelectedFiles(prev => {
        const newFiles = [...prev];
        if (newFiles[fileIndex]) {
          newFiles[fileIndex].progress = progress;
        }
        return newFiles;
      });
    }, 300);
    
    return interval;
  };

  const processFile = async (fileIndex: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      newFiles[fileIndex].status = 'processing';
      newFiles[fileIndex].progress = 0;
      return newFiles;
    });

    const file = selectedFiles[fileIndex].file;
    const language = selectedFiles[fileIndex].detectedLanguage || 'unknown';
    
    const progressInterval = simulateProgress(fileIndex);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", language);
    formData.append("outputType", outputType);

    try {
      // Different endpoints based on file type
      let endpoint = '/api/convert';
      if (outputType === 'pdf') {
        endpoint = '/api/convert-pdf';
      }

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Error ${response.status}`;
        let errorDetails = errorText;
        
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error) {
            errorMessage = errorJson.error;
            errorDetails = errorJson.details || errorText;
          }
        } catch (e) {
          errorMessage = `Server error (${response.status})`;
          errorDetails = errorText.substring(0, 500);
        }
        
        setSelectedFiles(prev => {
          const newFiles = [...prev];
          newFiles[fileIndex].status = 'error';
          newFiles[fileIndex].errorMessage = errorMessage;
          newFiles[fileIndex].errorDetails = errorDetails;
          newFiles[fileIndex].progress = 0;
          return newFiles;
        });
        
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      setSelectedFiles(prev => {
        const newFiles = [...prev];
        newFiles[fileIndex].status = 'complete';
        newFiles[fileIndex].progress = 100;
        newFiles[fileIndex].outputUrl = url;
        newFiles[fileIndex].outputType = outputType;
        return newFiles;
      });
    } catch (error) {
      clearInterval(progressInterval);
      
      if (!selectedFiles[fileIndex]?.errorMessage) {
        setSelectedFiles(prev => {
          const newFiles = [...prev];
          if (newFiles[fileIndex]) {
            newFiles[fileIndex].status = 'error';
            newFiles[fileIndex].progress = 0;
            newFiles[fileIndex].errorMessage = error instanceof Error ? error.message : "Unknown error";
          }
          return newFiles;
        });
      }
    }
  }

  const processAllFiles = async () => {
    if (selectedFiles.length === 0 || isProcessing) return;
    
    setIsProcessing(true);
    setGlobalErrorMessage(null);
    
    try {
      // Process files sequentially to avoid overwhelming the server
      for (let i = 0; i < selectedFiles.length; i++) {
        if (selectedFiles[i].status === 'idle') {
          await processFile(i);
        }
      }
    } catch (error) {
      setGlobalErrorMessage(error instanceof Error ? error.message : "Failed to process files");
    } finally {
      setIsProcessing(false);
    }
  }

  const handleDownload = (url: string, fileName: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      // If there's an output URL, revoke it to free up memory
      if (newFiles[index]?.outputUrl) {
        URL.revokeObjectURL(newFiles[index].outputUrl as string);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  }

  const clearAllFiles = () => {
    // Revoke all object URLs
    selectedFiles.forEach(file => {
      if (file.outputUrl) {
        URL.revokeObjectURL(file.outputUrl);
      }
    });
    setSelectedFiles([]);
    setGlobalErrorMessage(null);
  }

  // Get file name without extension for download
  const getFileNameWithoutExtension = (fileName: string) => {
    return fileName.replace(/\.[^/.]+$/, "");
  }

  const getFileTypeLabel = (file: File) => {
    const ext = getFileExtension(file.name);
    return SUPPORTED_FILE_TYPES[ext as keyof typeof SUPPORTED_FILE_TYPES]?.name || 'Unknown';
  }

  const FileTypeIcon = (file: File) => {
    const ext = getFileExtension(file.name);
    const IconComponent = SUPPORTED_FILE_TYPES[ext as keyof typeof SUPPORTED_FILE_TYPES]?.icon || FileText;
    return <IconComponent className="h-5 w-5" />;
  }

  return (
    <section id="upload" className="py-20 relative">
      <div className="container px-4 mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
            Convert Your Code Files
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your code files to convert to beautifully formatted documents
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-8 mb-8 transition-all duration-300 bg-card/20 backdrop-blur-sm
              ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-card/30"}
              ${selectedFiles.length > 0 ? "bg-primary/5 border-primary/50" : ""}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              multiple
              className="sr-only"
            />

            {selectedFiles.length === 0 && (
              <div className="text-center py-10">
                <Upload className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-1">Drop your code files here</h3>
                <p className="text-muted-foreground mb-4">We support Python, Java, C++, and Jupyter Notebooks</p>
                <Button onClick={handleButtonClick} className="mb-4">
                  Select files
                </Button>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {Object.entries(SUPPORTED_FILE_TYPES).map(([ext, config]) => (
                    <Badge key={ext} variant="outline" className="text-xs">
                      {config.name} (.{ext})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {selectedFiles.length > 0 && (
              <div className="py-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Selected Files ({selectedFiles.length})</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleButtonClick}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" /> Add Files
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearAllFiles}
                      className="flex items-center gap-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" /> Clear All
                    </Button>
                  </div>
                </div>
                
                <ScrollArea className="h-[300px] rounded-md border">
                  <div className="p-4 space-y-3">
                    {selectedFiles.map((uploadedFile, index) => (
                      <div 
                        key={`${uploadedFile.file.name}-${index}`} 
                        className="flex items-start p-3 rounded-md border bg-card/50 relative"
                      >
                        <button 
                          onClick={() => removeFile(index)}
                          className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted-foreground/10"
                          aria-label="Remove file"
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                        
                        <div className="mr-3 mt-1">
                          {FileTypeIcon(uploadedFile.file)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col space-y-1">
                            <p className="font-medium truncate">{uploadedFile.file.name}</p>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <span className="mr-2">{getFileTypeLabel(uploadedFile.file)}</span>
                              <span>({(uploadedFile.file.size / 1024).toFixed(1)} KB)</span>
                              {uploadedFile.detectedLanguage && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  {uploadedFile.detectedLanguage}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {uploadedFile.status === 'processing' && (
                            <div className="mt-2">
                              <div className="w-full bg-muted rounded-full h-1.5 mb-1 overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full transition-all duration-300"
                                  style={{ width: `${uploadedFile.progress}%` }}
                                ></div>
                              </div>
                              <p className="text-xs text-muted-foreground">Processing...</p>
                            </div>
                          )}
                          
                          {uploadedFile.status === 'error' && (
                            <div className="mt-2">
                              <p className="text-xs text-destructive font-medium">
                                {uploadedFile.errorMessage || "Failed to process file"}
                              </p>
                            </div>
                          )}
                          
                          {uploadedFile.status === 'complete' && (
                            <div className="mt-2 flex gap-2">
                              <Button 
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={() => handleDownload(
                                  uploadedFile.outputUrl as string, 
                                  `${getFileNameWithoutExtension(uploadedFile.file.name)}.${uploadedFile.outputType}`
                                )}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download {uploadedFile.outputType?.toUpperCase()}
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-2 flex items-center">
                          {uploadedFile.status === 'idle' && (
                            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                          )}
                          {uploadedFile.status === 'processing' && (
                            <LoaderCircle className="h-4 w-4 text-primary animate-spin" />
                          )}
                          {uploadedFile.status === 'complete' && (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          )}
                          {uploadedFile.status === 'error' && (
                            <FileWarning className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                {globalErrorMessage && (
                  <div className="mt-4 p-3 bg-destructive/10 rounded-md text-destructive text-sm">
                    <div className="flex items-start">
                      <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
                      <p>{globalErrorMessage}</p>
                    </div>
                  </div>
                )}
                
                <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                  <div className="flex gap-2 items-center mb-4 sm:mb-0 justify-center">
                    <span className="text-sm font-medium">Output Format:</span>
                    <Button 
                      size="sm"
                      variant={outputType === "docx" ? "default" : "outline"}
                      onClick={() => setOutputType("docx")}
                      className="h-8"
                    >
                      DOCX
                    </Button>
                    <Button 
                      size="sm"
                      variant={outputType === "pdf" ? "default" : "outline"}
                      onClick={() => setOutputType("pdf")}
                      className="h-8"
                    >
                      PDF
                    </Button>
                  </div>
                  
                  <Button 
                    onClick={processAllFiles} 
                    disabled={isProcessing || selectedFiles.length === 0}
                    className={`${isProcessing ? "animate-pulse" : ""}`}
                  >
                    {isProcessing ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Terminal className="mr-2 h-4 w-4" />
                        Process All Files
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Files are processed locally with Docker containers for secure execution
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

