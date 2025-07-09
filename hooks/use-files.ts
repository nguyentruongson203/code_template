"use client"

import { useState, useEffect, useCallback } from "react"

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

const getLanguageFromFileName = (name: string): string => {
  if (name.endsWith(".html")) return "html"
  if (name.endsWith(".css")) return "css"
  if (name.endsWith(".js")) return "javascript"
  if (name.endsWith(".json")) return "json"
  return "plaintext"
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function flattenFileSystem(items: FileType[]): FileType[] {
  const result: FileType[] = []
  function traverse(items: FileType[]) {
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

const defaultFiles: FileType[] = [
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
    <title>Demo Playground</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>🚀 Code Playground Demo</h1>
        <p>This is a simple demo with interactive features.</p>
        
        <div class="buttons">
            <button id="colorBtn" class="btn primary">Change Color</button>
            <button id="alertBtn" class="btn secondary">Show Alert</button>
            <button id="reloadBtn" class="btn danger">Reload Page</button>
        </div>
        
        <div class="output">
            <h3>Output:</h3>
            <div id="output"></div>
        </div>
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
    padding: 20px;
}

.container {
    max-width: 600px;
    margin: 0 auto;
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

h1 {
    color: #333;
    margin-bottom: 1rem;
    text-align: center;
}

p {
    color: #666;
    margin-bottom: 2rem;
    text-align: center;
    line-height: 1.6;
}

.buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
}

.btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.btn.primary {
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
}

.btn.secondary {
    background: linear-gradient(45deg, #4ecdc4, #44a08d);
    color: white;
}

.btn.danger {
    background: linear-gradient(45deg, #ff6b6b, #ee5a52);
    color: white;
}

.output {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
    border-left: 4px solid #667eea;
}

.output h3 {
    margin-bottom: 0.5rem;
    color: #333;
}

#output {
    font-family: 'Courier New', monospace;
    color: #666;
    min-height: 50px;
}`,
  },
  {
    id: "3",
    name: "script.js",
    type: "file",
    language: "javascript",
    path: "/script.js",
    content: `console.log('🚀 Demo playground loaded!');

// Get DOM elements
const colorBtn = document.getElementById('colorBtn');
const alertBtn = document.getElementById('alertBtn');
const reloadBtn = document.getElementById('reloadBtn');
const output = document.getElementById('output');

// Colors array
const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#a55eea'];
let colorIndex = 0;

// Change color button
colorBtn.addEventListener('click', function() {
    const newColor = colors[colorIndex % colors.length];
    document.body.style.background = \`linear-gradient(135deg, \${newColor}, #764ba2)\`;
    
    output.innerHTML += \`<div>🎨 Background changed to: \${newColor}</div>\`;
    console.log('Background color changed to:', newColor);
    
    colorIndex++;
});

// Alert button
alertBtn.addEventListener('click', function() {
    const message = 'Hello from the playground!';
    alert(message);
    
    output.innerHTML += \`<div>🔔 Alert shown: \${message}</div>\`;
    console.log('Alert displayed:', message);
});

// Reload button
reloadBtn.addEventListener('click', function() {
    console.log('🔄 Reloading page...');
    output.innerHTML += \`<div>🔄 Page will reload in 1 second...</div>\`;
    
    setTimeout(() => {
        window.location.reload();
    }, 1000);
});

// Log some demo data
console.log('Available functions:', {
    changeColor: 'Changes background color',
    showAlert: 'Shows browser alert',
    reloadPage: 'Reloads the current page'
});

console.warn('This is a warning message');
console.error('This is an error message (demo)');
console.info('Demo playground ready for interaction!');

// Test window object
console.log('Window object available:', typeof window !== 'undefined');
console.log('Current URL:', window.location.href);`,
  },
]

const STORAGE_KEY = "playground-files-v1"

export function useFiles() {
  const [files, setFiles] = useState<FileType[]>(() => {
    if (typeof window === "undefined") return defaultFiles

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultFiles
      }
    } catch (error) {
      console.error("Failed to load files:", error)
    }
    return defaultFiles
  })

  const [active, setActive] = useState(files[0]?.name || "")

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files))
  }, [files])

  const activeFile = files.find((f) => f.name === active) || files[0] || null

  const openFile = useCallback((name: string) => setActive(name), [])

  const updateFile = useCallback((name: string, content: string) => {
    setFiles((prev) => prev.map((f) => (f.name === name ? { ...f, content } : f)))
  }, [])

  const addFile = useCallback(
    (name: string) => {
      if (files.some((f) => f.name === name)) return

      const newFile: FileType = {
        id: generateId(),
        name,
        type: "file",
        language: getLanguageFromFileName(name),
        content: "",
        path: "/" + name,
      }

      setFiles((prev) => [...prev, newFile])
      setActive(name)
    },
    [files],
  )

  const deleteFile = useCallback(
    (name: string) => {
      if (files.length <= 1) return

      setFiles((prev) => prev.filter((f) => f.name !== name))

      if (active === name) {
        const remainingFiles = files.filter((f) => f.name !== name)
        setActive(remainingFiles[0]?.name || "")
      }
    },
    [files, active],
  )

  const renameFile = useCallback(
    (oldName: string, newName: string) => {
      if (files.some((f) => f.name === newName)) return

      setFiles((prev) =>
        prev.map((file) =>
          file.name === oldName ? { ...file, name: newName, language: getLanguageFromFileName(newName) } : file,
        ),
      )

      if (active === oldName) {
        setActive(newName)
      }
    },
    [files, active],
  )

  const addItemToTree = (tree: FileType[], parentId: string | null, item: FileType): FileType[] => {
    if (!parentId) {
      return [...tree, item]
    }

    return tree.map((node) => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [...(node.children || []), item],
        }
      }

      if (node.children) {
        return { ...node, children: addItemToTree(node.children, parentId, item) }
      }

      return node
    })
  }

  const addFolder = useCallback(
    (name: string, parentId?: string) => {
      const parentPath = parentId ? flattenFileSystem(files).find((f) => f.id === parentId)?.path || "" : ""
      const newPath = parentPath + "/" + name

      const newFolder: FileType = {
        id: generateId(),
        name,
        type: "folder",
        path: newPath,
        children: [],
        parentId,
      }

      setFiles((prev) => addItemToTree(prev, parentId || null, newFolder))
    },
    [files],
  )

  return {
    files,
    activeFile,
    openFile,
    updateFile,
    addFile,
    addFolder,
    deleteFile,
    renameFile,
  }
}
