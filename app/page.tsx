import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code, FileText, Globe, Zap, Users, Share2, Download, Play, ExternalLink, Sparkles } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <Code className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">Code Playground</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              Examples
            </Button>
            <Button variant="ghost" size="sm">
              Documentation
            </Button>
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            New: CodeSandbox Integration
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Code, Create, Share
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            A powerful online code editor with real-time preview, intelligent autocomplete, and seamless sharing. Build
            your next project right in the browser.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8">
              <Link href="/playground/enhanced">
                <Play className="w-5 h-5 mr-2" />
                Start Coding
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="text-lg px-8 bg-transparent">
              <Link href="/examples">
                <FileText className="w-5 h-5 mr-2" />
                View Examples
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Choose Your Playground</h2>
          <p className="text-muted-foreground text-lg">Multiple editor options to suit your coding style</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Enhanced Playground */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-5 h-5 text-primary" />
                <CardTitle>Enhanced Editor</CardTitle>
              </div>
              <CardDescription>
                Advanced code editor with syntax highlighting, intelligent autocomplete, and real-time preview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-green-500" />
                  <span>CodeMirror-based editor</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span>Live preview panel</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Share2 className="w-4 h-4 text-purple-500" />
                  <span>Easy sharing & export</span>
                </div>
              </div>
              <Button asChild className="w-full">
                <Link href="/playground/enhanced">Launch Editor</Link>
              </Button>
            </CardContent>
          </Card>

          {/* VS Code Style */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-primary" />
                <CardTitle>VS Code Style</CardTitle>
              </div>
              <CardDescription>
                Full VS Code experience with file explorer, tabs, terminal, and extensions support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-green-500" />
                  <span>Multi-file projects</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Download className="w-4 h-4 text-blue-500" />
                  <span>Integrated terminal</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-purple-500" />
                  <span>Advanced debugging</span>
                </div>
              </div>
              <Button asChild className="w-full bg-transparent" variant="outline">
                <Link href="/vscode">Open VS Code</Link>
              </Button>
            </CardContent>
          </Card>

          {/* CodeSandbox Integration */}
          <Card className="hover:shadow-lg transition-shadow border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="w-5 h-5 text-primary" />
                <CardTitle>CodeSandbox</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  New
                </Badge>
              </div>
              <CardDescription>
                Seamless integration with CodeSandbox for advanced project development and deployment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-green-500" />
                  <span>Live deployment</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>Real-time collaboration</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Download className="w-4 h-4 text-purple-500" />
                  <span>NPM packages support</span>
                </div>
              </div>
              <Button asChild className="w-full" variant="default">
                <Link href="/playground/codesandbox">Try CodeSandbox</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Simple Playground */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Play className="w-5 h-5 text-primary" />
                <CardTitle>Simple Playground</CardTitle>
              </div>
              <CardDescription>Quick and lightweight editor for rapid prototyping and learning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-green-500" />
                  <span>Fast loading</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span>Instant preview</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Share2 className="w-4 h-4 text-purple-500" />
                  <span>One-click sharing</span>
                </div>
              </div>
              <Button asChild className="w-full bg-transparent" variant="outline">
                <Link href="/playground">Quick Start</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Production Ready */}
          <Card className="hover:shadow-lg transition-shadow border-green-200 dark:border-green-800">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-green-600" />
                <CardTitle>Production Ready</CardTitle>
                <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                  MySQL
                </Badge>
              </div>
              <CardDescription>
                Full-featured development environment with database integration and project management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-green-500" />
                  <span>User authentication</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Download className="w-4 h-4 text-blue-500" />
                  <span>Project persistence</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Share2 className="w-4 h-4 text-purple-500" />
                  <span>Team collaboration</span>
                </div>
              </div>
              <Button asChild className="w-full" variant="default">
                <Link href="/playground/production">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Go Pro
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Examples & Templates */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-primary" />
                <CardTitle>Examples & Templates</CardTitle>
              </div>
              <CardDescription>Ready-to-use templates and examples to kickstart your projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Code className="w-4 h-4 text-green-500" />
                  <span>HTML/CSS/JS templates</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span>Framework examples</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Share2 className="w-4 h-4 text-purple-500" />
                  <span>Community shared</span>
                </div>
              </div>
              <Button asChild className="w-full bg-transparent" variant="outline">
                <Link href="/examples">Browse Examples</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Code className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="font-semibold">Code Playground</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/about" className="hover:text-foreground">
                About
              </Link>
              <Link href="/docs" className="hover:text-foreground">
                Documentation
              </Link>
              <Link href="/support" className="hover:text-foreground">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
