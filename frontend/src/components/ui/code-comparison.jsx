"use client"

import { FileIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { codeToHtml } from "shiki"

export function CodeComparison({
  beforeCode,
  afterCode,
  language,
  filename,
  lightTheme,
  darkTheme,
}) {
  const { theme, systemTheme } = useTheme()
  const [highlightedBefore, setHighlightedBefore] = useState("")
  const [highlightedAfter, setHighlightedAfter] = useState("")

  useEffect(() => {
    // Default to dark theme if not using ThemeProvider
    const selectedTheme = darkTheme || "github-dark"

    async function highlightCode() {
      const before = await codeToHtml(beforeCode, {
        lang: language,
        theme: selectedTheme,
      })
      const after = await codeToHtml(afterCode, {
        lang: "markdown", // We'll render the output as plain text/markdown
        theme: selectedTheme,
      })
      setHighlightedBefore(before)
      setHighlightedAfter(after)
    }

    highlightCode()
  }, [
    beforeCode,
    afterCode,
    language,
    lightTheme,
    darkTheme,
  ])

  const renderCode = (code, highlighted) => {
    if (highlighted) {
      return (
        <div
          className="h-full bg-transparent font-mono text-[13px] sm:text-[14px] leading-relaxed [&>pre]:min-h-full [&>pre]:!bg-transparent [&>pre]:p-5 sm:[&>pre]:p-8 [&>pre]:whitespace-pre-wrap [&_code]:whitespace-pre-wrap [&_code]:break-words"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      )
    } else {
      return (
        <pre className="h-full whitespace-pre-wrap break-words bg-transparent p-5 sm:p-8 font-mono text-[13px] sm:text-[14px] text-white">
          {code}
        </pre>
      )
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] relative z-10">
      <div className="relative w-full overflow-hidden rounded-xl border border-gray-800 bg-[#050914] shadow-2xl">
        <div className="relative grid md:grid-cols-2 md:divide-x md:divide-gray-800">
          <div className="hidden md:block">
            <div className="flex items-center bg-[#0b1120] p-3 text-sm font-semibold text-gray-300 border-b border-gray-800">
              <FileIcon className="mr-2 h-4 w-4 text-blue-400" />
              rules.py
              <span className="ml-auto text-xs text-gray-500 uppercase tracking-widest font-mono">Source</span>
            </div>
            {renderCode(beforeCode, highlightedBefore)}
          </div>
          <div>
            <div className="flex items-center bg-[#0b1120] p-3 text-sm font-semibold text-gray-300 border-b border-gray-800">
              <FileIcon className="mr-2 h-4 w-4 text-green-400" />
              terminal_output.txt
              <span className="ml-auto text-xs text-gray-500 uppercase tracking-widest font-mono">Output</span>
            </div>
            {renderCode(afterCode, highlightedAfter)}
          </div>
        </div>
        <div className="hidden absolute left-1/2 top-1/2 md:flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg bg-[#0b1120] border border-gray-800 text-xs font-bold text-yellow-400 shadow-xl z-20">
          RUN
        </div>
      </div>
    </div>
  )
}
