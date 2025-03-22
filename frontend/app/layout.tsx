import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Inter } from "next/font/google"
import { cn } from "@/lib/utils"
import { Metadata } from "next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AutoLabDocs - Convert Jupyter Notebooks to Beautiful Documents",
  description: "Transform your Jupyter notebooks to beautifully formatted DOCX and PDF documents with just a few clicks.",
  icons: {
    icon: [
      {
        url: "/autolabdocs_logo.svg",
        type: "image/svg+xml",
      },
      {
        url: "/favicon.ico",
        sizes: "any",
      }
    ],
    apple: {
      url: "/icons/apple-touch-icon.png",
      sizes: "180x180",
    },
  },
  manifest: "/manifest.json",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          .grid-background {
            background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpattern id='grid' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 20 0 L 0 0 0 20' stroke='white' stroke-width='0.5' opacity='0.2'/%3E%3C/pattern%3E%3Crect width='100' height='100' fill='url(%23grid)'/%3E%3C/svg%3E");
            background-repeat: repeat;
            opacity: 0.015;
          }
        ` }}></style>
      </head>
      <body className={cn(inter.className, "min-h-screen bg-background relative")}>
        {/* Animated background elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          {/* Main gradient backdrop */}
          <div className="absolute inset-0 bg-gradient-to-b from-background to-background/80"></div>
          
          {/* Large blurred circles */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] opacity-80 animate-float-slow"></div>
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[180px] opacity-70 animate-float-delayed"></div>
          
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 grid-background"></div>
        </div>
        
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}