"use client"

import { useRef, useEffect, useState } from "react"
import * as monaco from "monaco-editor"
import { useTheme } from "next-themes"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, Replace, Command, Maximize2, Minimize2, FileText, Palette, Code, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileType {
  id: string
  name: string
  type: "file" | "folder"
  language: string
  content: string
  path: string
}

interface MonacoEditorAdvancedProps {
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

export default function MonacoEditorAdvanced({
  files,
  activeFile,
  onFileChange,
  onFileSelect,
  className,
}: MonacoEditorAdvancedProps) {
  const { theme } = useTheme()
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showMinimap, setShowMinimap] = useState(false)
  const [fontSize, setFontSize] = useState(14)
  const [wordWrap, setWordWrap] = useState<"on" | "off">("on")

  // Initialize Monaco Editor
  useEffect(() => {
    if (!containerRef.current) return

    const initializeEditor = async () => {
      try {
        // Configure Monaco environment
        monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true)
        monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true)

        // Enhanced JavaScript/TypeScript configuration
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
          target: monaco.languages.typescript.ScriptTarget.ES2020,
          allowNonTsExtensions: true,
          moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
          module: monaco.languages.typescript.ModuleKind.CommonJS,
          noEmit: true,
          esModuleInterop: true,
          jsx: monaco.languages.typescript.JsxEmit.React,
          allowJs: true,
          typeRoots: ["node_modules/@types"],
        })

        // Add DOM types for better IntelliSense
        const domTypes = `
          declare var console: Console;
          declare var document: Document;
          declare var window: Window & typeof globalThis;
          
          interface Console {
            log(...data: any[]): void;
            error(...data: any[]): void;
            warn(...data: any[]): void;
            info(...data: any[]): void;
          }
          
          interface Document {
            getElementById(elementId: string): HTMLElement | null;
            querySelector(selectors: string): Element | null;
            querySelectorAll(selectors: string): NodeListOf<Element>;
            createElement(tagName: string): HTMLElement;
            addEventListener(type: string, listener: EventListener): void;
          }
          
          interface Window {
            addEventListener(type: string, listener: EventListener): void;
            setTimeout(handler: Function, timeout: number): number;
            setInterval(handler: Function, timeout: number): number;
            clearTimeout(id: number): void;
            clearInterval(id: number): void;
            alert(message: string): void;
            confirm(message: string): boolean;
            prompt(message: string, defaultText?: string): string | null;
          }
        `

        monaco.languages.typescript.javascriptDefaults.addExtraLib(domTypes, "dom.d.ts")

        // Create editor instance
        const editor = monaco.editor.create(containerRef.current, {
          value: activeFile?.content || "",
          language: activeFile?.language || "javascript",
          theme: theme === "dark" ? "vs-dark" : "vs",
          fontSize: fontSize,
          fontFamily: "JetBrains Mono, Fira Code, Monaco, Consolas, monospace",
          lineNumbers: "on",
          roundedSelection: false,
          scrollBeyondLastLine: false,
          minimap: { enabled: showMinimap },
          automaticLayout: true,
          wordWrap: wordWrap,
          tabSize: 2,
          insertSpaces: true,
          detectIndentation: false,
          folding: true,
          foldingStrategy: "indentation",
          showFoldingControls: "always",
          unfoldOnClickAfterEndOfLine: false,
          renderLineHighlight: "all",
          selectOnLineNumbers: true,
          matchBrackets: "always",
          autoClosingBrackets: "always",
          autoClosingQuotes: "always",
          autoSurround: "languageDefined",
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          suggest: {
            showKeywords: true,
            showSnippets: true,
            showFunctions: true,
            showConstructors: true,
            showFields: true,
            showVariables: true,
            showClasses: true,
            showStructs: true,
            showInterfaces: true,
            showModules: true,
            showProperties: true,
            showEvents: true,
            showOperators: true,
            showUnits: true,
            showValues: true,
            showConstants: true,
            showEnums: true,
            showEnumMembers: true,
            showColors: true,
            showFiles: true,
            showReferences: true,
            showFolders: true,
            showTypeParameters: true,
            showIssues: true,
            showUsers: true,
            showWords: true,
          },
          quickSuggestions: {
            other: true,
            comments: true,
            strings: true,
          },
          parameterHints: { enabled: true },
          formatOnPaste: true,
          formatOnType: true,
          codeLens: true,
          lightbulb: { enabled: true },
          contextmenu: true,
          mouseWheelZoom: true,
          multiCursorModifier: "ctrlCmd",
          accessibilitySupport: "auto",
        })

        editorRef.current = editor

        // Add custom key bindings
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
          editor.getAction("editor.action.formatDocument")?.run()
        })

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
          editor.getAction("actions.find")?.run()
        })

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
          editor.getAction("editor.action.startFindReplaceAction")?.run()
        })

        // Listen for content changes
        editor.onDidChangeModelContent(() => {
          if (activeFile) {
            const content = editor.getValue()
            onFileChange(activeFile.id, content)
          }
        })

        setIsLoading(false)
      } catch (error) {
        console.error("Failed to initialize Monaco Editor:", error)
        setIsLoading(false)
      }
    }

    initializeEditor()

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose()
      }
    }
  }, [])

  // Update editor when active file changes
  useEffect(() => {
    if (editorRef.current && activeFile) {
      const model = monaco.editor.createModel(activeFile.content, activeFile.language, monaco.Uri.file(activeFile.path))
      editorRef.current.setModel(model)
    }
  }, [activeFile])

  // Update theme
  useEffect(() => {
    if (editorRef.current) {
      monaco.editor.setTheme(theme === "dark" ? "vs-dark" : "vs")
    }
  }, [theme])

  // Update editor options
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        fontSize: fontSize,
        minimap: { enabled: showMinimap },
        wordWrap: wordWrap,
      })
    }
  }, [fontSize, showMinimap, wordWrap])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.layout()
      }
    }, 100)
  }

  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.action.formatDocument")?.run()
    }
  }

  const findAndReplace = () => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.action.startFindReplaceAction")?.run()
    }
  }

  const openCommandPalette = () => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.action.quickCommand")?.run()
    }
  }

  if (isLoading) {
    return (
      <div className={cn("h-full w-full", className)}>
        <div className="h-full w-full p-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    )
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
            {files
              .filter((f) => f.type === "file")
              .map((file) => (
                <button
                  key={file.id}
                  onClick={() => onFileSelect(file.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors",
                    activeFile?.id === file.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50",
                  )}
                >
                  {getFileIcon(file.name)}
                  <span className="truncate max-w-[100px]">{file.name}</span>
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

          <Button
            variant="ghost"
            size="sm"
            onClick={findAndReplace}
            className="h-8 w-8 p-0"
            title="Find & Replace (Ctrl+Shift+F)"
          >
            <Replace className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={openCommandPalette}
            className="h-8 w-8 p-0"
            title="Command Palette (Ctrl+Shift+P)"
          >
            <Command className="w-4 h-4" />
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

      {/* Monaco Editor Container */}
      <div className="flex-1 relative">
        <div ref={containerRef} className="absolute inset-0" />
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
        </div>
      </div>
    </div>
  )
}
