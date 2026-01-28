"use server";

import { codeToHtml } from "shiki";
import { getFileContent } from "@/lib/github-service";

export async function getHighlightedCode(repoName: string, path: string) {
  try {
    const { content, name } = await getFileContent(repoName, path);
    
    // Determine language from extension
    const ext = name.split(".").pop() || "text";
    const langMap: Record<string, string> = {
      js: "javascript",
      ts: "typescript",
      tsx: "tsx",
      jsx: "jsx",
      py: "python",
      md: "markdown",
      json: "json",
      yml: "yaml",
      yaml: "yaml",
      sh: "bash",
      bash: "bash",
      sql: "sql",
      html: "html",
      css: "css",
      tf: "hcl",
      dockerfile: "dockerfile",
    };

    const lang = langMap[ext] || "text";

    const html = await codeToHtml(content, {
      lang,
      theme: "github-dark",
    });

    return { html, content, lang };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Highlighting error:", error);
    return { error: message };
  }
}
