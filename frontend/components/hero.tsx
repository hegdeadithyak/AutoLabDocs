"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, FileText, FileType, Upload } from "lucide-react"

export default function Hero() {
  const heroRef = useRef<HTMLElement | null>(null)

  const scrollToUpload = () => {
    const uploadSection = document.getElementById('upload');
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section ref={heroRef} className="relative py-20 md:py-36 overflow-hidden bg-gradient-to-b from-background via-background/95 to-background/90">
      {/* Background gradient blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[100px] opacity-70"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[100px] opacity-70"></div>
        <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px] opacity-60"></div>
      </div>
      
      {/* Particles container */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Pre-positioned static particles for decoration */}
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-primary/30 rounded-full"></div>
        <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-purple-400/20 rounded-full"></div>
        <div className="absolute bottom-1/4 left-1/3 w-5 h-5 bg-indigo-400/20 rounded-full"></div>
        <div className="absolute top-2/3 right-1/4 w-3 h-3 bg-blue-400/20 rounded-full"></div>
        <div className="absolute top-1/2 left-2/3 w-4 h-4 bg-primary/20 rounded-full"></div>
      </div>

      <div className="container px-4 mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fadeIn">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-indigo-500 animate-gradient">
              Transform Colab to Docs in Seconds
            </h1>
            <p className="text-xl text-muted-foreground">
              AutoLabDocs transforms your Google Colab notebooks into beautifully formatted DOCX and PDF files with just
              a few clicks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                className="group relative overflow-hidden bg-gradient-to-r from-primary to-purple-600 hover:from-primary hover:to-purple-700 transition-all duration-300 shadow-lg hover:translate-y-[-2px]" 
                onClick={scrollToUpload}
              >
                <span className="relative z-10 flex items-center">
                  Upload Notebook
                  <Upload className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-[-2px]" />
                </span>
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-gray-400/30 shadow-sm hover:bg-white/5 hover:border-primary/50 transition-all duration-300 hover:translate-y-[-2px]"
              >
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="relative bg-gradient-to-br from-primary/5 to-purple-500/5 p-8 rounded-2xl border border-white/10 shadow-xl backdrop-blur-sm animate-fadeIn animation-delay-300 hover:translate-y-[-5px] transition-transform duration-300">
            <div className="absolute inset-0 bg-white/5 rounded-2xl"></div>
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 backdrop-blur-sm flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                  <FileType className="h-16 w-16 text-primary drop-shadow-md animate-float-slow" />
                  <FileText className="h-16 w-16 text-purple-500 drop-shadow-md animate-float-delayed" />
                  <div className="h-3 w-24 bg-gradient-to-r from-primary via-purple-500 to-indigo-500 rounded-full animate-pulse shadow-md"></div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-3 -right-3 h-32 w-32 bg-gradient-to-br from-primary to-purple-500 rounded-full blur-[50px] opacity-30 animate-pulse-slow"></div>
          </div>
        </div>
      </div>
    </section>
  )
}

