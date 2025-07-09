"use client"

import { useState, useEffect, useCallback } from "react"
import type { FileItem } from "@/types/file-system"

const getLanguageFromFileName = (name: string): string => {
  if (name.endsWith(".html")) return "html"
  if (name.endsWith(".css")) return "css"
  if (name.endsWith(".js")) return "javascript"
  if (name.endsWith(".json")) return "json"
  if (name.endsWith(".md")) return "markdown"
  return "plaintext"
}

// Simplified default file system - no folders initially
const defaultFileSystem: FileItem[] = [
  {
    id: "1",
    name: "index.html",
    type: "file",
    language: "html",
    path: "/index.html",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Playground</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1 id="title">Welcome to Code Playground!</h1>
        <p>Start coding and see your changes live.</p>
        <button id="btn" class="btn">Click me!</button>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
  },
  {
    id: "2",
    name: "style.css",
    type: "file",
    language: "css",
    path: "/style.css",
    content: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.container {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    text-align: center;
    max-width: 500px;
}

h1 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 2rem;
}

p {
    color: #666;
    margin-bottom: 2rem;
    line-height: 1.6;
}

.btn {
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.btn:active {
    transform: translateY(0);
}`,
  },
  {
    id: "3",
    name: "script.js",
    type: "file",
    language: "javascript",
    path: "/script.js",
    content: `// Welcome to the JavaScript playground!
console.log('🚀 Code Playground loaded successfully!');

// Get DOM elements
const title = document.getElementById('title');
const button = document.getElementById('btn');

// Add click event listener
button.addEventListener('click', function() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    title.style.color = randomColor;
    title.style.transform = 'scale(1.1)';
    
    console.log('Button clicked! Title color changed to:', randomColor);
    
    // Reset transform after animation
    setTimeout(() => {
        title.style.transform = 'scale(1)';
    }, 200);
});

// Add some interactive features
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    // Add keyboard shortcut
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            button.click();
            console.log('Keyboard shortcut triggered!');
        }
    });
});`,
  },
]

const STORAGE_KEY = "code-playground-filesystem-v4"

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function flattenFileSystem(items: FileItem[]): FileItem[] {
  const result: FileItem[] = []

  function traverse(items: FileItem[]) {
    for (const item of items) {
      result.push(item)
      if (item.children) {
        traverse(item.children)
      }
    }
  }

  traverse(items)
  return result
}

function findItemById(items: FileItem[], id: string): FileItem | null {
  const flattened = flattenFileSystem(items)
  return flattened.find((item) => item.id === id) || null
}

function updateItemInTree(items: FileItem[], id: string, updates: Partial<FileItem>): FileItem[] {
  return items.map((item) => {
    if (item.id === id) {
      return { ...item, ...updates }
    }
    if (item.children) {
      return { ...item, children: updateItemInTree(item.children, id, updates) }
    }
    return item
  })
}

function removeItemFromTree(items: FileItem[], id: string): FileItem[] {
  return items.filter((item) => {
    if (item.id === id) {
      return false
    }
    if (item.children) {
      item.children = removeItemFromTree(item.children, id)
    }
    return true
  })
}

function addItemToTree(items: FileItem[], parentId: string | null, newItem: FileItem): FileItem[] {
  if (!parentId) {
    return [...items, newItem]
  }

  return items.map((item) => {
    if (item.id === parentId && item.type === "folder") {
      return {
        ...item,
        children: [...(item.children || []), newItem],
      }
    }
    if (item.children) {
      return { ...item, children: addItemToTree(item.children, parentId, newItem) }
    }
    return item
  })
}

export function useFileSystem() {
  const [fileSystem, setFileSystem] = useState<FileItem[]>(() => {
    if (typeof window === "undefined") return defaultFileSystem

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultFileSystem
      }
    } catch (error) {
      console.error("Failed to load file system from localStorage:", error)
    }
    return defaultFileSystem
  })

  const [activeFileId, setActiveFileId] = useState<string>(() => {
    const firstFile = flattenFileSystem(fileSystem).find((item) => item.type === "file")
    return firstFile?.id || ""
  })

  // Save to localStorage whenever file system changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fileSystem))
    } catch (error) {
      console.error("Failed to save file system to localStorage:", error)
    }
  }, [fileSystem])

  const activeFile = findItemById(fileSystem, activeFileId)
  const allFiles = flattenFileSystem(fileSystem).filter((item) => item.type === "file")

  const openFile = useCallback(
    (id: string) => {
      const item = findItemById(fileSystem, id)
      if (item && item.type === "file") {
        setActiveFileId(id)
      }
    },
    [fileSystem],
  )

  const updateFile = useCallback((id: string, content: string) => {
    setFileSystem((prev) => updateItemInTree(prev, id, { content }))
  }, [])

  const createFile = useCallback(
    (name: string, parentId: string | null = null) => {
      const parentPath = parentId ? findItemById(fileSystem, parentId)?.path || "" : ""
      const newPath = parentPath + "/" + name

      // Check if file already exists
      const exists = allFiles.some((file) => file.path === newPath)
      if (exists) {
        console.warn(`File ${newPath} already exists`)
        return
      }

      const newFile: FileItem = {
        id: generateId(),
        name,
        type: "file",
        language: getLanguageFromFileName(name),
        content: "",
        path: newPath,
        parentId: parentId || undefined,
      }

      setFileSystem((prev) => addItemToTree(prev, parentId, newFile))
      setActiveFileId(newFile.id)
    },
    [fileSystem, allFiles],
  )

  const createFolder = useCallback(
    (name: string, parentId: string | null = null) => {
      const parentPath = parentId ? findItemById(fileSystem, parentId)?.path || "" : ""
      const newPath = parentPath + "/" + name

      const newFolder: FileItem = {
        id: generateId(),
        name,
        type: "folder",
        path: newPath,
        children: [],
        parentId: parentId || undefined,
      }

      setFileSystem((prev) => addItemToTree(prev, parentId, newFolder))
    },
    [fileSystem],
  )

  const deleteItem = useCallback(
    (id: string) => {
      const item = findItemById(fileSystem, id)
      if (!item) return

      // If deleting active file, switch to another file
      if (item.type === "file" && activeFileId === id) {
        const otherFiles = allFiles.filter((f) => f.id !== id)
        setActiveFileId(otherFiles[0]?.id || "")
      }

      setFileSystem((prev) => removeItemFromTree(prev, id))
    },
    [fileSystem, activeFileId, allFiles],
  )

  const renameItem = useCallback(
    (id: string, newName: string) => {
      const item = findItemById(fileSystem, id)
      if (!item) return

      const parentPath = item.parentId ? findItemById(fileSystem, item.parentId)?.path || "" : ""
      const newPath = parentPath + "/" + newName

      const updates: Partial<FileItem> = {
        name: newName,
        path: newPath,
      }

      if (item.type === "file") {
        updates.language = getLanguageFromFileName(newName)
      }

      setFileSystem((prev) => updateItemInTree(prev, id, updates))
    },
    [fileSystem],
  )

  const getFileByPath = useCallback(
    (path: string): FileItem | null => {
      // Simple path matching for flat structure
      const file = allFiles.find((file) => {
        return (
          file.path === path || file.path === "/" + path || file.name === path || file.name === path.split("/").pop()
        )
      })
      return file || null
    },
    [allFiles],
  )

  const resolveFilePath = useCallback((currentFilePath: string, relativePath: string): string => {
    // For simple flat structure, just return the relative path
    if (relativePath.startsWith("./")) {
      return "/" + relativePath.substring(2)
    }
    if (relativePath.startsWith("/")) {
      return relativePath
    }
    return "/" + relativePath
  }, [])

  return {
    fileSystem,
    activeFile,
    allFiles,
    openFile,
    updateFile,
    createFile,
    createFolder,
    deleteItem,
    renameItem,
    getFileByPath,
    resolveFilePath,
  }
}
