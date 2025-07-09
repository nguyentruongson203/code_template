"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import {
  FileText,
  Plus,
  Trash2,
  Edit3,
  Folder,
  FolderOpen,
  Code,
  Palette,
  Globe,
  FolderPlus,
  FilePlus,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface FileType {
  id: string
  name: string
  type: "file" | "folder"
  language?: string
  content?: string
  children?: FileType[]
  path: string
  parentId?: string
}

interface FileExplorerAdvancedProps {
  files: FileType[]
  activeFile: FileType | null
  onOpenFile: (id: string) => void
  onAddFile: (name: string, parentId?: string) => void
  onAddFolder: (name: string, parentId?: string) => void
  onDeleteFile: (id: string) => void
  onRenameFile: (id: string, newName: string) => void
}

const getFileIcon = (fileName: string) => {
  if (fileName.endsWith(".html")) return <Globe className="w-4 h-4 text-orange-500" />
  if (fileName.endsWith(".css")) return <Palette className="w-4 h-4 text-blue-500" />
  if (fileName.endsWith(".js")) return <Code className="w-4 h-4 text-yellow-500" />
  return <FileText className="w-4 h-4 text-gray-500" />
}

interface FileTreeItemProps {
  item: FileType
  level: number
  activeFile: FileType | null
  expandedFolders: Set<string>
  onToggleFolder: (id: string) => void
  onOpenFile: (id: string) => void
  onAddFile: (name: string, parentId?: string) => void
  onAddFolder: (name: string, parentId?: string) => void
  onDeleteFile: (id: string) => void
  onRenameFile: (id: string, newName: string) => void
  renamingItem: string | null
  setRenamingItem: (id: string | null) => void
  renameValue: string
  setRenameValue: (value: string) => void
}

function FileTreeItem({
  item,
  level,
  activeFile,
  expandedFolders,
  onToggleFolder,
  onOpenFile,
  onAddFile,
  onAddFolder,
  onDeleteFile,
  onRenameFile,
  renamingItem,
  setRenamingItem,
  renameValue,
  setRenameValue,
}: FileTreeItemProps) {
  const isExpanded = expandedFolders.has(item.id)
  const isActive = activeFile?.id === item.id

  const handleRename = () => {
    if (renameValue.trim() && renameValue !== item.name) {
      onRenameFile(item.id, renameValue.trim())
    }
    setRenamingItem(null)
    setRenameValue("")
  }

  const startRename = () => {
    setRenamingItem(item.id)
    setRenameValue(item.name)
  }

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className={cn(
              "group flex items-center gap-2 p-1 rounded-md cursor-pointer hover:bg-accent transition-colors",
              isActive && "bg-accent",
            )}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
          >
            {renamingItem === item.id ? (
              <div className="flex-1 flex items-center gap-2">
                {item.type === "folder" ? <Folder className="w-4 h-4 text-blue-500" /> : getFileIcon(item.name)}
                <Input
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename()
                    if (e.key === "Escape") {
                      setRenamingItem(null)
                      setRenameValue("")
                    }
                  }}
                  className="h-6 text-sm"
                  autoFocus
                />
              </div>
            ) : (
              <>
                <div
                  className="flex-1 flex items-center gap-2"
                  onClick={() => {
                    if (item.type === "folder") {
                      onToggleFolder(item.id)
                    } else {
                      onOpenFile(item.id)
                    }
                  }}
                >
                  {item.type === "folder" ? (
                    isExpanded ? (
                      <FolderOpen className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Folder className="w-4 h-4 text-blue-500" />
                    )
                  ) : (
                    getFileIcon(item.name)
                  )}
                  <span className="text-sm truncate">{item.name}</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      startRename()
                    }}
                  >
                    <Edit3 className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteFile(item.id)
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {item.type === "folder" && (
            <>
              <ContextMenuItem onClick={() => onAddFile("new-file.html", item.id)}>
                <FilePlus className="w-4 h-4 mr-2" />
                New File
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onAddFolder("new-folder", item.id)}>
                <FolderPlus className="w-4 h-4 mr-2" />
                New Folder
              </ContextMenuItem>
            </>
          )}
          <ContextMenuItem onClick={startRename}>
            <Edit3 className="w-4 h-4 mr-2" />
            Rename
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onDeleteFile(item.id)} className="text-destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {item.type === "folder" && isExpanded && item.children && (
        <div>
          {item.children.map((child) => (
            <FileTreeItem
              key={child.id}
              item={child}
              level={level + 1}
              activeFile={activeFile}
              expandedFolders={expandedFolders}
              onToggleFolder={onToggleFolder}
              onOpenFile={onOpenFile}
              onAddFile={onAddFile}
              onAddFolder={onAddFolder}
              onDeleteFile={onDeleteFile}
              onRenameFile={onRenameFile}
              renamingItem={renamingItem}
              setRenamingItem={setRenamingItem}
              renameValue={renameValue}
              setRenameValue={setRenameValue}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function FileExplorerAdvanced({
  files,
  activeFile,
  onOpenFile,
  onAddFile,
  onAddFolder,
  onDeleteFile,
  onRenameFile,
}: FileExplorerAdvancedProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(files.filter((item) => item.type === "folder").map((item) => item.id)),
  )
  const [newFileName, setNewFileName] = useState("")
  const [renamingItem, setRenamingItem] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [showNewFileInput, setShowNewFileInput] = useState(false)

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      onAddFile(newFileName.trim())
      setNewFileName("")
      setShowNewFileInput(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">EXPLORER</span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setShowNewFileInput(true)}
              title="New File"
            >
              <FilePlus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => onAddFolder("new-folder")}
              title="New Folder"
            >
              <FolderPlus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* File Tree */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {files.map((item) => (
            <FileTreeItem
              key={item.id}
              item={item}
              level={0}
              activeFile={activeFile}
              expandedFolders={expandedFolders}
              onToggleFolder={toggleFolder}
              onOpenFile={onOpenFile}
              onAddFile={onAddFile}
              onAddFolder={onAddFolder}
              onDeleteFile={onDeleteFile}
              onRenameFile={onRenameFile}
              renamingItem={renamingItem}
              setRenamingItem={setRenamingItem}
              renameValue={renameValue}
              setRenameValue={setRenameValue}
            />
          ))}
        </div>
      </ScrollArea>

      {/* New File Input */}
      {showNewFileInput && (
        <div className="p-3 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="filename.ext"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFile()
                if (e.key === "Escape") {
                  setShowNewFileInput(false)
                  setNewFileName("")
                }
              }}
              className="h-8 text-sm"
              autoFocus
            />
            <Button size="sm" onClick={handleCreateFile} disabled={!newFileName.trim()} className="h-8 px-3">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
