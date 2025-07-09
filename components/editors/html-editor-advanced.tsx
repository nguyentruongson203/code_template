"use client"

import { useRef } from "react"
import Editor, { type Monaco } from "@monaco-editor/react"
import { Skeleton } from "@/components/ui/skeleton"
import type { FileItem } from "@/types/file-system"

interface HTMLEditorAdvancedProps {
  file: FileItem
  onChange: (content: string) => void
  theme?: string
  allFiles?: FileItem[]
  resolveFilePath?: (currentPath: string, relativePath: string) => string
  getFileByPath?: (path: string) => FileItem | null
}

export function HTMLEditorAdvanced({
  file,
  onChange,
  theme,
  allFiles = [],
  resolveFilePath,
  getFileByPath,
}: HTMLEditorAdvancedProps) {
  const editorRef = useRef<any>(null)

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor

    // Enhanced HTML configuration
    monaco.languages.html.htmlDefaults.setOptions({
      format: {
        indentInnerHtml: true,
        wrapLineLength: 120,
        unformatted: "default",
        contentUnformatted: "pre,code,textarea",
        indentHandlebars: false,
        preserveNewLines: true,
        maxPreserveNewLines: 2,
        wrapAttributes: "auto",
        wrapAttributesIndentSize: 2,
        endWithNewline: false,
      },
      suggest: {
        html5: true,
        angular1: true,
        ionic: true,
      },
    })

    // Add file path suggestions for script src and link href
    monaco.languages.registerCompletionItemProvider("html", {
      provideCompletionItems: (model, position) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        })

        // Check for script src attribute
        const scriptSrcMatch = textUntilPosition.match(/src\s*=\s*["'][^"']*$/)
        // Check for link href attribute
        const linkHrefMatch = textUntilPosition.match(/href\s*=\s*["'][^"']*$/)

        if (!scriptSrcMatch && !linkHrefMatch) return { suggestions: [] }

        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }

        const suggestions: any[] = []

        // Get relevant files based on context
        let relevantFiles = allFiles
        if (scriptSrcMatch) {
          relevantFiles = allFiles.filter((f) => f.name.endsWith(".js"))
        } else if (linkHrefMatch) {
          relevantFiles = allFiles.filter((f) => f.name.endsWith(".css"))
        }

        relevantFiles.forEach((targetFile) => {
          if (targetFile.id === file.id) return // Skip self

          // Calculate relative path
          let relativePath = targetFile.path

          // Make it relative to current file
          const currentDir = file.path.substring(0, file.path.lastIndexOf("/"))
          if (targetFile.path.startsWith(currentDir)) {
            relativePath = "./" + targetFile.path.substring(currentDir.length + 1)
          } else {
            // Calculate relative path with ../
            const currentParts = currentDir.split("/").filter((p) => p)
            const targetParts = targetFile.path.split("/").filter((p) => p)

            let commonIndex = 0
            while (
              commonIndex < currentParts.length &&
              commonIndex < targetParts.length &&
              currentParts[commonIndex] === targetParts[commonIndex]
            ) {
              commonIndex++
            }

            const upLevels = currentParts.length - commonIndex
            const downPath = targetParts.slice(commonIndex).join("/")

            if (upLevels === 0) {
              relativePath = "./" + downPath
            } else {
              relativePath = "../".repeat(upLevels) + downPath
            }
          }

          suggestions.push({
            label: relativePath,
            kind: monaco.languages.CompletionItemKind.File,
            insertText: relativePath,
            documentation: `${targetFile.type === "file" ? "File" : "Folder"}: ${targetFile.path}`,
            range: range,
            detail: targetFile.path,
          })
        })

        return { suggestions }
      },
    })

    // Add CSS class suggestions from linked CSS files
    monaco.languages.registerCompletionItemProvider("html", {
      provideCompletionItems: (model, position) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        })

        const classMatch = textUntilPosition.match(/class\s*=\s*["'][^"']*$/)
        if (!classMatch) return { suggestions: [] }

        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }

        // Find linked CSS files
        const htmlContent = model.getValue()
        const linkMatches = htmlContent.match(/href\s*=\s*["']([^"']*)["']/g) || []

        const cssClasses: string[] = []

        linkMatches.forEach((linkMatch) => {
          const hrefMatch = linkMatch.match(/["']([^"']*)["']/)
          if (hrefMatch && resolveFilePath && getFileByPath) {
            const resolvedPath = resolveFilePath(file.path, hrefMatch[1])
            const cssFile = getFileByPath(resolvedPath)

            if (cssFile && cssFile.content) {
              const classMatches = cssFile.content.match(/\.([a-zA-Z_-][a-zA-Z0-9_-]*)/g)
              if (classMatches) {
                classMatches.forEach((match) => {
                  const className = match.substring(1)
                  if (!cssClasses.includes(className)) {
                    cssClasses.push(className)
                  }
                })
              }
            }
          }
        })

        const suggestions = cssClasses.map((className) => ({
          label: className,
          kind: monaco.languages.CompletionItemKind.Value,
          insertText: className,
          documentation: `CSS class from linked stylesheet`,
          range: range,
        }))

        return { suggestions }
      },
    })

    // Add validation for script src and link href
    monaco.languages.registerCodeActionProvider("html", {
      provideCodeActions: (model, range, context) => {
        const actions: any[] = []

        context.markers.forEach((marker) => {
          if (marker.message.includes("File not found")) {
            actions.push({
              title: "Create missing file",
              kind: "quickfix",
              edit: {
                edits: [],
              },
              isPreferred: true,
            })
          }
        })

        return {
          actions,
          dispose: () => {},
        }
      },
    })

    // Format on save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      editor.getAction("editor.action.formatDocument")?.run()
    })

    // Auto-format on paste
    editor.onDidPaste(() => {
      setTimeout(() => {
        editor.getAction("editor.action.formatDocument")?.run()
      }, 100)
    })
  }

  const editorOptions = {
    fontSize: 14,
    fontFamily: "JetBrains Mono, Fira Code, Monaco, Consolas, monospace",
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: "on" as const,
    automaticLayout: true,
    tabSize: 2,
    insertSpaces: true,
    detectIndentation: false,
    renderWhitespace: "selection" as const,
    bracketPairColorization: { enabled: true },
    guides: {
      bracketPairs: true,
      indentation: true,
    },
    suggest: {
      showKeywords: true,
      showSnippets: true,
      showClasses: true,
      showColors: true,
      showConstants: true,
      showConstructors: true,
      showEnums: true,
      showEvents: true,
      showFields: true,
      showFiles: true,
      showFolders: true,
      showFunctions: true,
      showInterfaces: true,
      showIssues: true,
      showKeywords: true,
      showMethods: true,
      showModules: true,
      showOperators: true,
      showProperties: true,
      showReferences: true,
      showStructs: true,
      showTypeParameters: true,
      showUnits: true,
      showUsers: true,
      showValues: true,
      showVariables: true,
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
    autoClosingBrackets: "always" as const,
    autoClosingQuotes: "always" as const,
    autoSurround: "languageDefined" as const,
  }

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        language="html"
        value={file.content || ""}
        onChange={(value) => onChange(value || "")}
        onMount={handleEditorDidMount}
        theme={theme === "dark" ? "vs-dark" : "vs-light"}
        options={editorOptions}
        loading={
          <div className="h-full w-full p-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        }
      />
    </div>
  )
}
