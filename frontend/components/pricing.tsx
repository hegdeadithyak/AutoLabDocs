"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

export default function Pricing() {
  const sectionRef = useRef(null)
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
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for occasional use",
      features: ["5 conversions per month", "Basic formatting options", "DOCX export", "Email support"],
      buttonText: "Get Started",
      buttonVariant: "outline",
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "/month",
      description: "For students and professionals",
      features: [
        "Unlimited conversions",
        "Advanced formatting options",
        "DOCX & PDF export",
        "Custom templates",
        "Priority support",
      ],
      buttonText: "Upgrade to Pro",
      buttonVariant: "default",
      highlighted: true,
    },
    {
      name: "Team",
      price: "$29.99",
      period: "/month",
      description: "For teams and organizations",
      features: [
        "Everything in Pro",
        "5 team members",
        "Team templates",
        "Admin dashboard",
        "API access",
        "24/7 support",
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outline",
    },
  ]

  return (
    <section ref={sectionRef} className="py-20 bg-background/50">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 ref={titleRef} className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that works best for your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              ref={addToCardsRef}
              className={`border ${plan.highlighted ? "border-primary shadow-lg shadow-primary/10" : "border-border/50"} transition-all duration-300 hover:shadow-lg`}
            >
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="flex items-baseline mt-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground ml-1">{plan.period}</span>}
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant={plan.buttonVariant} className="w-full">
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

