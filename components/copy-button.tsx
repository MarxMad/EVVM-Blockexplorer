"use client"

import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { useState } from "react"

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy} title="Copiar">
      <Copy className="h-4 w-4" />
      {copied && <span className="sr-only">Copiado!</span>}
    </Button>
  )
}

