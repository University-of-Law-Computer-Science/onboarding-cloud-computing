"use client";

import { useState, useEffect } from "react";
import { getHighlightedCode } from "@/actions/repo";
import { Loader2, Copy, Check, FileText, Code as CodeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface CodeViewerProps {
  repoName: string;
  path: string;
}

export function CodeViewer({ repoName, path }: CodeViewerProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");

  const isMarkdown = path.endsWith(".md");

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
    <div className="relative group h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 px-1">
        <div className="flex gap-2">
          {isMarkdown && (
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === "preview" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("preview")}
                className="h-7 text-xs gap-1.5"
              >
                <FileText className="h-3.5 w-3.5" />
                Preview
              </Button>
              <Button
                variant={viewMode === "code" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("code")}
                className="h-7 text-xs gap-1.5"
              >
                <CodeIcon className="h-3.5 w-3.5" />
                Code
              </Button>
            </div>
          )}
        </div>
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

      <div className="flex-1 overflow-auto rounded-lg border bg-[#0d1117]">
        {isMarkdown && viewMode === "preview" ? (
          <div className="p-8 bg-background text-foreground prose prose-sm md:prose-base dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        ) : (
          <>
            <div
              className="shiki-container p-4 text-sm leading-relaxed min-h-full"
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
                -webkit-user-select: none;
                user-select: none;
              }
            `}</style>
          </>
        )}
      </div>
    </div>
  );
}
