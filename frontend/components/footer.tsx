"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Github, Twitter, Linkedin } from "lucide-react"
import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

export default function Footer() {
  const footerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const logoRef = useRef<HTMLDivElement | null>(null)
  const linksRef = useRef<HTMLDivElement | null>(null)
  const socialRef = useRef<HTMLDivElement | null>(null)
  const copyrightRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    
    const ctx = gsap.context(() => {
      // Fade in the footer content with a staggered effect
      gsap.from([logoRef.current, linksRef.current, socialRef.current, copyrightRef.current], {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: contentRef.current,
          start: "top 90%",
        },
      })
      
      // Subtle hover animations for social buttons
      const socialButtons = document.querySelectorAll('.social-button');
      socialButtons.forEach(button => {
        button.addEventListener('mouseenter', () => {
          gsap.to(button, {
            y: -5,
            scale: 1.1,
            duration: 0.3,
            ease: "power2.out"
          });
        });
        
        button.addEventListener('mouseleave', () => {
          gsap.to(button, {
            y: 0,
            scale: 1,
            duration: 0.3,
            ease: "power2.out"
          });
        });
      });
      
      // Create glow effect
      const glowTimeline = gsap.timeline({ repeat: -1 });
      
      glowTimeline
        .to(".footer-bg-glow", { 
          opacity: 0.6, 
          x: "5%", 
          y: "5%", 
          duration: 15,
          ease: "sine.inOut" 
        })
        .to(".footer-bg-glow", { 
          opacity: 0.3, 
          x: "-5%", 
          y: "-5%", 
          duration: 15,
          ease: "sine.inOut" 
        });
    }, footerRef)
    
    return () => ctx.revert()
  }, [])

  return (
    <footer ref={footerRef} className="py-12 border-t border-white/10 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="footer-bg-glow absolute bottom-0 right-0 w-[60%] h-[70%] bg-primary/5 rounded-full blur-[150px] opacity-30 -z-10"></div>
      </div>
      
      <div ref={contentRef} className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div ref={logoRef} className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">AL</span>
              </div>
              <span className="font-bold text-xl">AutoLabDocs</span>
            </div>
            <p className="text-muted-foreground">
              Effortlessly convert your Jupyter notebooks to professional documents
            </p>
          </div>
          
          <div ref={linksRef} className="md:col-span-2 grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-3 text-lg">Product</h3>
              <ul className="space-y-2">
                <li className="hover:text-primary transition-colors duration-200">
                  <Link href="#features">Features</Link>
                </li>
                <li className="hover:text-primary transition-colors duration-200">
                  <Link href="#pricing">Pricing</Link>
                </li>
                <li className="hover:text-primary transition-colors duration-200">
                  <Link href="#">Documentation</Link>
                </li>
                <li className="hover:text-primary transition-colors duration-200">
                  <Link href="#">Releases</Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 text-lg">Support</h3>
              <ul className="space-y-2">
                <li className="hover:text-primary transition-colors duration-200">
                  <Link href="#">Help Center</Link>
                </li>
                <li className="hover:text-primary transition-colors duration-200">
                  <Link href="#">FAQ</Link>
                </li>
                <li className="hover:text-primary transition-colors duration-200">
                  <Link href="#">Contact</Link>
                </li>
                <li className="hover:text-primary transition-colors duration-200">
                  <Link href="#">Privacy</Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div ref={socialRef} className="md:col-span-1">
            <h3 className="font-semibold mb-3 text-lg">Connect</h3>
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon" className="social-button rounded-full bg-foreground/5 hover:bg-foreground/10">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Button>
              <Button variant="ghost" size="icon" className="social-button rounded-full bg-foreground/5 hover:bg-foreground/10">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Button>
              <Button variant="ghost" size="icon" className="social-button rounded-full bg-foreground/5 hover:bg-foreground/10">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Button>
            </div>
          </div>
        </div>
        
        <div ref={copyrightRef} className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} AutoLabDocs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

