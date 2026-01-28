"use client";

import { useState, useEffect } from "react";
import { Loader2, GitCommit, Info, GitPullRequest, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RepoData {
  commits?: Array<{
    sha: string;
    commit: { message: string; author: { name: string; date: string } };
    author?: { login: string };
  }>;
  pulls?: Array<{
    id: number;
    title: string;
    state: string;
    number: number;
    user: { login: string };
    created_at: string;
  }>;
  issues?: Array<{
    id: number;
    title: string;
    state: string;
    number: number;
    user: { login: string };
    created_at: string;
  }>;
}

interface CollaborativeFeedProps {
  repoName: string;
}

export function CollaborativeFeed({ repoName }: CollaborativeFeedProps) {
  const [data, setData] = useState<RepoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCollaborativeData() {
      try {
        const res = await fetch(`/api/repo/${repoName}/stats`);
        const collaborativeData = await res.json();
        setData(collaborativeData);
      } catch (error) {
        console.error("Failed to fetch collaborative data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCollaborativeData();
  }, [repoName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <Tabs defaultValue="commits" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="commits" className="gap-2">
          <GitCommit className="h-4 w-4" /> Commits
        </TabsTrigger>
        <TabsTrigger value="pulls" className="gap-2">
          <GitPullRequest className="h-4 w-4" /> PRs
        </TabsTrigger>
        <TabsTrigger value="issues" className="gap-2">
          <Info className="h-4 w-4" /> Issues
        </TabsTrigger>
      </TabsList>

      <ScrollArea className="h-100 pr-4">
        <TabsContent value="commits" className="mt-0 space-y-4">
          {data.commits?.map((commit) => (
            <div key={commit.sha} className="flex gap-4 p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors">
              <div className="mt-1 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{commit.commit.message}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{commit.author?.login || commit.commit.author.name}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(commit.commit.author.date))} ago</span>
                  <span>•</span>
                  <code className="bg-muted px-1 rounded text-[10px]">{commit.sha.substring(0, 7)}</code>
                </div>
              </div>
            </div>
          ))}
          {(!data.commits || data.commits.length === 0) && (
            <p className="text-center text-sm text-muted-foreground py-8">No commits found.</p>
          )}
        </TabsContent>

        <TabsContent value="pulls" className="mt-0 space-y-4">
          {data.pulls?.map((pull) => (
            <div key={pull.id} className="flex gap-4 p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors">
              <div className="mt-1 h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                <GitPullRequest className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium leading-none">{pull.title}</p>
                  <Badge variant={pull.state === "open" ? "secondary" : "default"} className="text-[10px] px-1.5 py-0 h-4">
                    {pull.state}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>#{pull.number} by {pull.user.login}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(pull.created_at))} ago</span>
                </div>
              </div>
            </div>
          ))}
          {(!data.pulls || data.pulls.length === 0) && (
            <p className="text-center text-sm text-muted-foreground py-8">No pull requests found.</p>
          )}
        </TabsContent>

        <TabsContent value="issues" className="mt-0 space-y-4">
          {data.issues?.map((issue) => (
            <div key={issue.id} className="flex gap-4 p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors">
              <div className="mt-1 h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                <Info className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium leading-none">{issue.title}</p>
                  <Badge variant={issue.state === "open" ? "destructive" : "secondary"} className="text-[10px] px-1.5 py-0 h-4">
                    {issue.state}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>#{issue.number} by {issue.user.login}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(issue.created_at))} ago</span>
                </div>
              </div>
            </div>
          ))}
          {(!data.issues || data.issues.length === 0) && (
            <p className="text-center text-sm text-muted-foreground py-8">No issues found.</p>
          )}
        </TabsContent>
      </ScrollArea>
    </Tabs>
  );
}
