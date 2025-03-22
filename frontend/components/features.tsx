"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, Sparkles, Code, FileOutput, Palette } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

export default function Features() {
  const featuresRef = useRef(null)
  const titleRef = useRef(null)
  const cardsRef = useRef([])

  // Add to cards ref array
  const addToCardsRef = (el) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el)
    }
  }

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

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

      // Cards animation
      cardsRef.current.forEach((card, index) => {
        gsap.from(card, {
          opacity: 0,
          y: 50,
          duration: 0.6,
          delay: 0.2 * index,
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          },
        })
      })
    }, featuresRef)

    return () => ctx.revert()
  }, [])

  const features = [
    {
      title: "One-Click Conversion",
      description: "Transform your Colab notebooks into professional documents with a single click.",
      icon: <FileText className="h-10 w-10 text-primary" />,
    },
    {
      title: "Save Hours of Work",
      description: "No more manual screenshots or tedious formatting. Save time on every lab report.",
      icon: <Clock className="h-10 w-10 text-primary" />,
    },
    {
      title: "Code Formatting",
      description: "Automatically formats your code with syntax highlighting and proper indentation.",
      icon: <Code className="h-10 w-10 text-primary" />,
    },
    {
      title: "Multiple Formats",
      description: "Export to DOCX, PDF, or both formats simultaneously based on your needs.",
      icon: <FileOutput className="h-10 w-10 text-primary" />,
    },
    {
      title: "Custom Styling",
      description: "Choose from multiple themes and customize the look of your documents.",
      icon: <Palette className="h-10 w-10 text-primary" />,
    },
    {
      title: "Smart Processing",
      description: "Intelligently handles markdown, images, tables, and other Colab elements.",
      icon: <Sparkles className="h-10 w-10 text-primary" />,
    },
  ]

  return (
    <section ref={featuresRef} className="py-20 bg-background/50">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 ref={titleRef} className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AutoLabDocs makes document conversion simple, fast, and beautiful.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              ref={addToCardsRef}
              className="border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:border-primary/50"
            >
              <CardHeader>
                <div className="mb-4">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

