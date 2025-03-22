import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Inter } from "next/font/google"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "AutoLabDocs - Convert Jupyter Notebooks to Beautiful Documents",
  description: "Transform your Jupyter notebooks to beautifully formatted DOCX and PDF documents with just a few clicks.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={cn(inter.className, "min-h-screen bg-background relative")}>
        {/* Animated background elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          {/* Main gradient backdrop */}
          <div className="absolute inset-0 bg-gradient-to-b from-background to-background/80"></div>
          
          {/* Large blurred circles */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] opacity-80 animate-float-slow"></div>
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[180px] opacity-70 animate-float-delayed"></div>
          
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[url(/grid.svg)] bg-repeat opacity-[0.015]"></div>
        </div>
        
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

import './globals.css'