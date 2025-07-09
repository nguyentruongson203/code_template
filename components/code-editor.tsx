"use client"

import { useRef } from "react"
import Editor from "@monaco-editor/react"
import { Skeleton } from "@/components/ui/skeleton"

interface FileType {
  name: string
  language: string
  content: string
}

interface CodeEditorProps {
  file: FileType
  onChange: (content: string) => void
  theme?: string
  readOnly?: boolean
}

export default function CodeEditor({ file, onChange, theme, readOnly = false }: CodeEditorProps) {
  const editorRef = useRef<any>(null)

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor

    // Format on save (only if not read-only)
    if (!readOnly) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        editor.getAction("editor.action.formatDocument")?.run()
      })
    }
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
    formatOnPaste: !readOnly,
    formatOnType: !readOnly,
    autoClosingBrackets: readOnly ? ("never" as const) : ("always" as const),
    autoClosingQuotes: readOnly ? ("never" as const) : ("always" as const),
    readOnly: readOnly,
    contextmenu: !readOnly,
    quickSuggestions: readOnly
      ? false
      : {
          other: true,
          comments: true,
          strings: true,
        },
  }

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        language={file.language}
        value={file.content}
        onChange={readOnly ? undefined : (value) => onChange(value || "")}
        onMount={handleEditorDidMount}
        theme={theme === "dark" ? "vs-dark" : "vs-light"}
        options={editorOptions}
        loading={
          <div className="h-full w-full p-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        }
      />
    </div>
  )
}
