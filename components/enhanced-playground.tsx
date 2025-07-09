"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import dynamic from "next/dynamic"
// client-only split panes
const Split = dynamic(() => import("react-split"), { ssr: false })
import { Console } from "console-feed"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Moon, Sun, Terminal, Globe, Trash2, Share2, ArrowLeft, Settings } from "lucide-react"
import { useTheme } from "next-themes"
import FileExplorerAdvanced from "@/components/file-explorer-advanced"
import { useFiles } from "@/hooks/use-files"
import { useDebounce } from "@/hooks/use-debounce"
import { buildPreviewHTML } from "@/utils/build-preview"
import ShareDialog from "@/components/share-dialog"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// client-only CodeMirror editor
const CodeMirrorEditor = dynamic(() => import("@/components/codemirror-editor"), { ssr: false })

export default function EnhancedPlayground() {
  const { theme, setTheme } = useTheme()
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const { files, activeFile, openFile, updateFile, addFile, addFolder, deleteFile, renameFile } = useFiles()
  const [outputTab, setOutputTab] = useState<"preview" | "console">("preview")
  const [logs, setLogs] = useState<any[]>([])
  const [layout, setLayout] = useState<"horizontal" | "vertical">("horizontal")
  const [editorSettings, setEditorSettings] = useState({
    fontSize: 14,
    minimap: false,
    wordWrap: "on" as "on" | "off",
    theme: "vs-dark",
  })

  // Debounce file changes for better performance
  const debouncedFiles = useDebounce(files, 300)

  // Memoize the iframe source
  const iframeSrc = useMemo(() => {
    return buildPreviewHTML(debouncedFiles)
  }, [debouncedFiles])

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

    if (typeof window !== "undefined") {
      window.addEventListener("message", handleMessage)
      return () => window.removeEventListener("message", handleMessage)
    }
  }, [])

  const clearConsole = useCallback(() => {
    setLogs([])
  }, [])

  const handleFileChange = useCallback(
    (fileId: string, content: string) => {
      const file = files.find((f) => f.id === fileId)
      if (file) {
        updateFile(file.name, content)
      }
    },
    [files, updateFile],
  )

  const handleFileSelect = useCallback(
    (fileId: string) => {
      const file = files.find((f) => f.id === fileId)
      if (file) {
        openFile(file.name)
      }
    },
    [files, openFile],
  )

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="font-semibold text-lg">Enhanced Code Playground</h1>
          </div>
          <Badge variant="secondary" className="ml-2">
            {files.length} files
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Editor Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLayout(layout === "horizontal" ? "vertical" : "horizontal")}>
                Layout: {layout === "horizontal" ? "Horizontal" : "Vertical"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditorSettings((prev) => ({ ...prev, minimap: !prev.minimap }))}>
                Minimap: {editorSettings.minimap ? "On" : "Off"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  setEditorSettings((prev) => ({ ...prev, wordWrap: prev.wordWrap === "on" ? "off" : "on" }))
                }
              >
                Word Wrap: {editorSettings.wordWrap === "on" ? "On" : "Off"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={() => setShareDialogOpen(true)} className="gap-2 bg-transparent">
            <Share2 className="w-4 h-4" />
            Share
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
          {/* File Explorer */}
          <div className="border-r bg-background">
            <FileExplorerAdvanced
              files={files}
              activeFile={activeFile}
              onOpenFile={openFile}
              onAddFile={addFile}
              onAddFolder={addFolder}
              onDeleteFile={deleteFile}
              onRenameFile={renameFile}
            />
          </div>

          {/* CodeMirror Editor */}
          <div className="flex flex-col">
            <CodeMirrorEditor
              files={files}
              activeFile={activeFile}
              onFileChange={handleFileChange}
              onFileSelect={handleFileSelect}
              className="flex-1"
            />
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.open("data:text/html," + encodeURIComponent(iframeSrc), "_blank")
                      }
                    }}
                    className="h-7 px-2 text-xs"
                  >
                    Open in New Tab
                  </Button>
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
      <ShareDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} files={files} />
    </div>
  )
}
