"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Maximize2, Minimize2, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileType {
  id: string
  name: string
  type: "file" | "folder"
  language: string
  content: string
  path: string
}

interface CodeSandboxEmbedProps {
  files: FileType[]
  className?: string
}

export default function CodeSandboxEmbed({ files, className }: CodeSandboxEmbedProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [sandboxId, setSandboxId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const createSandbox = async () => {
    setIsLoading(true)
    try {
      // Create CodeSandbox configuration
      const sandboxConfig = {
        files: {},
        template: "vanilla", // or "react", "vue", etc.
      }

      // Convert files to CodeSandbox format
      files.forEach((file) => {
        if (file.type === "file") {
          sandboxConfig.files[file.path] = {
            content: file.content,
            isBinary: false,
          }
        }
      })

      // Add package.json if not exists
      if (!sandboxConfig.files["/package.json"]) {
        sandboxConfig.files["/package.json"] = {
          content: JSON.stringify(
            {
              name: "playground-project",
              version: "1.0.0",
              description: "Generated from Code Playground",
              main: "index.html",
              scripts: {
                start: "parcel index.html --open",
                build: "parcel build index.html",
              },
              dependencies: {},
              devDependencies: {
                "parcel-bundler": "^1.6.1",
              },
            },
            null,
            2,
          ),
          isBinary: false,
        }
      }

      // Create sandbox using CodeSandbox API
      const response = await fetch("https://codesandbox.io/api/v1/sandboxes/define?json=1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sandboxConfig),
      })

      if (response.ok) {
        const result = await response.json()
        setSandboxId(result.sandbox_id)
      } else {
        console.error("Failed to create sandbox")
      }
    } catch (error) {
      console.error("Error creating sandbox:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshSandbox = () => {
    if (sandboxId) {
      createSandbox()
    }
  }

  const openInNewTab = () => {
    if (sandboxId) {
      window.open(`https://codesandbox.io/s/${sandboxId}`, "_blank")
    }
  }

  useEffect(() => {
    if (files.length > 0) {
      createSandbox()
    }
  }, [files])

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-background border rounded-lg overflow-hidden",
        isFullscreen && "fixed inset-0 z-50",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            CodeSandbox
          </Badge>
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Creating sandbox...
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshSandbox}
            disabled={isLoading}
            className="h-8 w-8 p-0"
            title="Refresh Sandbox"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={openInNewTab}
            disabled={!sandboxId}
            className="h-8 w-8 p-0"
            title="Open in CodeSandbox"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-8 w-8 p-0"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* CodeSandbox Embed */}
      <div className="flex-1 relative">
        {sandboxId ? (
          <iframe
            src={`https://codesandbox.io/embed/${sandboxId}?fontsize=14&hidenavigation=1&theme=dark&view=preview`}
            className="w-full h-full border-0"
            title="CodeSandbox Preview"
            allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
            sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="w-8 h-8 animate-spin" />
                <p>Creating CodeSandbox...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <p>No sandbox created yet</p>
                <Button onClick={createSandbox} disabled={files.length === 0}>
                  Create Sandbox
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
