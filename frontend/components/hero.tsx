"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, FileText, FileType, Upload } from "lucide-react"
import gsap from "gsap"

export default function Hero() {
  const heroRef = useRef<HTMLElement | null>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const descriptionRef = useRef<HTMLParagraphElement | null>(null)
  const buttonRef = useRef<HTMLDivElement | null>(null)
  const imageRef = useRef<HTMLDivElement | null>(null)
  const particlesRef = useRef<HTMLDivElement | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

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
        .to(imageRef.current, { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          onComplete: () => {
            createParticles();
          } 
        }, "-=0.4")

      // Create floating particles
      function createParticles() {
        if (!particlesRef.current) return;
        
        const particles = Array.from({ length: 20 }).map(() => {
          const particle = document.createElement('div');
          particle.className = 'absolute rounded-full';
          
          // Random size between 4px and 12px
          const size = 4 + Math.random() * 8;
          particle.style.width = `${size}px`;
          particle.style.height = `${size}px`;
          
          // Random color - primary or purple variants
          const colors = [
            'bg-primary/20', 'bg-primary/30', 'bg-purple-400/20', 
            'bg-purple-500/20', 'bg-indigo-400/20', 'bg-blue-400/20'
          ];
          particle.classList.add(colors[Math.floor(Math.random() * colors.length)]);
          
          // Random position within particles container
          particle.style.left = `${Math.random() * 100}%`;
          particle.style.top = `${Math.random() * 100}%`;
          
          particlesRef.current?.appendChild(particle);
          
          // Animate each particle
          gsap.to(particle, {
            x: `${-50 + Math.random() * 100}px`,
            y: `${-50 + Math.random() * 100}px`,
            opacity: Math.random() * 0.8 + 0.2,
            duration: 2 + Math.random() * 5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: Math.random() * 2
          });
          
          return particle;
        });
        
        return () => {
          particles.forEach(particle => particle.remove());
        };
      }
      
      // Add hover animations for buttons
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
          gsap.to(button, {
            scale: 1.05,
            duration: 0.3,
            ease: "power2.out"
          });
        });
        
        button.addEventListener('mouseleave', () => {
          gsap.to(button, {
            scale: 1,
            duration: 0.3,
            ease: "power2.out"
          });
        });
      });
      
      // Subtle animation for the hero image
      gsap.to(imageRef.current, {
        y: 15,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }, heroRef)

    // Parallax effect for mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      ctx.revert();
      window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [])

  useEffect(() => {
    if (!imageRef.current) return;
    
    // Subtle parallax effect based on mouse position
    gsap.to(imageRef.current, {
      x: mousePosition.x / 60,
      y: mousePosition.y / 60,
      duration: 1,
      ease: "power2.out"
    });
  }, [mousePosition]);

  const scrollToUpload = () => {
    const uploadSection = document.getElementById('upload-section');
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
      <div ref={particlesRef} className="absolute inset-0 z-0 pointer-events-none"></div>

      <div className="container px-4 mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1
              ref={titleRef}
              className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-indigo-500 animate-gradient"
            >
              Transform Colab to Docs in Seconds
            </h1>
            <p ref={descriptionRef} className="text-xl text-muted-foreground">
              AutoLabDocs transforms your Google Colab notebooks into beautifully formatted DOCX and PDF files with just
              a few clicks.
            </p>
            <div ref={buttonRef} className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="group relative overflow-hidden bg-gradient-to-r from-primary to-purple-600 hover:from-primary hover:to-purple-700 transition-all duration-300 shadow-lg" onClick={scrollToUpload}>
                <span className="relative z-10 flex items-center">
                  Upload Notebook
                  <Upload className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-[-2px]" />
                </span>
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
              </Button>
              <Button size="lg" variant="outline" className="border-gray-400/30 shadow-sm hover:bg-white/5 hover:border-primary/50 transition-all duration-300">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          <div
            ref={imageRef}
            className="relative bg-gradient-to-br from-primary/5 to-purple-500/5 p-8 rounded-2xl border border-white/10 shadow-xl backdrop-blur-sm"
          >
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

