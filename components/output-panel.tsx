"use client"
import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, AlertCircle, Info, AlertTriangle, Terminal } from "lucide-react"
import { cn } from "@/lib/utils"

interface LogEntry {
  id: number
  level: "log" | "error" | "warn" | "info"
  args: string[]
  timestamp: string
}

interface OutputPanelProps {
  activeTab: "preview" | "console"
  iframeSrc: string
  logs: LogEntry[]
  onClearConsole: () => void
}

const getLogIcon = (level: string) => {
  switch (level) {
    case "error":
      return <AlertCircle className="w-4 h-4 text-red-500" />
    case "warn":
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />
    case "info":
      return <Info className="w-4 h-4 text-blue-500" />
    default:
      return <div className="w-4 h-4 rounded-full bg-gray-400" />
  }
}

const getLogColor = (level: string) => {
  switch (level) {
    case "error":
      return "text-red-600 dark:text-red-400"
    case "warn":
      return "text-yellow-600 dark:text-yellow-400"
    case "info":
      return "text-blue-600 dark:text-blue-400"
    default:
      return "text-foreground"
  }
}

export default function OutputPanel({ activeTab, iframeSrc, logs, onClearConsole }: OutputPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new logs arrive (only for new logs, not on clear)
  useEffect(() => {
    if (scrollRef.current && logs.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  // Force iframe reload when src changes
  useEffect(() => {
    if (iframeRef.current) {
      // Small delay to ensure proper reload
      const timer = setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = "about:blank"
          setTimeout(() => {
            if (iframeRef.current) {
              iframeRef.current.srcdoc = iframeSrc
            }
          }, 50)
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [iframeSrc])

  if (activeTab === "preview") {
    return (
      <div className="h-full relative">
        <iframe
          ref={iframeRef}
          srcDoc={iframeSrc}
          className="w-full h-full border-0 bg-white"
          title="Preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Console Header */}
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Console Output</span>
          {logs.length > 0 && (
            <Badge variant="secondary" className="h-5 text-xs">
              {logs.length}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearConsole}
          className="h-7 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
          disabled={logs.length === 0}
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Clear
        </Button>
      </div>

      {/* Console Content */}
      <div className="flex-1 overflow-hidden">
        <div ref={scrollRef} className="h-full overflow-y-auto p-2 space-y-1 font-mono text-sm">
          {logs.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">
              <div className="flex flex-col items-center gap-2">
                <Terminal className="w-8 h-8 opacity-50" />
                <p>Console output will appear here</p>
                <p className="text-xs">Run your code to see logs, errors, and warnings</p>
              </div>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={cn(
                  "flex items-start gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors",
                  getLogColor(log.level),
                )}
              >
                {getLogIcon(log.level)}
                <div className="flex-1 min-w-0">
                  <div className="break-words whitespace-pre-wrap">{log.args.join(" ")}</div>
                  <div className="text-xs text-muted-foreground mt-1">{log.timestamp}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
