"use client"

import { useRef } from "react"
import Link from "next/link"
import { Github, Twitter, Linkedin } from "lucide-react"

export default function Footer() {
  const footerRef = useRef<HTMLElement | null>(null)

  const socialLinks = [
    {
      name: "GitHub",
      href: "https://github.com/yourusername/autolabdocs",
      icon: <Github className="h-5 w-5" />,
    },
    {
      name: "Twitter",
      href: "https://twitter.com/yourusername",
      icon: <Twitter className="h-5 w-5" />,
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/in/yourusername",
      icon: <Linkedin className="h-5 w-5" />,
    },
  ]

  const linkGroups = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "#features" },
        { name: "Pricing", href: "#pricing" },
        { name: "FAQ", href: "#faq" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "#" },
        { name: "Tutorials", href: "#" },
        { name: "Blog", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About", href: "#" },
        { name: "Contact", href: "#" },
        { name: "Privacy", href: "#" },
        { name: "Terms", href: "#" },
      ],
    },
  ]

  return (
    <footer ref={footerRef} className="border-t border-white/10 bg-black">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 animate-fadeIn">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 animate-gradient">
                AutoLabDocs
              </span>
            </div>
            <p className="text-muted-foreground max-w-md mb-6">
              Transform your Jupyter notebooks into beautifully formatted documents with a single click. Perfect for lab reports, assignments, and research documentation.
            </p>
            
            {/* Social links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <Link
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="transition-all duration-300 hover:text-primary hover:scale-110 hover:rotate-5 transform p-2 rounded-full bg-white/5 hover:bg-white/10"
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Link sections */}
          <div className="col-span-1 md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {linkGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="animate-fadeIn" style={{ animationDelay: `${groupIndex * 100}ms` }}>
                  <h3 className="font-medium mb-4">{group.title}</h3>
                  <ul className="space-y-2">
                    {group.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link
                          href={link.href}
                          className="text-muted-foreground transition-colors duration-200 hover:text-primary"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 text-center text-sm text-muted-foreground animate-fadeIn" style={{ animationDelay: "300ms" }}>
          <p>© {new Date().getFullYear()} AutoLabDocs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

