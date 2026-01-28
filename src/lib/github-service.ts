const ORG_NAME = "University-of-Law-Computer-Science";

async function ghFetch(endpoint: string, options: RequestInit = {}) {
  const token = process.env.GH_ADMIN_TOKEN;
  if (!token) throw new Error("GH_ADMIN_TOKEN is not set");

  const res = await fetch(`https://api.github.com${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...options.headers,
    },
    next: { revalidate: 3600 }, // Cache for 1 hour by default
  });

  if (!res.ok) {
    const error = await res.text();
    console.error(`GitHub API error (${endpoint}):`, res.status, error);
    throw new Error(`GitHub API error: ${res.status}`);
  }

  return res.json();
}

export async function getRepoMetadata(repoName: string) {
  return ghFetch(`/repos/${ORG_NAME}/${repoName}`);
}

export async function getRepoContents(repoName: string, path: string = "") {
  return ghFetch(`/repos/${ORG_NAME}/${repoName}/contents/${path}`);
}

export async function getFileContent(repoName: string, path: string) {
  const data = await ghFetch(`/repos/${ORG_NAME}/${repoName}/contents/${path}`);
  if (Array.isArray(data)) throw new Error("Path is a directory, not a file");
  
  // Content is base64 encoded
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return {
    content,
    name: data.name,
    path: data.path,
    sha: data.sha,
    size: data.size,
  };
}

export async function getRepoCommits(repoName: string, per_page: number = 10) {
  return ghFetch(`/repos/${ORG_NAME}/${repoName}/commits?per_page=${per_page}`);
}

export async function getRepoIssues(repoName: string, per_page: number = 10) {
  return ghFetch(`/repos/${ORG_NAME}/${repoName}/issues?per_page=${per_page}&state=all`);
}

export async function getRepoPulls(repoName: string, per_page: number = 10) {
  return ghFetch(`/repos/${ORG_NAME}/${repoName}/pulls?per_page=${per_page}&state=all`);
}

export async function getRepoActivity(repoName: string) {
  // Stats: commit activity over the last year
  return ghFetch(`/repos/${ORG_NAME}/${repoName}/stats/commit_activity`);
}
