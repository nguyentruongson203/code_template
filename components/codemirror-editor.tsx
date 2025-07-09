"use client"

import type React from "react"

import { useRef, useEffect, useState, useCallback } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Settings, Maximize2, Minimize2, FileText, Palette, Code, Globe, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileType {
  id: string
  name: string
  type: "file" | "folder"
  language: string
  content: string
  path: string
}

interface CodeMirrorEditorProps {
  files: FileType[]
  activeFile: FileType | null
  onFileChange: (fileId: string, content: string) => void
  onFileSelect: (fileId: string) => void
  className?: string
}

const getFileIcon = (fileName: string) => {
  if (fileName.endsWith(".html")) return <Globe className="w-4 h-4 text-orange-500" />
  if (fileName.endsWith(".css")) return <Palette className="w-4 h-4 text-blue-500" />
  if (fileName.endsWith(".js")) return <Code className="w-4 h-4 text-yellow-500" />
  return <FileText className="w-4 h-4 text-gray-500" />
}

const getLanguageFromExtension = (fileName: string): string => {
  if (fileName.endsWith(".html")) return "html"
  if (fileName.endsWith(".css")) return "css"
  if (fileName.endsWith(".js")) return "javascript"
  if (fileName.endsWith(".ts")) return "typescript"
  if (fileName.endsWith(".json")) return "json"
  if (fileName.endsWith(".md")) return "markdown"
  return "plaintext"
}

export default function CodeMirrorEditor({
  files,
  activeFile,
  onFileChange,
  onFileSelect,
  className,
}: CodeMirrorEditorProps) {
  const { theme } = useTheme()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showMinimap, setShowMinimap] = useState(false)
  const [fontSize, setFontSize] = useState(14)
  const [wordWrap, setWordWrap] = useState<"on" | "off">("on")
  const [openTabs, setOpenTabs] = useState<FileType[]>([])

  // Add file to tabs when opened
  useEffect(() => {
    if (activeFile && !openTabs.find((tab) => tab.id === activeFile.id)) {
      setOpenTabs((prev) => [...prev, activeFile])
    }
  }, [activeFile, openTabs])

  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (activeFile) {
        onFileChange(activeFile.id, e.target.value)
      }
    },
    [activeFile, onFileChange],
  )

  const closeTab = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setOpenTabs((prev) => prev.filter((tab) => tab.id !== fileId))

    if (activeFile?.id === fileId) {
      const remainingTabs = openTabs.filter((tab) => tab.id !== fileId)
      if (remainingTabs.length > 0) {
        onFileSelect(remainingTabs[remainingTabs.length - 1].id)
      }
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const formatCode = () => {
    if (textareaRef.current && activeFile) {
      // Simple formatting for demonstration
      let content = textareaRef.current.value

      if (activeFile.language === "javascript" || activeFile.language === "json") {
        try {
          if (activeFile.language === "json") {
            content = JSON.stringify(JSON.parse(content), null, 2)
          } else {
            // Basic JS formatting - add proper indentation
            content = content
              .split("\n")
              .map((line) => line.trim())
              .join("\n")
              .replace(/\{/g, "{\n  ")
              .replace(/\}/g, "\n}")
              .replace(/;/g, ";\n")
          }
          onFileChange(activeFile.id, content)
        } catch (error) {
          console.log("Format error:", error)
        }
      }
    }
  }

  const insertSnippet = (snippet: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const currentValue = textarea.value
      const newValue = currentValue.substring(0, start) + snippet + currentValue.substring(end)

      if (activeFile) {
        onFileChange(activeFile.id, newValue)
      }

      // Set cursor position after snippet
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + snippet.length, start + snippet.length)
      }, 0)
    }
  }

  const getSnippetsForLanguage = (language: string) => {
    switch (language) {
      case "html":
        return [
          {
            name: "HTML5 Template",
            code: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Document</title>\n</head>\n<body>\n  \n</body>\n</html>',
          },
          { name: "Div", code: "<div></div>" },
          { name: "Button", code: '<button onclick=""></button>' },
        ]
      case "css":
        return [
          {
            name: "Flexbox Center",
            code: ".container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}",
          },
          {
            name: "Grid Layout",
            code: ".grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\n  gap: 1rem;\n}",
          },
          { name: "Media Query", code: "@media (max-width: 768px) {\n  \n}" },
        ]
      case "javascript":
        return [
          { name: "Function", code: "function functionName() {\n  \n}" },
          { name: "Arrow Function", code: "const functionName = () => {\n  \n}" },
          { name: "For Loop", code: "for (let i = 0; i < array.length; i++) {\n  \n}" },
          { name: "Event Listener", code: "element.addEventListener('click', function() {\n  \n})" },
        ]
      default:
        return []
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-background border rounded-lg overflow-hidden",
        isFullscreen && "fixed inset-0 z-50",
        className,
      )}
    >
      {/* Editor Header */}
      <div className="flex items-center justify-between p-2 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          {/* File Tabs */}
          <div className="flex items-center gap-1 max-w-md overflow-x-auto">
            {openTabs.map((file) => (
              <button
                key={file.id}
                onClick={() => onFileSelect(file.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors group",
                  activeFile?.id === file.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50",
                )}
              >
                {getFileIcon(file.name)}
                <span className="truncate max-w-[100px]">{file.name}</span>
                <X
                  className="w-3 h-3 opacity-0 group-hover:opacity-100 hover:bg-accent rounded"
                  onClick={(e) => closeTab(file.id, e)}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Editor Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMinimap(!showMinimap)}
            className="h-8 px-2"
            title="Toggle Minimap"
          >
            <Badge variant={showMinimap ? "default" : "outline"} className="text-xs">
              Map
            </Badge>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setWordWrap(wordWrap === "on" ? "off" : "on")}
            className="h-8 px-2"
            title="Toggle Word Wrap"
          >
            <Badge variant={wordWrap === "on" ? "default" : "outline"} className="text-xs">
              Wrap
            </Badge>
          </Button>

          <Button variant="ghost" size="sm" onClick={formatCode} className="h-8 px-2" title="Format Code (Ctrl+S)">
            <Settings className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="h-8 w-8 p-0"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Code Snippets Bar */}
      {activeFile && (
        <div className="flex items-center gap-2 p-2 border-b bg-muted/30 overflow-x-auto">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Snippets:</span>
          {getSnippetsForLanguage(activeFile.language).map((snippet, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => insertSnippet(snippet.code)}
              className="h-6 px-2 text-xs whitespace-nowrap"
            >
              {snippet.name}
            </Button>
          ))}
        </div>
      )}

      {/* Code Editor */}
      <div className="flex-1 relative">
        <Textarea
          ref={textareaRef}
          value={activeFile?.content || ""}
          onChange={handleContentChange}
          placeholder={activeFile ? `Start coding in ${activeFile.name}...` : "Select a file to start coding"}
          className={cn(
            "absolute inset-0 resize-none border-0 rounded-none font-mono text-sm leading-relaxed",
            "focus-visible:ring-0 focus-visible:ring-offset-0",
            wordWrap === "off" && "whitespace-nowrap overflow-x-auto",
          )}
          style={{
            fontSize: `${fontSize}px`,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace",
            lineHeight: "1.6",
            tabSize: 2,
          }}
          spellCheck={false}
          onKeyDown={(e) => {
            // Handle Tab key for indentation
            if (e.key === "Tab") {
              e.preventDefault()
              const textarea = e.currentTarget
              const start = textarea.selectionStart
              const end = textarea.selectionEnd
              const value = textarea.value
              const newValue = value.substring(0, start) + "  " + value.substring(end)

              if (activeFile) {
                onFileChange(activeFile.id, newValue)
              }

              setTimeout(() => {
                textarea.setSelectionRange(start + 2, start + 2)
              }, 0)
            }

            // Format on Ctrl+S
            if (e.ctrlKey && e.key === "s") {
              e.preventDefault()
              formatCode()
            }
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 text-xs bg-muted/30 border-t">
        <div className="flex items-center gap-4">
          {activeFile && (
            <>
              <span className="flex items-center gap-1">
                {getFileIcon(activeFile.name)}
                {activeFile.name}
              </span>
              <span className="text-muted-foreground">{activeFile.language.toUpperCase()}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4 text-muted-foreground">
          <span>Font: {fontSize}px</span>
          <span>UTF-8</span>
          <span>LF</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFontSize((prev) => Math.max(10, prev - 1))}
            className="h-4 w-4 p-0 text-xs"
          >
            -
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFontSize((prev) => Math.min(24, prev + 1))}
            className="h-4 w-4 p-0 text-xs"
          >
            +
          </Button>
        </div>
      </div>
    </div>
  )
}
