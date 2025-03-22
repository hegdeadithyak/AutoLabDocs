"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

export default function Pricing() {
  const pricingRef = useRef<HTMLElement | null>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const cardRefs = useRef<HTMLDivElement[]>([])
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  // Reset card refs on re-render
  cardRefs.current = []

  // Add to card refs array
  const addToCardRefs = (el: HTMLDivElement | null) => {
    if (el && !cardRefs.current.includes(el)) {
      cardRefs.current.push(el)
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

      // Cards animation with staggered effect
      gsap.from(cardRefs.current, {
        opacity: 0,
        y: 60,
        scale: 0.9,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardRefs.current[0],
          start: "top 85%",
        },
        onComplete: () => {
          // Highlight the premium plan after all cards are visible
          setTimeout(() => {
            if (cardRefs.current[1]) {
              gsap.to(cardRefs.current[1], {
                y: -15,
                boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.25)",
                borderColor: "rgba(99, 102, 241, 0.5)",
                duration: 0.5,
                ease: "power2.out"
              });
              
              // Animate the "most popular" badge
              gsap.fromTo('.popular-badge', 
                { opacity: 0, scale: 0, rotation: -5 },
                { opacity: 1, scale: 1, rotation: 0, duration: 0.6, ease: "back.out(1.7)", delay: 0.2 }
              );
            }
          }, 800);
        }
      });
      
      // Feature checks animation
      gsap.from('.feature-check', {
        scale: 0,
        opacity: 0,
        stagger: {
          each: 0.05,
          grid: "auto",
          from: "start"
        },
        duration: 0.4,
        ease: "back.out(1.7)",
        delay: 1
      });
      
      // Create glow effect
      const glowTimeline = gsap.timeline({ repeat: -1 });
      
      glowTimeline
        .to(".pricing-bg-glow", { 
          opacity: 0.7, 
          x: "5%", 
          y: "5%", 
          duration: 12,
          ease: "sine.inOut" 
        })
        .to(".pricing-bg-glow", { 
          opacity: 0.4, 
          x: "-5%", 
          y: "-5%", 
          duration: 12,
          ease: "sine.inOut" 
        });
    }, pricingRef)

    return () => ctx.revert()
  }, [])

  const handleMouseEnter = (index: number) => {
    if (isAnimating) return;
    
    setHoveredCard(index);
    setIsAnimating(true);
    
    gsap.to(cardRefs.current[index], {
      y: -10,
      scale: 1.02,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      duration: 0.3,
      ease: "power2.out",
      onComplete: () => setIsAnimating(false)
    });
    
    // Make other cards slightly fade out
    cardRefs.current.forEach((card, i) => {
      if (i !== index) {
        gsap.to(card, {
          opacity: 0.8,
          scale: 0.98,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    });
  }
  
  const handleMouseLeave = (index: number) => {
    if (isAnimating) return;
    
    setHoveredCard(null);
    setIsAnimating(true);
    
    // Reset all cards
    cardRefs.current.forEach((card, i) => {
      gsap.to(card, {
        y: i === 1 ? -15 : 0, // Keep the premium plan elevated
        opacity: 1,
        scale: 1,
        boxShadow: i === 1 ? "0 30px 60px -12px rgba(0, 0, 0, 0.25)" : "0 0 0 rgba(0, 0, 0, 0)",
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          if (i === index) {
            setIsAnimating(false);
          }
        }
      });
    });
  }

  const plans = [
    {
      name: "Free",
      price: "Free",
      description: "Basic features for testing and small projects.",
      features: [
        "5 file conversions per day",
        "Basic syntax highlighting",
        "Standard formats",
        "Manual downloads",
        "Community support",
      ],
      buttonText: "Get Started",
      highlighted: false,
    },
    {
      name: "Premium",
      price: "$9.99",
      period: "/month",
      description: "Advanced features for students and professionals.",
      features: [
        "Unlimited file conversions",
        "Enhanced syntax highlighting",
        "Priority processing",
        "Custom themes",
        "Email support",
        "Batch processing",
      ],
      buttonText: "Start Pro Trial",
      highlighted: true,
      badge: "Most Popular"
    },
    {
      name: "Team",
      price: "$24.99",
      period: "/month",
      description: "Enterprise-grade features for teams and organizations.",
      features: [
        "Everything in Premium",
        "Team collaboration",
        "Custom branding",
        "API access",
        "Priority support",
        "Usage analytics",
      ],
      buttonText: "Contact Sales",
      highlighted: false,
    },
  ]

  return (
    <section ref={pricingRef} className="py-20 relative overflow-hidden" id="pricing">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="pricing-bg-glow absolute top-1/2 left-1/4 w-[40%] h-[40%] bg-primary/5 rounded-full blur-[150px] opacity-50"></div>
      </div>
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 ref={titleRef} className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 animate-gradient">
            Simple Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose a plan that works for your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              ref={addToCardRefs}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={() => handleMouseLeave(index)}
              className={`border relative transition-all duration-300 backdrop-blur-sm
                ${plan.highlighted ? "border-primary/50 shadow-xl bg-card/70" : "border-white/10 bg-card/50"}
                ${hoveredCard === index ? "ring-2 ring-primary/20" : ""}
              `}
            >
              {plan.highlighted && (
                <div className="popular-badge absolute -top-3 -right-3 bg-primary text-white text-xs px-2 py-1 rounded-md transform rotate-0 shadow-lg">
                  {plan.badge}
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <span className="feature-check mr-2 mt-1 flex-shrink-0 rounded-full bg-primary/10 p-1">
                        <Check className="h-4 w-4 text-primary" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full relative overflow-hidden group ${
                    plan.highlighted 
                      ? "bg-gradient-to-r from-primary to-purple-500 hover:from-purple-500 hover:to-primary" 
                      : ""
                  }`}
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  <span className="relative z-10">{plan.buttonText}</span>
                  {plan.highlighted && (
                    <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

