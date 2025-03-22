import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata = {
  title: "AutoLabDocs - Convert Colab to Docs in Seconds",
  description:
    "Transform your Google Colab notebooks into beautifully formatted DOCX and PDF files with just a few clicks.",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'