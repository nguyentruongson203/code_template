import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code, FileText, Globe, Palette, Play, Share2, Zap, Monitor, Smartphone, Tablet } from "lucide-react"

export default function HomePage() {
  const features = [
    {
      icon: <Code className="w-6 h-6" />,
      title: "VS Code Experience",
      description: "Full Monaco Editor with IntelliSense, debugging, and extensions",
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Multi-file Support",
      description: "Create, edit, and manage multiple files with folder structure",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Live Preview",
      description: "See your changes instantly with hot reload preview",
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Syntax Highlighting",
      description: "Beautiful syntax highlighting for HTML, CSS, JavaScript and more",
    },
    {
      icon: <Play className="w-6 h-6" />,
      title: "Code Execution",
      description: "Run your code directly in the browser with console output",
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      title: "Easy Sharing",
      description: "Share your projects with others via unique URLs",
    },
  ]

  const playgrounds = [
    {
      title: "VS Code Playground",
      description: "Full VS Code experience with Monaco Editor",
      href: "/vscode",
      badge: "New",
      icon: <Monitor className="w-5 h-5" />,
      features: ["Monaco Editor", "IntelliSense", "Multi-file", "Terminal"],
    },
    {
      title: "Enhanced Playground",
      description: "Advanced playground with enhanced features",
      href: "/playground/enhanced",
      badge: "Enhanced",
      icon: <Zap className="w-5 h-5" />,
      features: ["Split View", "Console", "File Explorer", "Sharing"],
    },
    {
      title: "Basic Playground",
      description: "Simple and fast playground for quick prototyping",
      href: "/playground",
      badge: "Classic",
      icon: <Smartphone className="w-5 h-5" />,
      features: ["Quick Start", "Live Preview", "Basic Editor", "Responsive"],
    },
    {
      title: "Examples Gallery",
      description: "Browse and learn from curated code examples",
      href: "/examples",
      badge: "Learn",
      icon: <Tablet className="w-5 h-5" />,
      features: ["Templates", "Tutorials", "Best Practices", "Inspiration"],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Now with VS Code Experience
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-6">
            Code Playground
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            A powerful online code editor with VS Code experience. Write, test, and share your web projects instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8">
              <Link href="/vscode">
                <Monitor className="w-5 h-5 mr-2" />
                Try VS Code Editor
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 bg-transparent">
              <Link href="/examples">
                <FileText className="w-5 h-5 mr-2" />
                Browse Examples
              </Link>
            </Button>
          </div>
        </div>

        {/* Playgrounds Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {playgrounds.map((playground, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {playground.icon}
                    <Badge variant={playground.badge === "New" ? "default" : "secondary"}>{playground.badge}</Badge>
                  </div>
                </div>
                <CardTitle className="text-lg">{playground.title}</CardTitle>
                <CardDescription>{playground.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {playground.features.map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  <Button asChild className="w-full group-hover:bg-primary/90">
                    <Link href={playground.href}>Open Playground</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 rounded-lg bg-card border hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Coding?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Experience the power of VS Code in your browser. No installation required, just pure coding bliss.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/vscode">
                <Code className="w-5 h-5 mr-2" />
                Start Coding Now
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/examples">
                <Globe className="w-5 h-5 mr-2" />
                Explore Examples
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
