import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code, Globe, Star, Eye, Download, ArrowLeft } from "lucide-react"
import Link from "next/link"

const examples = [
  {
    id: 1,
    title: "Interactive Dashboard",
    description: "A beautiful dashboard with charts, animations, and real-time data visualization",
    tags: ["HTML", "CSS", "JavaScript", "Charts"],
    difficulty: "Intermediate",
    views: 1234,
    stars: 89,
    preview: "dashboard-preview.jpg",
  },
  {
    id: 2,
    title: "Portfolio Website",
    description: "Modern portfolio website with smooth animations and responsive design",
    tags: ["HTML", "CSS", "JavaScript", "Animation"],
    difficulty: "Beginner",
    views: 2156,
    stars: 156,
    preview: "portfolio-preview.jpg",
  },
  {
    id: 3,
    title: "2D Game Engine",
    description: "Simple 2D game built with HTML5 Canvas and JavaScript",
    tags: ["HTML5", "Canvas", "JavaScript", "Game"],
    difficulty: "Advanced",
    views: 987,
    stars: 234,
    preview: "game-preview.jpg",
  },
  {
    id: 4,
    title: "Todo App",
    description: "Feature-rich todo application with local storage and drag & drop",
    tags: ["HTML", "CSS", "JavaScript", "LocalStorage"],
    difficulty: "Beginner",
    views: 3421,
    stars: 298,
    preview: "todo-preview.jpg",
  },
  {
    id: 5,
    title: "Weather Widget",
    description: "Beautiful weather widget with API integration and animations",
    tags: ["HTML", "CSS", "JavaScript", "API"],
    difficulty: "Intermediate",
    views: 1876,
    stars: 167,
    preview: "weather-preview.jpg",
  },
  {
    id: 6,
    title: "CSS Art Gallery",
    description: "Stunning CSS art pieces showcasing advanced CSS techniques",
    tags: ["HTML", "CSS", "Art", "Animation"],
    difficulty: "Advanced",
    views: 756,
    stars: 445,
    preview: "art-preview.jpg",
  },
]

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "Intermediate":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    case "Advanced":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }
}

export default function ExamplesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <Code className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">Examples</span>
            </div>
          </div>
          <Button asChild>
            <Link href="/playground">Create New</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Code Examples & Templates</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Explore our collection of hand-crafted examples and templates. Learn from the best and kickstart your next
            project.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Badge variant="secondary">HTML</Badge>
            <Badge variant="secondary">CSS</Badge>
            <Badge variant="secondary">JavaScript</Badge>
            <Badge variant="secondary">Animation</Badge>
            <Badge variant="secondary">Games</Badge>
            <Badge variant="secondary">APIs</Badge>
          </div>
        </div>
      </section>

      {/* Examples Grid */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {examples.map((example) => (
              <Card key={example.id} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md mb-4 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <Code className="w-12 h-12 text-white relative z-10" />
                    <div className="absolute bottom-2 right-2 z-10">
                      <Badge className={getDifficultyColor(example.difficulty)}>{example.difficulty}</Badge>
                    </div>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">{example.title}</CardTitle>
                  <CardDescription>{example.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {example.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {example.views.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        {example.stars}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" asChild>
                      <Link href={`/playground?example=${example.id}`}>
                        <Globe className="w-4 h-4 mr-2" />
                        View Code
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Create Your Own?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start with a blank canvas or fork one of these examples to make it your own.
          </p>
          <Button size="lg" asChild>
            <Link href="/playground">Start Coding Now</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
