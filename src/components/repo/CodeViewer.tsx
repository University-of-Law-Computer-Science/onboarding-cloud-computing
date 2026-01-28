"use client";

import { useState, useEffect } from "react";
import { getHighlightedCode } from "@/actions/repo";
import { Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeViewerProps {
  repoName: string;
  path: string;
}

export function CodeViewer({ repoName, path }: CodeViewerProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function highlight() {
      setLoading(true);
      const res = await getHighlightedCode(repoName, path);
      if (res.html) {
        setHtml(res.html);
        setContent(res.content || "");
      }
      setLoading(false);
    }
    highlight();
  }, [repoName, path]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!html) {
    return (
      <div className="flex items-center justify-center h-full min-h-100 text-muted-foreground">
        Failed to load file content.
      </div>
    );
  }

  return (
    <div className="relative group h-full">
      <div className="absolute right-4 top-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="secondary"
          size="sm"
          className="h-8 gap-1.5"
          onClick={copyToClipboard}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-500" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </Button>
      </div>
      <div 
        className="shiki-container overflow-auto max-h-[calc(100vh-250px)] rounded-lg border bg-[#0d1117] p-4 text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <style jsx global>{`
        .shiki-container pre {
          background-color: transparent !important;
          margin: 0;
        }
        .shiki-container code {
          counter-reset: step;
          counter-increment: step 0;
        }
        .shiki-container .line::before {
          content: counter(step);
          counter-increment: step;
          width: 1rem;
          margin-right: 1.5rem;
          display: inline-block;
          text-align: right;
          color: rgba(115, 138, 148, 0.4);
        }
      `}</style>
    </div>
  );
}
