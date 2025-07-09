"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Plus, Trash2, Edit3, Code, Palette, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileType {
  name: string
  language: string
  content: string
}

interface FileExplorerProps {
  files: FileType[]
  activeFile: FileType | null
  onOpenFile: (name: string) => void
  onAddFile: (name: string) => void
  onDeleteFile: (name: string) => void
  onRenameFile: (oldName: string, newName: string) => void
}

const getFileIcon = (fileName: string) => {
  if (fileName.endsWith(".html")) return <Globe className="w-4 h-4 text-orange-500" />
  if (fileName.endsWith(".css")) return <Palette className="w-4 h-4 text-blue-500" />
  if (fileName.endsWith(".js")) return <Code className="w-4 h-4 text-yellow-500" />
  return <FileText className="w-4 h-4 text-gray-500" />
}

export default function FileExplorer({
  files,
  activeFile,
  onOpenFile,
  onAddFile,
  onDeleteFile,
  onRenameFile,
}: FileExplorerProps) {
  const [newFileName, setNewFileName] = useState("")
  const [renamingFile, setRenamingFile] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")

  const handleAddFile = () => {
    if (newFileName.trim()) {
      onAddFile(newFileName.trim())
      setNewFileName("")
    }
  }

  const handleRename = (oldName: string) => {
    if (renameValue.trim() && renameValue !== oldName) {
      onRenameFile(oldName, renameValue.trim())
    }
    setRenamingFile(null)
    setRenameValue("")
  }

  const startRename = (fileName: string) => {
    setRenamingFile(fileName)
    setRenameValue(fileName)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b">
        <span className="font-medium text-sm">FILES</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {files.map((file) => (
            <div
              key={file.name}
              className={cn(
                "group flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent transition-colors",
                activeFile?.name === file.name && "bg-accent",
              )}
            >
              {renamingFile === file.name ? (
                <div className="flex-1 flex items-center gap-2">
                  {getFileIcon(file.name)}
                  <Input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => handleRename(file.name)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(file.name)
                      if (e.key === "Escape") {
                        setRenamingFile(null)
                        setRenameValue("")
                      }
                    }}
                    className="h-6 text-sm"
                    autoFocus
                  />
                </div>
              ) : (
                <>
                  <div className="flex-1 flex items-center gap-2" onClick={() => onOpenFile(file.name)}>
                    {getFileIcon(file.name)}
                    <span className="text-sm truncate">{file.name}</span>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        startRename(file.name)
                      }}
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    {files.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteFile(file.name)
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="filename.ext"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddFile()
            }}
            className="h-8 text-sm"
          />
          <Button size="sm" onClick={handleAddFile} disabled={!newFileName.trim()} className="h-8 px-3">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
