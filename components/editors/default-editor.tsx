"use client"

import { useRef } from "react"
import Editor, { type Monaco } from "@monaco-editor/react"
import { Skeleton } from "@/components/ui/skeleton"

interface FileType {
  name: string
  language: string
  content: string
}

interface DefaultEditorProps {
  file: FileType
  onChange: (content: string) => void
  theme?: string
}

export function DefaultEditor({ file, onChange, theme }: DefaultEditorProps) {
  const editorRef = useRef<any>(null)

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor

    // Basic configuration for other file types
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
  }

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        language={file.language}
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
