"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import * as monaco from "monaco-editor"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  FileText,
  Folder,
  FolderOpen,
  Plus,
  Search,
  Settings,
  GitBranch,
  Bug,
  Terminal,
  Globe,
  Play,
  Square,
  RotateCcw,
  Download,
  Copy,
  Trash2,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu"

interface FileNode {
  id: string
  name: string
  type: "file" | "folder"
  content?: string
  language?: string
  children?: FileNode[]
  isOpen?: boolean
  path: string
}

interface VSCodeEditorProps {
  className?: string
}

const getFileIcon = (fileName: string, isOpen?: boolean) => {
  if (fileName.endsWith(".html")) return <Globe className="w-4 h-4 text-orange-500" />
  if (fileName.endsWith(".css"))
    return (
      <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">
        C
      </div>
    )
  if (fileName.endsWith(".js"))
    return (
      <div className="w-4 h-4 bg-yellow-500 rounded-sm flex items-center justify-center text-black text-xs font-bold">
        J
      </div>
    )
  if (fileName.endsWith(".ts"))
    return (
      <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center text-white text-xs font-bold">
        T
      </div>
    )
  if (fileName.endsWith(".json"))
    return (
      <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">
        {"{"}
      </div>
    )
  return <FileText className="w-4 h-4 text-gray-500" />
}

const getFolderIcon = (isOpen: boolean) => {
  return isOpen ? <FolderOpen className="w-4 h-4 text-blue-500" /> : <Folder className="w-4 h-4 text-blue-500" />
}

const getLanguageFromFileName = (fileName: string): string => {
  if (fileName.endsWith(".html")) return "html"
  if (fileName.endsWith(".css")) return "css"
  if (fileName.endsWith(".js")) return "javascript"
  if (fileName.endsWith(".ts")) return "typescript"
  if (fileName.endsWith(".json")) return "json"
  if (fileName.endsWith(".md")) return "markdown"
  return "plaintext"
}

export default function VSCodeEditor({ className }: VSCodeEditorProps) {
  const { theme } = useTheme()
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeFile, setActiveFile] = useState<FileNode | null>(null)
  const [openTabs, setOpenTabs] = useState<FileNode[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(250)
  const [panelHeight, setPanelHeight] = useState(200)
  const [showPanel, setShowPanel] = useState(true)
  const [activePanel, setActivePanel] = useState<"terminal" | "output" | "problems">("terminal")
  const [terminalOutput, setTerminalOutput] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

  // Initial file structure
  const [fileTree, setFileTree] = useState<FileNode[]>([
    {
      id: "1",
      name: "src",
      type: "folder",
      isOpen: true,
      path: "/src",
      children: [
        {
          id: "2",
          name: "index.html",
          type: "file",
          language: "html",
          path: "/src/index.html",
          content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VS Code Playground</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Welcome to VS Code Playground</h1>
        <p>Start coding with full VS Code experience!</p>
        <button id="btn" onclick="handleClick()">Click me!</button>
        <div id="output"></div>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
        },
        {
          id: "3",
          name: "style.css",
          type: "file",
          language: "css",
          path: "/src/style.css",
          content: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.container {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    text-align: center;
    max-width: 500px;
    width: 90%;
}

h1 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 2rem;
}

p {
    color: #666;
    margin-bottom: 2rem;
    font-size: 1.1rem;
}

button {
    background: #667eea;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

button:hover {
    background: #5a6fd8;
    transform: translateY(-2px);
}

#output {
    margin-top: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 5px;
    min-height: 50px;
    display: none;
}`,
        },
        {
          id: "4",
          name: "script.js",
          type: "file",
          language: "javascript",
          path: "/src/script.js",
          content: `// VS Code Playground JavaScript
console.log('Welcome to VS Code Playground!');

function handleClick() {
    const output = document.getElementById('output');
    const messages = [
        'Hello from VS Code!',
        'This is a full-featured editor!',
        'Enjoy coding with IntelliSense!',
        'Monaco Editor is awesome!',
        'Build amazing projects!'
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    output.style.display = 'block';
    output.innerHTML = \`
        <h3>Output:</h3>
        <p>\${randomMessage}</p>
        <small>Generated at: \${new Date().toLocaleTimeString()}</small>
    \`;
    
    console.log('Button clicked!', randomMessage);
}

// Advanced JavaScript features demo
class CodePlayground {
    constructor(name) {
        this.name = name;
        this.features = ['IntelliSense', 'Debugging', 'Git Integration', 'Extensions'];
    }
    
    async loadProject() {
        console.log(\`Loading \${this.name}...\`);
        return new Promise(resolve => {
            setTimeout(() => {
                console.log('Project loaded successfully!');
                resolve(this.features);
            }, 1000);
        });
    }
    
    getFeatures() {
        return this.features.map(feature => \`✓ \${feature}\`).join('\\n');
    }
}

const playground = new CodePlayground('VS Code Playground');
playground.loadProject().then(features => {
    console.log('Available features:', features);
});`,
        },
      ],
    },
    {
      id: "5",
      name: "package.json",
      type: "file",
      language: "json",
      path: "/package.json",
      content: `{
  "name": "vscode-playground",
  "version": "1.0.0",
  "description": "A VS Code-like playground for web development",
  "main": "src/index.html",
  "scripts": {
    "start": "live-server src",
    "build": "webpack --mode production",
    "dev": "webpack serve --mode development"
  },
  "keywords": ["vscode", "playground", "monaco-editor"],
  "author": "Your Name",
  "license": "MIT",
  "devDependencies": {
    "live-server": "^1.2.2",
    "webpack": "^5.0.0",
    "webpack-cli": "^4.0.0",
    "webpack-dev-server": "^4.0.0"
  }
}`,
    },
  ])

  // Initialize Monaco Editor
  useEffect(() => {
    if (!containerRef.current) return

    const initializeEditor = async () => {
      try {
        // Configure Monaco environment for better VS Code experience
        monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true)
        monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true)

        // Enhanced TypeScript/JavaScript configuration
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
          lib: ["ES2020", "DOM", "DOM.Iterable"],
        })

        // Add comprehensive type definitions
        const typeDefinitions = `
          // DOM API
          declare var console: Console;
          declare var document: Document;
          declare var window: Window & typeof globalThis;
          declare var localStorage: Storage;
          declare var sessionStorage: Storage;
          declare var fetch: typeof fetch;
          
          interface Console {
            log(...data: any[]): void;
            error(...data: any[]): void;
            warn(...data: any[]): void;
            info(...data: any[]): void;
            debug(...data: any[]): void;
            trace(...data: any[]): void;
            clear(): void;
            count(label?: string): void;
            time(label?: string): void;
            timeEnd(label?: string): void;
          }
          
          interface Document extends Node, DocumentOrShadowRoot, FontFaceSource, GlobalEventHandlers, NonElementParentNode, ParentNode, XPathEvaluatorBase {
            getElementById(elementId: string): HTMLElement | null;
            querySelector<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K] | null;
            querySelector<K extends keyof SVGElementTagNameMap>(selectors: K): SVGElementTagNameMap[K] | null;
            querySelector<E extends Element = Element>(selectors: string): E | null;
            querySelectorAll<K extends keyof HTMLElementTagNameMap>(selectors: K): NodeListOf<HTMLElementTagNameMap[K]>;
            querySelectorAll<K extends keyof SVGElementTagNameMap>(selectors: K): NodeListOf<SVGElementTagNameMap[K]>;
            querySelectorAll<E extends Element = Element>(selectors: string): NodeListOf<E>;
            createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementTagNameMap[K];
            createElement(tagName: string, options?: ElementCreationOptions): HTMLElement;
            addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
            addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
            removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
            removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
          }
          
          interface Window extends EventTarget, AnimationFrameProvider, GlobalEventHandlers, WindowEventHandlers, WindowLocalStorage, WindowOrWorkerGlobalScope, WindowSessionStorage {
            addEventListener<K extends keyof WindowEventMap>(type: K, listener: (this: Window, ev: WindowEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
            addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
            setTimeout(handler: TimerHandler, timeout?: number, ...arguments: any[]): number;
            setInterval(handler: TimerHandler, timeout?: number, ...arguments: any[]): number;
            clearTimeout(id?: number): void;
            clearInterval(id?: number): void;
            alert(message?: any): void;
            confirm(message?: string): boolean;
            prompt(message?: string, _default?: string): string | null;
            requestAnimationFrame(callback: FrameRequestCallback): number;
            cancelAnimationFrame(handle: number): void;
          }
          
          interface HTMLElement extends Element, ElementCSSInlineStyle, ElementContentEditable, GlobalEventHandlers, HTMLOrSVGElement {
            click(): void;
            focus(options?: FocusOptions): void;
            blur(): void;
            innerHTML: string;
            innerText: string;
            textContent: string | null;
            style: CSSStyleDeclaration;
            className: string;
            id: string;
            onclick: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null;
            addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
            addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
          }
          
          // Common HTML elements
          interface HTMLButtonElement extends HTMLElement {
            disabled: boolean;
            type: string;
            value: string;
          }
          
          interface HTMLInputElement extends HTMLElement {
            value: string;
            type: string;
            placeholder: string;
            disabled: boolean;
            checked: boolean;
          }
          
          interface HTMLDivElement extends HTMLElement {}
          interface HTMLSpanElement extends HTMLElement {}
          interface HTMLParagraphElement extends HTMLElement {}
          interface HTMLHeadingElement extends HTMLElement {}
          
          // Storage API
          interface Storage {
            getItem(key: string): string | null;
            setItem(key: string, value: string): void;
            removeItem(key: string): void;
            clear(): void;
            key(index: number): string | null;
            readonly length: number;
          }
          
          // Fetch API
          declare function fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
          
          interface Response {
            ok: boolean;
            status: number;
            statusText: string;
            json(): Promise<any>;
            text(): Promise<string>;
            blob(): Promise<Blob>;
          }
        `

        monaco.languages.typescript.javascriptDefaults.addExtraLib(typeDefinitions, "lib.dom.d.ts")

        // Create editor with VS Code-like configuration
        const editor = monaco.editor.create(containerRef.current, {
          value: "",
          language: "javascript",
          theme: theme === "dark" ? "vs-dark" : "vs",
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Monaco', 'Consolas', monospace",
          fontLigatures: true,
          lineNumbers: "on",
          roundedSelection: false,
          scrollBeyondLastLine: false,
          minimap: { enabled: true },
          automaticLayout: true,
          wordWrap: "on",
          tabSize: 2,
          insertSpaces: true,
          detectIndentation: true,
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
          renderWhitespace: "selection",
          renderControlCharacters: true,
          smoothScrolling: true,
          cursorBlinking: "blink",
          cursorSmoothCaretAnimation: "on",
          find: {
            addExtraSpaceOnTop: false,
            autoFindInSelection: "never",
            seedSearchStringFromSelection: "always",
          },
        })

        editorRef.current = editor

        // Add VS Code-like key bindings
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
          editor.getAction("editor.action.formatDocument")?.run()
          addTerminalOutput("File saved and formatted")
        })

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
          editor.getAction("actions.find")?.run()
        })

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
          editor.getAction("editor.action.startFindReplaceAction")?.run()
        })

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyP, () => {
          editor.getAction("editor.action.quickCommand")?.run()
        })

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyG, () => {
          editor.getAction("editor.action.gotoLine")?.run()
        })

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, () => {
          editor.getAction("editor.action.addSelectionToNextFindMatch")?.run()
        })

        // Listen for content changes
        editor.onDidChangeModelContent(() => {
          if (activeFile) {
            const content = editor.getValue()
            updateFileContent(activeFile.id, content)
          }
        })

        // Open first file by default
        const firstFile = findFirstFile(fileTree)
        if (firstFile) {
          openFile(firstFile)
        }

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

  // Update theme
  useEffect(() => {
    if (editorRef.current) {
      monaco.editor.setTheme(theme === "dark" ? "vs-dark" : "vs")
    }
  }, [theme])

  const findFirstFile = (nodes: FileNode[]): FileNode | null => {
    for (const node of nodes) {
      if (node.type === "file") return node
      if (node.children) {
        const found = findFirstFile(node.children)
        if (found) return found
      }
    }
    return null
  }

  const findFileById = (nodes: FileNode[], id: string): FileNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children) {
        const found = findFileById(node.children, id)
        if (found) return found
      }
    }
    return null
  }

  const updateFileContent = (fileId: string, content: string) => {
    const updateNode = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.id === fileId) {
          return { ...node, content }
        }
        if (node.children) {
          return { ...node, children: updateNode(node.children) }
        }
        return node
      })
    }
    setFileTree(updateNode(fileTree))
  }

  const openFile = useCallback((file: FileNode) => {
    if (file.type !== "file") return

    setActiveFile(file)

    // Add to open tabs if not already open
    setOpenTabs((prev) => {
      const exists = prev.find((tab) => tab.id === file.id)
      if (!exists) {
        return [...prev, file]
      }
      return prev
    })

    // Update editor content and language
    if (editorRef.current) {
      const model = monaco.editor.createModel(
        file.content || "",
        file.language || getLanguageFromFileName(file.name),
        monaco.Uri.file(file.path),
      )
      editorRef.current.setModel(model)
    }
  }, [])

  const closeTab = (fileId: string) => {
    setOpenTabs((prev) => prev.filter((tab) => tab.id !== fileId))

    if (activeFile?.id === fileId) {
      const remainingTabs = openTabs.filter((tab) => tab.id !== fileId)
      if (remainingTabs.length > 0) {
        openFile(remainingTabs[remainingTabs.length - 1])
      } else {
        setActiveFile(null)
        if (editorRef.current) {
          editorRef.current.setModel(null)
        }
      }
    }
  }

  const toggleFolder = (folderId: string) => {
    const updateNode = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.id === folderId && node.type === "folder") {
          return { ...node, isOpen: !node.isOpen }
        }
        if (node.children) {
          return { ...node, children: updateNode(node.children) }
        }
        return node
      })
    }
    setFileTree(updateNode(fileTree))
  }

  const addTerminalOutput = (message: string) => {
    setTerminalOutput((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const runCode = async () => {
    if (!activeFile) return

    setIsRunning(true)
    addTerminalOutput(`Running ${activeFile.name}...`)

    // Simulate code execution
    setTimeout(() => {
      addTerminalOutput("Code executed successfully!")
      setIsRunning(false)
    }, 1000)
  }

  const clearTerminal = () => {
    setTerminalOutput([])
  }

  const renderFileTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map((node) => (
      <div key={node.id}>
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className={cn(
                "flex items-center gap-2 px-2 py-1 text-sm cursor-pointer hover:bg-accent/50 rounded-sm",
                activeFile?.id === node.id && "bg-accent text-accent-foreground",
              )}
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
              onClick={() => {
                if (node.type === "file") {
                  openFile(node)
                } else {
                  toggleFolder(node.id)
                }
              }}
            >
              {node.type === "folder" && (
                <button className="p-0 h-4 w-4 flex items-center justify-center">
                  {node.isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
              )}
              {node.type === "folder" ? getFolderIcon(node.isOpen || false) : getFileIcon(node.name)}
              <span className="truncate">{node.name}</span>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </ContextMenuItem>
            <ContextMenuItem>
              <Download className="w-4 h-4 mr-2" />
              Download
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        {node.type === "folder" && node.isOpen && node.children && (
          <div>{renderFileTree(node.children, depth + 1)}</div>
        )}
      </div>
    ))
  }

  if (isLoading) {
    return (
      <div className={cn("h-screen w-full bg-background flex items-center justify-center", className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading VS Code Editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("h-screen w-full bg-background flex flex-col", isFullscreen && "fixed inset-0 z-50", className)}>
      {/* Title Bar */}
      <div className="h-8 bg-background border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium ml-4">VS Code Playground</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(!isFullscreen)} className="h-6 w-6 p-0">
            {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </Button>
        </div>
      </div>

      {/* Menu Bar */}
      <div className="h-8 bg-background border-b flex items-center px-4 text-sm">
        <div className="flex items-center gap-4">
          <span className="hover:bg-accent px-2 py-1 rounded cursor-pointer">File</span>
          <span className="hover:bg-accent px-2 py-1 rounded cursor-pointer">Edit</span>
          <span className="hover:bg-accent px-2 py-1 rounded cursor-pointer">View</span>
          <span className="hover:bg-accent px-2 py-1 rounded cursor-pointer">Go</span>
          <span className="hover:bg-accent px-2 py-1 rounded cursor-pointer">Run</span>
          <span className="hover:bg-accent px-2 py-1 rounded cursor-pointer">Terminal</span>
          <span className="hover:bg-accent px-2 py-1 rounded cursor-pointer">Help</span>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Activity Bar */}
        <div className="w-12 bg-accent/20 border-r flex flex-col items-center py-2 gap-2">
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0 bg-accent">
            <FileText className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
            <Search className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
            <GitBranch className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
            <Bug className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Sidebar */}
        <div className="w-64 bg-background border-r flex flex-col">
          <div className="p-2 border-b">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">EXPLORER</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Plus className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-1">{renderFileTree(fileTree)}</div>
          </ScrollArea>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Tab Bar */}
          <div className="h-9 bg-background border-b flex items-center">
            {openTabs.map((tab) => (
              <div
                key={tab.id}
                className={cn(
                  "flex items-center gap-2 px-3 py-1 text-sm border-r cursor-pointer hover:bg-accent/50",
                  activeFile?.id === tab.id && "bg-background border-b-2 border-b-primary",
                )}
                onClick={() => openFile(tab)}
              >
                {getFileIcon(tab.name)}
                <span>{tab.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1 hover:bg-accent"
                  onClick={(e) => {
                    e.stopPropagation()
                    closeTab(tab.id)
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>

          {/* Editor */}
          <div className="flex-1 relative">
            <div ref={containerRef} className="absolute inset-0" />
          </div>
        </div>
      </div>

      {/* Panel */}
      {showPanel && (
        <div className="h-48 border-t bg-background flex flex-col">
          <div className="h-8 border-b flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-6 text-xs", activePanel === "terminal" && "bg-accent")}
                onClick={() => setActivePanel("terminal")}
              >
                <Terminal className="w-3 h-3 mr-1" />
                Terminal
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-6 text-xs", activePanel === "output" && "bg-accent")}
                onClick={() => setActivePanel("output")}
              >
                <Globe className="w-3 h-3 mr-1" />
                Output
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-6 text-xs", activePanel === "problems" && "bg-accent")}
                onClick={() => setActivePanel("problems")}
              >
                <Bug className="w-3 h-3 mr-1" />
                Problems
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={runCode} disabled={isRunning} className="h-6 text-xs">
                {isRunning ? <Square className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
                {isRunning ? "Stop" : "Run"}
              </Button>
              <Button variant="ghost" size="sm" onClick={clearTerminal} className="h-6 text-xs">
                <RotateCcw className="w-3 h-3 mr-1" />
                Clear
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowPanel(false)} className="h-6 w-6 p-0">
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            {activePanel === "terminal" && (
              <ScrollArea className="h-full">
                <div className="p-2 font-mono text-sm">
                  <div className="text-green-500 mb-2">VS Code Playground Terminal</div>
                  {terminalOutput.map((line, index) => (
                    <div key={index} className="text-muted-foreground">
                      {line}
                    </div>
                  ))}
                  <div className="flex items-center mt-2">
                    <span className="text-green-500 mr-2">$</span>
                    <span className="animate-pulse">|</span>
                  </div>
                </div>
              </ScrollArea>
            )}
            {activePanel === "output" && (
              <div className="p-4 text-center text-muted-foreground">
                Output panel - Run your code to see results here
              </div>
            )}
            {activePanel === "problems" && (
              <div className="p-4 text-center text-muted-foreground">No problems detected</div>
            )}
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="h-6 bg-primary text-primary-foreground flex items-center justify-between px-4 text-xs">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <GitBranch className="w-3 h-3" />
            main
          </span>
          <span>0 errors, 0 warnings</span>
          {activeFile && (
            <span className="flex items-center gap-1">
              {getFileIcon(activeFile.name)}
              {activeFile.name} - {activeFile.language?.toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span>Ln 1, Col 1</span>
          <span>UTF-8</span>
          <span>LF</span>
          <span>JavaScript</span>
        </div>
      </div>
    </div>
  )
}
