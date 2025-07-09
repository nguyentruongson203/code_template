"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, ArrowLeft, Settings } from "lucide-react"
import { useTheme } from "next-themes"
import FileExplorerAdvanced from "@/components/file-explorer-advanced"
import CodeSandboxEmbed from "@/components/codesandbox-embed"
import { useFiles } from "@/hooks/use-files"
import ShareDialog from "@/components/share-dialog"
import Link from "next/link"
import dynamic from "next/dynamic"

const Split = dynamic(() => import("react-split"), { ssr: false })

export default function CodeSandboxPlayground() {
  const { theme, setTheme } = useTheme()
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const { files, activeFile, openFile, updateFile, addFile, addFolder, deleteFile, renameFile } = useFiles()

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
            <h1 className="font-semibold text-lg">CodeSandbox Playground</h1>
          </div>
          <Badge variant="secondary" className="ml-2">
            {files.length} files
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShareDialogOpen(true)} className="gap-2 bg-transparent">
            <Settings className="w-4 h-4" />
            Share
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Split
          sizes={[25, 75]}
          minSize={[200, 400]}
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

          {/* CodeSandbox Embed */}
          <div className="flex flex-col">
            <CodeSandboxEmbed files={files} className="flex-1" />
          </div>
        </Split>
      </div>

      <ShareDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} files={files} />
    </div>
  )
}
