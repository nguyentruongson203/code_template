"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Copy, Check, Share2, ExternalLink, Calendar, Hash } from "lucide-react"
import { shareCode } from "@/utils/share-code"
import { useToast } from "@/hooks/use-toast"

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  files: any[]
}

export default function ShareDialog({ open, onOpenChange, files }: ShareDialogProps) {
  const [isSharing, setIsSharing] = useState(false)
  const [shareResult, setShareResult] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleShare = async () => {
    setIsSharing(true)
    try {
      const result = await shareCode(files)
      setShareResult(result)
      toast({
        title: "Code shared successfully!",
        description: "Your playground has been shared and is ready to use.",
      })
    } catch (error) {
      toast({
        title: "Failed to share code",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareResult.url)
      setCopied(true)
      toast({
        title: "Copied to clipboard!",
        description: "Share URL has been copied to your clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the URL manually.",
        variant: "destructive",
      })
    }
  }

  const handleOpenInNewTab = () => {
    window.open(shareResult.url, "_blank")
  }

  const handleClose = () => {
    setShareResult(null)
    setCopied(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Your Playground
          </DialogTitle>
          <DialogDescription>
            Share your code playground with others. They'll be able to view and run your code.
          </DialogDescription>
        </DialogHeader>

        {!shareResult ? (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>This will create a public link to your playground including:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>{files.filter((f) => f.type === "file").length} files</li>
                <li>All your code and folder structure</li>
                <li>Live preview and console output</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="share-url">Share URL</Label>
              <div className="flex space-x-2 mt-1">
                <Input id="share-url" value={shareResult.url} readOnly className="flex-1" />
                <Button type="button" variant="outline" size="sm" onClick={handleCopy} className="px-3 bg-transparent">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleOpenInNewTab}
                  className="px-3 bg-transparent"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Share Details */}
            <div className="bg-muted/50 p-3 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Hash className="w-4 h-4" />
                <span className="font-medium">ID:</span>
                <span className="font-mono">{shareResult.id}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Slug:</span>
                <span className="font-mono text-xs">{shareResult.slug}</span>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>✅ Your playground has been shared successfully!</p>
              <p>Anyone with this link can view and run your code.</p>
            </div>
          </div>
        )}

        <DialogFooter>
          {!shareResult ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleShare} disabled={isSharing}>
                {isSharing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Share Code
              </Button>
            </>
          ) : (
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
