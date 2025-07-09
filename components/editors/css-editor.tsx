"use client"

import { useRef } from "react"
import Editor, { type Monaco } from "@monaco-editor/react"
import { Skeleton } from "@/components/ui/skeleton"

interface FileType {
  name: string
  language: string
  content: string
}

interface CSSEditorProps {
  file: FileType
  onChange: (content: string) => void
  theme?: string
  files?: FileType[]
}

export function CSSEditor({ file, onChange, theme, files = [] }: CSSEditorProps) {
  const editorRef = useRef<any>(null)

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor

    // Enhanced CSS configuration
    monaco.languages.css.cssDefaults.setOptions({
      validate: true,
      lint: {
        compatibleVendorPrefixes: "ignore",
        vendorPrefix: "warning",
        duplicateProperties: "warning",
        emptyRules: "warning",
        importStatement: "ignore",
        boxModel: "ignore",
        universalSelector: "ignore",
        zeroUnits: "ignore",
        fontFaceProperties: "warning",
        hexColorLength: "error",
        argumentsInColorFunction: "error",
        unknownProperties: "warning",
        ieHack: "ignore",
        unknownVendorSpecificProperties: "ignore",
        propertyIgnoredDueToDisplay: "warning",
        important: "ignore",
        float: "ignore",
        idSelector: "ignore",
      },
    })

    // Add CSS snippets and utilities
    monaco.languages.registerCompletionItemProvider("css", {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }

        const suggestions = [
          {
            label: "flexbox",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              "display: flex;",
              "justify-content: ${1:center};",
              "align-items: ${2:center};",
              "flex-direction: ${3:row};",
            ].join("\n"),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Flexbox layout",
            range: range,
          },
          {
            label: "grid",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              "display: grid;",
              "grid-template-columns: ${1:repeat(auto-fit, minmax(250px, 1fr))};",
              "gap: ${2:1rem};",
            ].join("\n"),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "CSS Grid layout",
            range: range,
          },
          {
            label: "animation",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              "animation: ${1:animationName} ${2:1s} ${3:ease-in-out} ${4:infinite};",
              "",
              "@keyframes ${1:animationName} {",
              "    0% {",
              "        ${5:transform: translateX(0);}",
              "    }",
              "    100% {",
              "        ${6:transform: translateX(100px);}",
              "    }",
              "}",
            ].join("\n"),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "CSS Animation with keyframes",
            range: range,
          },
          {
            label: "gradient",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "background: linear-gradient(${1:45deg}, ${2:#ff6b6b}, ${3:#4ecdc4});",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Linear gradient background",
            range: range,
          },
          {
            label: "shadow",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "box-shadow: ${1:0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)};",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Box shadow",
            range: range,
          },
          {
            label: "responsive",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              "/* Mobile first */",
              "@media (min-width: 768px) {",
              "    ${1:/* Tablet styles */}",
              "}",
              "",
              "@media (min-width: 1024px) {",
              "    ${2:/* Desktop styles */}",
              "}",
            ].join("\n"),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Responsive media queries",
            range: range,
          },
        ]

        return { suggestions }
      },
    })

    // Provide HTML class and ID suggestions
    const htmlFiles = files.filter((f) => f.language === "html")
    if (htmlFiles.length > 0) {
      monaco.languages.registerCompletionItemProvider("css", {
        provideCompletionItems: (model, position) => {
          const textUntilPosition = model.getValueInRange({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          })

          // Check if we're typing a class selector
          const classMatch = textUntilPosition.match(/\.([a-zA-Z_-]*)$/)
          const idMatch = textUntilPosition.match(/#([a-zA-Z_-]*)$/)

          if (!classMatch && !idMatch) return { suggestions: [] }

          const word = model.getWordUntilPosition(position)
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          }

          const suggestions: any[] = []

          htmlFiles.forEach((htmlFile) => {
            if (classMatch) {
              // Extract classes from HTML
              const classMatches = htmlFile.content.match(/class\s*=\s*["']([^"']*)["']/g)
              if (classMatches) {
                classMatches.forEach((match) => {
                  const classNames = match.match(/["']([^"']*)["']/)?.[1]?.split(/\s+/) || []
                  classNames.forEach((className) => {
                    if (className && !suggestions.find((s) => s.label === className)) {
                      suggestions.push({
                        label: className,
                        kind: monaco.languages.CompletionItemKind.Value,
                        insertText: className,
                        documentation: `Class from ${htmlFile.name}`,
                        range: range,
                      })
                    }
                  })
                })
              }
            }

            if (idMatch) {
              // Extract IDs from HTML
              const idMatches = htmlFile.content.match(/id\s*=\s*["']([^"']*)["']/g)
              if (idMatches) {
                idMatches.forEach((match) => {
                  const id = match.match(/["']([^"']*)["']/)?.[1]
                  if (id && !suggestions.find((s) => s.label === id)) {
                    suggestions.push({
                      label: id,
                      kind: monaco.languages.CompletionItemKind.Value,
                      insertText: id,
                      documentation: `ID from ${htmlFile.name}`,
                      range: range,
                    })
                  }
                })
              }
            }
          })

          return { suggestions }
        },
      })
    }

    // Color picker support
    monaco.languages.registerColorProvider("css", {
      provideColorPresentations: (model, colorInfo) => {
        const color = colorInfo.color
        const red = Math.round(color.red * 255)
        const green = Math.round(color.green * 255)
        const blue = Math.round(color.blue * 255)
        const alpha = color.alpha

        return [
          {
            label: `rgb(${red}, ${green}, ${blue})`,
          },
          {
            label: `rgba(${red}, ${green}, ${blue}, ${alpha})`,
          },
          {
            label: `#${red.toString(16).padStart(2, "0")}${green.toString(16).padStart(2, "0")}${blue
              .toString(16)
              .padStart(2, "0")}`,
          },
        ]
      },
      provideDocumentColors: (model) => {
        const colors: any[] = []
        const text = model.getValue()

        // Match hex colors
        const hexMatches = text.matchAll(/#([0-9a-fA-F]{3,6})/g)
        for (const match of hexMatches) {
          const hex = match[1]
          let r, g, b
          if (hex.length === 3) {
            r = Number.parseInt(hex[0] + hex[0], 16) / 255
            g = Number.parseInt(hex[1] + hex[1], 16) / 255
            b = Number.parseInt(hex[2] + hex[2], 16) / 255
          } else {
            r = Number.parseInt(hex.substr(0, 2), 16) / 255
            g = Number.parseInt(hex.substr(2, 2), 16) / 255
            b = Number.parseInt(hex.substr(4, 2), 16) / 255
          }

          colors.push({
            color: { red: r, green: g, blue: b, alpha: 1 },
            range: {
              startLineNumber: model.getPositionAt(match.index!).lineNumber,
              startColumn: model.getPositionAt(match.index!).column,
              endLineNumber: model.getPositionAt(match.index! + match[0].length).lineNumber,
              endColumn: model.getPositionAt(match.index! + match[0].length).column,
            },
          })
        }

        return colors
      },
    })

    // Format on save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      editor.getAction("editor.action.formatDocument")?.run()
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
      showColors: true,
      showProperties: true,
      showValues: true,
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
    colorDecorators: true,
  }

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        language="css"
        value={file.content}
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
