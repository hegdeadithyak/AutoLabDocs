"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, FileText, FileType } from "lucide-react"
import gsap from "gsap"

export default function Hero() {
  const heroRef = useRef(null)
  const titleRef = useRef(null)
  const descriptionRef = useRef(null)
  const buttonRef = useRef(null)
  const imageRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial setup - hide elements
      gsap.set([titleRef.current, descriptionRef.current, buttonRef.current, imageRef.current], {
        opacity: 0,
        y: 20,
      })

      // Animation timeline
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

      tl.to(titleRef.current, { opacity: 1, y: 0, duration: 0.8 })
        .to(descriptionRef.current, { opacity: 1, y: 0, duration: 0.8 }, "-=0.4")
        .to(buttonRef.current, { opacity: 1, y: 0, duration: 0.8 }, "-=0.4")
        .to(imageRef.current, { opacity: 1, y: 0, duration: 0.8 }, "-=0.4")
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={heroRef} className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-background/80 z-0"></div>
      <div className="container px-4 mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1
              ref={titleRef}
              className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500"
            >
              Convert Colab to Docs in Seconds
            </h1>
            <p ref={descriptionRef} className="text-xl text-muted-foreground">
              AutoLabDocs transforms your Google Colab notebooks into beautifully formatted DOCX and PDF files with just
              a few clicks.
            </p>
            <div ref={buttonRef} className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="group">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
          <div
            ref={imageRef}
            className="relative bg-gradient-to-br from-primary/10 to-purple-500/10 p-6 rounded-2xl border border-border/50"
          >
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 backdrop-blur-sm flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <FileType className="h-16 w-16 text-primary" />
                  <FileText className="h-16 w-16 text-purple-500" />
                  <div className="h-2 w-16 bg-gradient-to-r from-primary to-purple-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-3 -right-3 h-24 w-24 bg-gradient-to-br from-primary to-purple-500 rounded-full blur-3xl opacity-30"></div>
          </div>
        </div>
      </div>
    </section>
  )
}

