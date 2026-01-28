"use client";

import { useState, useEffect } from "react";
import { Folder, File, ChevronRight, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "dir";
  children?: FileNode[];
  isOpen?: boolean;
}

interface FileTreeProps {
  repoName: string;
  onFileSelect: (path: string) => void;
  selectedPath?: string;
}

export function FileTree({ repoName, onFileSelect, selectedPath }: FileTreeProps) {
  const [nodes, setNodes] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoot() {
      try {
        const res = await fetch(`/api/repo/${repoName}/contents`);
        const data = await res.json();
        setNodes(data.sort((a: FileNode, b: FileNode) => {
          if (a.type === b.type) return a.name.localeCompare(b.name);
          return a.type === "dir" ? -1 : 1;
        }));
      } catch (error) {
        console.error("Failed to fetch root contents:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRoot();
  }, [repoName]);

  const toggleFolder = async (path: string) => {
    const updateNodes = async (currentNodes: FileNode[]): Promise<FileNode[]> => {
      return Promise.all(
        currentNodes.map(async (node) => {
          if (node.path === path && node.type === "dir") {
            if (node.isOpen) {
              return { ...node, isOpen: false };
            } else {
              if (!node.children) {
                const res = await fetch(`/api/repo/${repoName}/contents?path=${path}`);
                const data = await res.json();
                const children = data.sort((a: FileNode, b: FileNode) => {
                  if (a.type === b.type) return a.name.localeCompare(b.name);
                  return a.type === "dir" ? -1 : 1;
                });
                return { ...node, isOpen: true, children };
              }
              return { ...node, isOpen: true };
            }
          } else if (node.children) {
            return { ...node, children: await updateNodes(node.children) };
          }
          return node;
        })
      );
    };

    setNodes(await updateNodes(nodes));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const renderNode = (node: FileNode, depth: number = 0) => {
    const isSelected = selectedPath === node.path;

    return (
      <div key={node.path}>
        <div
          className={cn(
            "flex items-center py-1 px-2 cursor-pointer hover:bg-accent/50 rounded-sm text-sm group",
            isSelected && "bg-accent text-accent-foreground"
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => {
            if (node.type === "dir") {
              toggleFolder(node.path);
            } else {
              onFileSelect(node.path);
            }
          }}
        >
          <span className="mr-1.5 text-muted-foreground group-hover:text-foreground">
            {node.type === "dir" ? (
              node.isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <span className="w-3.5" />
            )}
          </span>
          {node.type === "dir" ? (
            <Folder className="h-4 w-4 mr-2 text-blue-400 fill-blue-400/20" />
          ) : (
            <File className="h-4 w-4 mr-2 text-muted-foreground" />
          )}
          <span className="truncate">{node.name}</span>
        </div>
        {node.isOpen && node.children && (
          <div>{node.children.map((child) => renderNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <div className="py-2 overflow-y-auto max-h-[calc(100vh-200px)]">
      {nodes.map((node) => renderNode(node))}
    </div>
  );
}
