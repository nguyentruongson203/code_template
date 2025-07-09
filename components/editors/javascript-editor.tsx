"use client"

import { useRef } from "react"
import Editor, { type Monaco } from "@monaco-editor/react"
import { Skeleton } from "@/components/ui/skeleton"

interface FileType {
  name: string
  language: string
  content: string
}

interface JavaScriptEditorProps {
  file: FileType
  onChange: (content: string) => void
  theme?: string
  files?: FileType[]
}

export function JavaScriptEditor({ file, onChange, theme, files = [] }: JavaScriptEditorProps) {
  const editorRef = useRef<any>(null)

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor

    // Enhanced JavaScript/TypeScript configuration
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: "React",
      allowJs: true,
      typeRoots: ["node_modules/@types"],
    })

    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      noSuggestionDiagnostics: false,
    })

    // Add DOM types for better IntelliSense
    const domTypes = `
      declare var console: {
        log(...args: any[]): void;
        error(...args: any[]): void;
        warn(...args: any[]): void;
        info(...args: any[]): void;
      };
      
      declare var document: {
        getElementById(id: string): HTMLElement | null;
        querySelector(selector: string): HTMLElement | null;
        querySelectorAll(selector: string): NodeList;
        createElement(tagName: string): HTMLElement;
        addEventListener(type: string, listener: EventListener): void;
        removeEventListener(type: string, listener: EventListener): void;
      };
      
      declare var window: {
        addEventListener(type: string, listener: EventListener): void;
        removeEventListener(type: string, listener: EventListener): void;
        setTimeout(callback: Function, delay: number): number;
        setInterval(callback: Function, delay: number): number;
        clearTimeout(id: number): void;
        clearInterval(id: number): void;
        alert(message: string): void;
        confirm(message: string): boolean;
        prompt(message: string, defaultValue?: string): string | null;
      };
      
      interface HTMLElement {
        innerHTML: string;
        textContent: string;
        style: CSSStyleDeclaration;
        classList: DOMTokenList;
        addEventListener(type: string, listener: EventListener): void;
        removeEventListener(type: string, listener: EventListener): void;
        click(): void;
      }
      
      interface CSSStyleDeclaration {
        [property: string]: string;
      }
      
      interface DOMTokenList {
        add(...tokens: string[]): void;
        remove(...tokens: string[]): void;
        toggle(token: string): boolean;
        contains(token: string): boolean;
      }
      
      interface EventListener {
        (evt: Event): void;
      }
      
      interface Event {
        type: string;
        target: HTMLElement;
        preventDefault(): void;
        stopPropagation(): void;
      }
    `

    monaco.languages.typescript.javascriptDefaults.addExtraLib(domTypes, "dom.d.ts")

    // Add JavaScript snippets
    monaco.languages.registerCompletionItemProvider("javascript", {
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
            label: "addEventListener",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              "${1:element}.addEventListener('${2:click}', function(${3:event}) {",
              "    ${4:// Your code here}",
              "});",
            ].join("\n"),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Add event listener",
            range: range,
          },
          {
            label: "domReady",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              "document.addEventListener('DOMContentLoaded', function() {",
              "    ${1:// Your code here}",
              "});",
            ].join("\n"),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "DOM ready event",
            range: range,
          },
          {
            label: "fetch",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              "fetch('${1:url}')",
              "    .then(response => response.json())",
              "    .then(data => {",
              "        ${2:// Handle data}",
              "    })",
              "    .catch(error => {",
              "        console.error('Error:', error);",
              "    });",
            ].join("\n"),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Fetch API request",
            range: range,
          },
          {
            label: "asyncFunction",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              "async function ${1:functionName}() {",
              "    try {",
              "        ${2:// Your async code here}",
              "    } catch (error) {",
              "        console.error('Error:', error);",
              "    }",
              "}",
            ].join("\n"),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Async function with error handling",
            range: range,
          },
          {
            label: "class",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              "class ${1:ClassName} {",
              "    constructor(${2:parameters}) {",
              "        ${3:// Constructor code}",
              "    }",
              "    ",
              "    ${4:methodName}() {",
              "        ${5:// Method code}",
              "    }",
              "}",
            ].join("\n"),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "ES6 Class",
            range: range,
          },
          {
            label: "forEach",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "${1:array}.forEach(${2:item} => {\n    ${3:// Your code here}\n});",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Array forEach loop",
            range: range,
          },
          {
            label: "map",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "const ${1:newArray} = ${2:array}.map(${3:item} => {\n    return ${4:item};\n});",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Array map function",
            range: range,
          },
        ]

        return { suggestions }
      },
    })

    // Provide HTML element ID and class suggestions
    const htmlFiles = files.filter((f) => f.language === "html")
    if (htmlFiles.length > 0) {
      monaco.languages.registerCompletionItemProvider("javascript", {
        provideCompletionItems: (model, position) => {
          const textUntilPosition = model.getValueInRange({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          })

          // Check for getElementById
          const getByIdMatch = textUntilPosition.match(/getElementById\s*\(\s*["'][^"']*$/)
          // Check for querySelector with ID
          const querySelectorIdMatch = textUntilPosition.match(/querySelector\s*\(\s*["']#[^"']*$/)
          // Check for querySelector with class
          const querySelectorClassMatch = textUntilPosition.match(/querySelector\s*\(\s*["']\.[^"']*$/)

          if (!getByIdMatch && !querySelectorIdMatch && !querySelectorClassMatch) {
            return { suggestions: [] }
          }

          const word = model.getWordUntilPosition(position)
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          }

          const suggestions: any[] = []

          htmlFiles.forEach((htmlFile) => {
            if (getByIdMatch || querySelectorIdMatch) {
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

            if (querySelectorClassMatch) {
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
          })

          return { suggestions }
        },
      })
    }

    // Add CSS property suggestions for style manipulation
    const cssFiles = files.filter((f) => f.language === "css")
    if (cssFiles.length > 0) {
      monaco.languages.registerCompletionItemProvider("javascript", {
        provideCompletionItems: (model, position) => {
          const textUntilPosition = model.getValueInRange({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          })

          // Check for style property access
          const styleMatch = textUntilPosition.match(/\.style\.([a-zA-Z]*)$/)
          if (!styleMatch) return { suggestions: [] }

          const word = model.getWordUntilPosition(position)
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          }

          const cssProperties = [
            "backgroundColor",
            "color",
            "fontSize",
            "fontWeight",
            "margin",
            "padding",
            "border",
            "borderRadius",
            "width",
            "height",
            "display",
            "position",
            "top",
            "left",
            "right",
            "bottom",
            "zIndex",
            "opacity",
            "transform",
            "transition",
            "animation",
          ]

          const suggestions = cssProperties.map((prop) => ({
            label: prop,
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: prop,
            documentation: `CSS property: ${prop}`,
            range: range,
          }))

          return { suggestions }
        },
      })
    }

    // Format on save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      editor.getAction("editor.action.formatDocument")?.run()
    })

    // Add JSDoc support
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyJ, () => {
      const position = editor.getPosition()
      const model = editor.getModel()
      if (model && position) {
        const lineContent = model.getLineContent(position.lineNumber + 1)
        if (lineContent.trim().startsWith("function") || lineContent.trim().startsWith("const")) {
          editor.executeEdits("", [
            {
              range: {
                startLineNumber: position.lineNumber,
                startColumn: 1,
                endLineNumber: position.lineNumber,
                endColumn: 1,
              },
              text: "/**\n * ${1:Description}\n * @param {${2:type}} ${3:param} - ${4:Description}\n * @returns {${5:type}} ${6:Description}\n */\n",
            },
          ])
        }
      }
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
      showKeywords: true,
      showText: true,
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
    autoClosingBrackets: "always" as const,
    autoClosingQuotes: "always" as const,
    autoSurround: "languageDefined" as const,
    codeLens: true,
  }

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        language="javascript"
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
