import Hero from "@/components/hero"
import Features from "@/components/features"
import UploadSection from "@/components/upload-section"
import Pricing from "@/components/pricing"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Hero />
      <Features />
      <UploadSection />
      <Pricing />
      <Footer />
    </main>
  )
}

