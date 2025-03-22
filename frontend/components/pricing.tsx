"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

export default function Pricing() {
  const pricingRef = useRef<HTMLElement | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const tiers = [
    {
      name: "Free",
      price: "$0",
      description:
        "Perfect for students and occasional use",
      features: [
        "10 conversions per month",
        "Basic document formatting",
        "Export to DOCX format",
        "Standard code highlighting",
        "Email support",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      price: "$9",
      period: "/month",
      description:
        "Ideal for frequent users and professionals",
      features: [
        "Unlimited conversions",
        "Advanced document formatting",
        "Export to DOCX and PDF formats",
        "Premium code highlighting",
        "Priority email support",
        "Custom document templates",
        "Batch processing",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Team",
      price: "$49",
      period: "/month",
      description:
        "Best for teams and organizations",
      features: [
        "Everything in Pro",
        "25 team members",
        "Team-specific templates",
        "Administrative dashboard",
        "Usage analytics",
        "Dedicated account manager",
        "API access",
        "Custom integrations",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ]

  return (
    <section ref={pricingRef} id="pricing" className="py-20 relative overflow-hidden">
      {/* Background element */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="pricing-bg-glow-1 absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[150px] opacity-60 animate-glow-slow"></div>
        <div className="pricing-bg-glow-2 absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-purple-700/5 rounded-full blur-[150px] opacity-50 animate-glow-reverse"></div>
      </div>

      <div className="container px-4 mx-auto relative z-10">
        <div className="mb-16 text-center animate-fadeIn">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-500 to-purple-500 animate-gradient">
            Choose Your Plan
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select a plan that fits your needs. All plans include our core features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`animate-fadeIn`}
              style={{ animationDelay: `${index * 100}ms` }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Card
                className={`h-full border relative transition-all duration-300 ${
                  tier.popular 
                    ? "border-primary/50 bg-gradient-to-b from-primary/10 to-transparent shadow-lg" 
                    : "border-white/10 bg-white/5 backdrop-blur-sm hover:border-primary/30 hover:shadow-md"
                } ${hoveredIndex === index ? "translate-y-[-8px]" : ""}`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 px-4 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-bl-lg rounded-tr-md">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="mt-2 flex items-baseline">
                    <span className="text-4xl font-extrabold">{tier.price}</span>
                    {tier.period && <span className="text-muted-foreground ml-2">{tier.period}</span>}
                  </div>
                  <CardDescription className="mt-2">{tier.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="h-4 w-4 text-primary mr-3" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    variant={tier.popular ? "default" : "outline"}
                    className={`w-full ${
                      tier.popular ? "" : "hover:bg-primary hover:text-white"
                    }`}
                  >
                    {tier.cta}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

