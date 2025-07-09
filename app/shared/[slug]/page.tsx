"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  FileText,
  Moon,
  Sun,
  Terminal,
  Globe,
  Trash2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Calendar,
  User,
} from "lucide-react"
import { useTheme } from "next-themes"
import Split from "react-split"
import { Console } from "console-feed"
import CodeEditor from "@/components/code-editor"
import { buildPreviewHTML } from "@/utils/build-preview"
import { loadSharedCode, getSharedCodeInfo } from "@/utils/share-code"

export default function SharedPlaygroundPage() {
  const { theme, setTheme } = useTheme()
  const params = useParams()
  const slug = params.slug as string

  const [files, setFiles] = useState<any[]>([])
  const [activeFile, setActiveFile] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sharedInfo, setSharedInfo] = useState<any>(null)

  // Load shared code on mount
  useEffect(() => {
    const loadCode = async () => {
      if (!slug) return

      try {
        setLoading(true)
        setError(null)

        // Load both files and metadata
        const [sharedFiles, codeInfo] = await Promise.all([
          loadSharedCode(slug),
          getSharedCodeInfo(slug).catch(() => null), // Don't fail if metadata fails
        ])

        if (sharedFiles && sharedFiles.length > 0) {
          setFiles(sharedFiles)
          setSharedInfo(codeInfo)

          // Set first file as active
          const firstFile = sharedFiles.find((f) => f.type === "file") || sharedFiles[0]
          setActiveFile(firstFile)
        } else {
          setError("No files found in shared playground")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load shared playground")
      } finally {
        setLoading(false)
      }
    }

    loadCode()
  }, [slug])

  // Handle console messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "console") {
        const newLog = {
          method: event.data.level,
          data: event.data.args,
        }
        setLogs((prev) => [...prev, newLog])
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  const clearConsole = () => {
    setLogs([])
  }

  const openFile = (fileName: string) => {
    const file = files.find((f) => f.name === fileName)
    if (file) {
      setActiveFile(file)
    }
  }

  const openInPlayground = () => {
    // Store shared files in localStorage and redirect to main playground
    localStorage.setItem("playground-files-v1", JSON.stringify(files))
    window.open("/", "_blank")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading shared playground...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="text-center">
            <Button onClick={() => (window.location.href = "/")} variant="outline">
              Go to Playground
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const iframeSrc = buildPreviewHTML(files)

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="font-semibold text-lg">Shared Playground</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{files.length} files</Badge>
            <Badge variant="outline">Read-only</Badge>
            {sharedInfo && (
              <Badge variant="outline" className="gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(sharedInfo.createdAt)}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openInPlayground} className="gap-2 bg-transparent">
            <ExternalLink className="w-4 h-4" />
            Open in Playground
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Split
          sizes={[20, 50, 30]}
          minSize={[200, 300, 250]}
          expandToMin={false}
          gutterSize={8}
          gutterAlign="center"
          snapOffset={30}
          dragInterval={1}
          direction="horizontal"
          cursor="col-resize"
          className="flex h-full"
          style={{ height: "100%" }}
        >
          {/* File Explorer - Read Only */}
          <div className="border-r bg-background">
            <div className="h-full flex flex-col">
              <div className="p-3 border-b">
                <div className="space-y-2">
                  <span className="font-medium text-sm">FILES (READ-ONLY)</span>
                  {sharedInfo && (
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        ID: {sharedInfo.id}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(sharedInfo.createdAt)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 p-2 space-y-1">
                {files.map((file) => (
                  <div
                    key={file.name}
                    className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent transition-colors ${
                      activeFile?.name === file.name ? "bg-accent" : ""
                    }`}
                    onClick={() => openFile(file.name)}
                  >
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm truncate">{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Editor - Read Only */}
          <div className="flex flex-col">
            {/* File Tabs */}
            <div className="border-b bg-background">
              <div className="flex overflow-x-auto">
                {files.map((file) => (
                  <button
                    key={file.name}
                    onClick={() => openFile(file.name)}
                    className={`px-4 py-2 text-sm border-b-2 whitespace-nowrap ${
                      activeFile?.name === file.name
                        ? "border-primary text-primary bg-accent"
                        : "border-transparent hover:bg-accent"
                    }`}
                  >
                    <FileText className="w-4 h-4 mr-2 inline" />
                    {file.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1">
              {activeFile && (
                <CodeEditor
                  file={activeFile}
                  onChange={() => {}} // Read-only
                  theme={theme}
                  readOnly={true}
                />
              )}
            </div>
          </div>

          {/* Output Panel */}
          <div className="border-l bg-background">
            <Split
              sizes={[60, 40]}
              direction="vertical"
              minSize={[100, 100]}
              gutterSize={8}
              className="h-full"
              style={{ height: "100%" }}
            >
              {/* Preview */}
              <div className="flex flex-col">
                <div className="border-b p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm font-medium">Preview</span>
                  </div>
                </div>
                <div className="flex-1">
                  <iframe
                    srcDoc={iframeSrc}
                    className="w-full h-full border-0"
                    title="Preview"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                  />
                </div>
              </div>

              {/* Console */}
              <div className="flex flex-col">
                <div className="border-b p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    <span className="text-sm font-medium">Console</span>
                    {logs.length > 0 && (
                      <Badge variant="secondary" className="h-5 text-xs">
                        {logs.length}
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearConsole} disabled={logs.length === 0}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <Console logs={logs} variant={theme === "dark" ? "dark" : "light"} />
                </div>
              </div>
            </Split>
          </div>
        </Split>
      </div>
    </div>
  )
}
