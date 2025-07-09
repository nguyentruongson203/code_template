"use client"

import { useRef } from "react"
import Editor, { type Monaco } from "@monaco-editor/react"
import { Skeleton } from "@/components/ui/skeleton"

interface FileType {
  name: string
  language: string
  content: string
}

interface HTMLEditorProps {
  file: FileType
  onChange: (content: string) => void
  theme?: string
  files?: FileType[]
}

export function HTMLEditor({ file, onChange, theme, files = [] }: HTMLEditorProps) {
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

    // Add custom HTML snippets
    monaco.languages.registerCompletionItemProvider("html", {
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
            label: "html5",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              "<!DOCTYPE html>",
              '<html lang="en">',
              "<head>",
              '    <meta charset="UTF-8">',
              '    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
              "    <title>${1:Document}</title>",
              "</head>",
              "<body>",
              "    ${2}",
              "</body>",
              "</html>",
            ].join("\n"),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "HTML5 boilerplate",
            range: range,
          },
          {
            label: "div.class",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '<div class="${1:className}">\n    ${2}\n</div>',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Div with class",
            range: range,
          },
          {
            label: "form",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              '<form action="${1:#}" method="${2:post}">',
              '    <input type="${3:text}" name="${4:name}" placeholder="${5:placeholder}">',
              '    <button type="submit">${6:Submit}</button>',
              "</form>",
            ].join("\n"),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Basic form template",
            range: range,
          },
          {
            label: "table",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              "<table>",
              "    <thead>",
              "        <tr>",
              "            <th>${1:Header 1}</th>",
              "            <th>${2:Header 2}</th>",
              "        </tr>",
              "    </thead>",
              "    <tbody>",
              "        <tr>",
              "            <td>${3:Data 1}</td>",
              "            <td>${4:Data 2}</td>",
              "        </tr>",
              "    </tbody>",
              "</table>",
            ].join("\n"),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Basic table template",
            range: range,
          },
        ]

        return { suggestions }
      },
    })

    // Add CSS and JS file references for IntelliSense
    const cssFiles = files.filter((f) => f.language === "css")
    const jsFiles = files.filter((f) => f.language === "javascript")

    // Provide CSS class suggestions from CSS files
    if (cssFiles.length > 0) {
      monaco.languages.registerCompletionItemProvider("html", {
        provideCompletionItems: (model, position) => {
          const textUntilPosition = model.getValueInRange({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          })

          // Check if we're inside a class attribute
          const classMatch = textUntilPosition.match(/class\s*=\s*["'][^"']*$/)
          if (!classMatch) return { suggestions: [] }

          const word = model.getWordUntilPosition(position)
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          }

          // Extract CSS classes from CSS files
          const cssClasses: string[] = []
          cssFiles.forEach((cssFile) => {
            const classMatches = cssFile.content.match(/\.([a-zA-Z_-][a-zA-Z0-9_-]*)/g)
            if (classMatches) {
              classMatches.forEach((match) => {
                const className = match.substring(1) // Remove the dot
                if (!cssClasses.includes(className)) {
                  cssClasses.push(className)
                }
              })
            }
          })

          const suggestions = cssClasses.map((className) => ({
            label: className,
            kind: monaco.languages.CompletionItemKind.Value,
            insertText: className,
            documentation: `CSS class from ${cssFiles.find((f) => f.content.includes(`.${className}`))?.name}`,
            range: range,
          }))

          return { suggestions }
        },
      })
    }

    // Add ID suggestions
    monaco.languages.registerCompletionItemProvider("html", {
      provideCompletionItems: (model, position) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        })

        const idMatch = textUntilPosition.match(/id\s*=\s*["'][^"']*$/)
        if (!idMatch) return { suggestions: [] }

        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }

        // Extract IDs from CSS and JS files
        const ids: string[] = []

        // From CSS files
        cssFiles.forEach((cssFile) => {
          const idMatches = cssFile.content.match(/#([a-zA-Z_-][a-zA-Z0-9_-]*)/g)
          if (idMatches) {
            idMatches.forEach((match) => {
              const id = match.substring(1)
              if (!ids.includes(id)) {
                ids.push(id)
              }
            })
          }
        })

        // From JS files
        jsFiles.forEach((jsFile) => {
          const idMatches = jsFile.content.match(/getElementById\s*$$\s*["']([^"']+)["']\s*$$/g)
          if (idMatches) {
            idMatches.forEach((match) => {
              const idMatch = match.match(/["']([^"']+)["']/)
              if (idMatch && !ids.includes(idMatch[1])) {
                ids.push(idMatch[1])
              }
            })
          }
        })

        const suggestions = ids.map((id) => ({
          label: id,
          kind: monaco.languages.CompletionItemKind.Value,
          insertText: id,
          documentation: "Referenced ID",
          range: range,
        }))

        return { suggestions }
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
