"use client"

import { useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, Sparkles, Code, FileOutput, Palette } from "lucide-react"

export default function Features() {
  const featuresRef = useRef<HTMLElement | null>(null)
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null)

  const features = [
    {
      title: "One-Click Conversion",
      description: "Transform your Colab notebooks into professional documents with a single click.",
      icon: <FileText className="card-icon h-10 w-10 text-primary" />,
    },
    {
      title: "Save Hours of Work",
      description: "No more manual screenshots or tedious formatting. Save time on every lab report.",
      icon: <Clock className="card-icon h-10 w-10 text-primary" />,
    },
    {
      title: "Code Formatting",
      description: "Automatically formats your code with syntax highlighting and proper indentation.",
      icon: <Code className="card-icon h-10 w-10 text-primary" />,
    },
    {
      title: "Multiple Formats",
      description: "Export to DOCX, PDF, or both formats simultaneously based on your needs.",
      icon: <FileOutput className="card-icon h-10 w-10 text-primary" />,
    },
    {
      title: "Custom Styling",
      description: "Choose from multiple themes and customize the look of your documents.",
      icon: <Palette className="card-icon h-10 w-10 text-primary" />,
    },
    {
      title: "Smart Processing",
      description: "Intelligently handles markdown, images, tables, and other Colab elements.",
      icon: <Sparkles className="card-icon h-10 w-10 text-primary" />,
    },
  ]

  return (
    <section ref={featuresRef} className="relative py-20 bg-background/50 overflow-hidden">
      {/* Background glowing elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="features-bg-glow-1 absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[150px] opacity-40 animate-glow-slow"></div>
        <div className="features-bg-glow-2 absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 rounded-full blur-[150px] opacity-50 animate-glow-reverse"></div>
      </div>

      <div className="container px-4 mx-auto relative z-10">
        <div className="text-center mb-16 animate-fadeIn">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-500 to-purple-500 animate-gradient">
            Powerful Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AutoLabDocs makes document conversion simple, fast, and beautiful.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:translate-y-[-10px] hover:shadow-lg animate-fadeIn`}
              style={{ animationDelay: `${index * 100}ms` }}
              onMouseEnter={() => setActiveCardIndex(index)}
              onMouseLeave={() => setActiveCardIndex(null)}
            >
              <CardHeader>
                <div className="mb-4 relative">
                  {feature.icon}
                  <div className={`absolute inset-0 scale-0 opacity-0 bg-primary/10 rounded-full blur-xl transition-all duration-300 ${
                    activeCardIndex === index ? 'scale-[1.5] opacity-80' : ''
                  }`}></div>
                </div>
                <CardTitle className="relative z-10">{feature.title}</CardTitle>
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

