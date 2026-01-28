# GitHub Configuration Guide

To fully enable the Cloud Onboarding App, you must configure your GitHub Organization and create an OAuth Application.

## 1. Create the OAuth Application

This application handles the "Sign in with GitHub" functionality.

1.  Navigate to your Organization's Settings > **Developer settings** > **OAuth Apps**.
    - _Note: Using an Organization-owned app is recommended for Faculty projects._
2.  Click **New OAuth App**.
3.  Fill in the details:
    - **Application Name**: `ULaw Cloud Onboarding` (or similar)
    - **Homepage URL**: `https://your-deployment-url.com` (or `http://localhost:3000` for dev)
    - **Authorization callback URL**: `https://your-deployment-url.com/api/auth/callback/github` (or `http://localhost:3000/api/auth/callback/github` for dev)
4.  Click **Register application**.
5.  Copy the **Client ID**.
6.  Generate a new **Client Secret** and copy it.
7.  Add these to your `.env` file:
    ```env
    AUTH_GITHUB_ID=your_client_id
    AUTH_GITHUB_SECRET=your_client_secret
    ```

## 2. Organization Settings

Ensure the app and students can access the organization.

1.  **Third-party application access**:
    - Go to Organization Settings > **Third-party access**.
    - Ensure "Restrict third-party application access" is setup to allow your new OAuth App (if restrictions are enabled), or that your policy allows it.
    - _Tip: If you see "Request access" during login, an Admin must approve the OAuth app._

2.  **Member Privileges**:
    - Ensure default member privileges match your security policy.
    - For this app, "Base permissions" set to **Read** is usually sufficient.

## 3. Configure Cohort Teams

The App uses GitHub Teams to verify student progression. You must create these teams manually in GitHub so the app can check against them.

1.  Go to the Organization > **Teams**.
2.  Click **New team**.
3.  **Team name**: Use a clear identifier (e.g., `Sept 2025 Students`).
    - _Note the "slug" (URL-friendly name) that is generated, e.g., `sept-2025-students`. You will need this for the Admin Dashboard._
4.  **Visibility**: "Secret" or "Closed" (Closed is verified visible to members). "Secret" teams might not be visible to the API if relying on public membership, but `read:org` scope handles this.
5.  **Repeat** for each cohort you plan to support.

## 4. Student Onboarding Workflow

This app currently **verifies** membership but does not **automatically invite** students (Read-Only integration).

**The Workflow:**

1.  **Invite Students to Org**:
    - Use **GitHub Classroom** (roster import) to mass-invite students to the Org.
    - OR send an email invite link to the cohort.
2.  **Assign to Team**:
    - In GitHub, add the students to the specific Cohort Team (e.g., `sept-2025-students`).
    - _Alternatively, GitHub Classroom can verify/add to teams automatically upon assignment acceptance._
3.  **Students Login to App**:
    - The App checks: "Is your email `@law.ac.uk`?" AND "Are you in the Org?".
    - Admin assigns them to a Cohort in the App.
    - App checks: "Are you in the `sept-2025-students` team?".

## 5. Generate Admin Token (GITHUB_ADMIN_TOKEN)

To allow the app to automate team creation and student enrollment, you need a Personal Access Token (PAT):

1.  **GitHub Settings**: Go to [Personal Access Tokens (classic)](https://github.com/settings/tokens).
2.  **Generate Token**: Click "Generate new token (classic)".
3.  **Note**: Use `ULaw Onboarding Admin`.
4.  **Scopes**: Check **`admin:org`**.
5.  **Save**: Copy the generated token immediately.
6.  **Add to `.env`**: Paste it into `GITHUB_ADMIN_TOKEN="..."`.

## 6. Environment Variables Checklist

Ensure your production environment (`.env.local` or Vercel Config) has:

```env
AUTH_SECRET="generated_secret_here" # run `npx auth secret`
AUTH_GITHUB_ID="from_step_1"
AUTH_GITHUB_SECRET="from_step_1"
GITHUB_ADMIN_TOKEN="from_step_5"
DATABASE_URL="postgres://..." # For production
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```
