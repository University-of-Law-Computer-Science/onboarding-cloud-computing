"use client";

import { CodeViewer } from "@/components/repo/CodeViewer";
import { CollaborativeFeed } from "@/components/repo/CollaborativeFeed";
import { FileTree } from "@/components/repo/FileTree";
import { RepoAnalytics } from "@/components/repo/RepoAnalytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BarChart3,
  Code2,
  LayoutGrid,
  Search,
  Users2
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RepoViewerPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [repoName, setRepoName] = useState<string | null>(null);
  const [repoUrl, setRepoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRepoInfo() {
      try {
        const res = await fetch(`/api/labs/${slug}/info`);
        const data = await res.json();
        if (data.repoUrl) {
          setRepoUrl(data.repoUrl);
          // Extract repo name from URL: https://github.com/Org/RepoName
          const name = data.repoUrl.split("/").pop();
          setRepoName(name);
        }
      } catch (error) {
        console.error("Failed to fetch repo info:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRepoInfo();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <LayoutGrid className="h-10 w-10 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!repoName) {
    return (
      <div className="flex flex-col h-screen items-center justify-center gap-4">
        <p className="text-muted-foreground">Repository not found for this lab.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">

              {repoName}
            </h1>
            <p className="text-xs text-muted-foreground font-mono">{slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64 hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              className="pl-9 h-9 bg-muted/50 border-none focus-visible:ring-1"
            />
          </div>
          <a href={repoUrl || "#"} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="gap-2">

              GitHub
            </Button>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        <Tabs defaultValue="browser" className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b px-6 bg-card/30">
            <TabsList className="bg-transparent border-none h-12 gap-6">
              <TabsTrigger
                value="browser"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-12 gap-2"
              >
                <Code2 className="h-4 w-4" /> Code
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-12 gap-2"
              >
                <BarChart3 className="h-4 w-4" /> Analytics
              </TabsTrigger>
              <TabsTrigger
                value="collab"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-12 gap-2"
              >
                <Users2 className="h-4 w-4" /> Activity
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="browser" className="m-0 h-full flex overflow-hidden">
              {/* File Sidebar */}
              <aside className="w-80 border-r bg-card/20 flex flex-col">
                <div className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest border-b">
                  Files
                </div>
                <FileTree
                  repoName={repoName}
                  onFileSelect={(path) => setSelectedPath(path)}
                  selectedPath={selectedPath || undefined}
                />
              </aside>

              {/* Code Panel */}
              <section className="flex-1 bg-muted/5 overflow-hidden flex flex-col">
                <AnimatePresence mode="wait">
                  {selectedPath ? (
                    <motion.div
                      key={selectedPath}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex-1 flex flex-col overflow-hidden"
                    >
                      <div className="px-6 py-2 border-b bg-card/30 flex items-center justify-between">
                        <span className="text-sm font-mono text-muted-foreground">
                          {selectedPath}
                        </span>
                      </div>
                      <div className="flex-1 overflow-auto p-6">
                        <CodeViewer repoName={repoName} path={selectedPath} />
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                        <Code2 className="h-8 w-8 opacity-20" />
                      </div>
                      <p>Select a file to view its contents</p>
                    </div>
                  )}
                </AnimatePresence>
              </section>
            </TabsContent>

            <TabsContent value="analytics" className="m-0 h-full overflow-auto p-8 bg-muted/5">
              <div className="max-w-6xl mx-auto">
                <RepoAnalytics repoName={repoName} />
              </div>
            </TabsContent>

            <TabsContent value="collab" className="m-0 h-full overflow-auto p-8 bg-muted/5">
              <div className="max-w-4xl mx-auto">
                <CollaborativeFeed repoName={repoName} />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}
