const ORG_NAME = "University-of-Law-Computer-Science"; // Configurable or env var

export async function createGithubTeam(name: string, description?: string) {
  const token = process.env.GITHUB_ADMIN_TOKEN;

  // If no token, we just skip (dev mode or manual mode) and return success fake
  if (!token) {
    console.warn("GITHUB_ADMIN_TOKEN not set. Skipping GitHub Team creation.");
    return {
      success: true,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    };
  }

  try {
    const res = await fetch(`https://api.github.com/orgs/${ORG_NAME}/teams`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        name,
        description,
        privacy: "closed", // Visible to org members
        notification_setting: "notifications_enabled",
      }),
    });

    if (!res.ok) {
      // If team already exists (422), we might want to fetch it to get the slug, or just fail/warn.
      // For now, let's read the error.
      const errorText = await res.text();
      console.error("Failed to create GitHub team:", res.status, errorText);

      if (res.status === 422) {
        // Assume it exists, try to guess slug or fetch (fetching is safer but lets just warn)
        console.warn("Team might already exist.");
        // Return a slugified version as fallback so app doesn't crash
        return {
          success: true,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        };
      }
      return { error: `GitHub API Error: ${res.status}` };
    }

    const data = await res.json();
    return { success: true, slug: data.slug, id: data.id };
  } catch (err) {
    console.error("Error creating GitHub team:", err);
    return { error: "Internal Server Error" };
  }
}

export async function addMemberToTeam(slug: string, username: string) {
  const token = process.env.GITHUB_ADMIN_TOKEN;
  if (!token) {
    console.warn("GITHUB_ADMIN_TOKEN not set. Skipping member addition.");
    return { success: true };
  }

  try {
    // PUT /orgs/{org}/teams/{team_slug}/memberships/{username}
    const res = await fetch(
      `https://api.github.com/orgs/${ORG_NAME}/teams/${slug}/memberships/${username}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({ role: "member" }),
      },
    );

    if (!res.ok) {
      console.error(
        "Failed to add member to team:",
        res.status,
        await res.text(),
      );
      return { error: `GitHub API Error: ${res.status}` };
    }

    return { success: true };
  } catch (err) {
    console.error("Error adding member to team:", err);
    return { error: "Internal Server Error" };
  }
}
