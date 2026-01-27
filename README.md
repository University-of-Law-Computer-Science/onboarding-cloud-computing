# Cloud Module Onboarding Web Application

A Next.js 14+ web application for onboarding Computer Science students to cloud resources (GitHub, Docker, AWS Academy).

## Features

- **GitHub Authentication**: Secure sign-in using GitHub OAuth.
- **Onboarding Workflow**: Step-by-step progress tracking for:
  - GitHub Organization membership.
  - Docker installation verification.
  - AWS Academy enrollment.
- **Role-Based Access**: Student and Staff roles.
- **Staff Dashboard**: Admin view to track student progress.
- **Automated Checks**: Verifies email domain (`@law.ac.uk`) and GitHub organization membership.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: SQLite (Development) / PostgreSQL (Production)
- **ORM**: Prisma
- **Auth**: Auth.js (NextAuth v5)

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (optional, for local Postgres)
- GitHub OAuth Application

### Installation

1.  **Clone the repository**:

    ```bash
    git clone <repo-url>
    cd cloud-onboarding-app
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Copy `.env` to `.env.local` (if needed) and fill in the required values:

    ```env
    DATABASE_URL="file:./dev.db" # Or your Postgres URL
    AUTH_SECRET="your-secret-key" # Generate with: npx auth secret

    # GitHub OAuth (Create at https://github.com/settings/apps)
    GITHUB_CLIENT_ID="your-client-id"
    GITHUB_CLIENT_SECRET="your-client-secret"

    NEXT_PUBLIC_APP_URL="http://localhost:3000"
    ```

4.  **Database Setup**:

    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Run Development Server**:

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000).

## Deployment

1.  **Switch to PostgreSQL**:
    - Update `prisma/schema.prisma`: Change `provider = "sqlite"` to `provider = "postgresql"`.
    - Update `.env`: Set `DATABASE_URL` to your Postgres connection string (e.g., Supabase, Neon).
    - Run `npx prisma migrate deploy` during build.

2.  **Vercel Deployment**:
    - Connect your repository to Vercel.
    - Add environment variables in Vercel settings.
    - Deploy!

## Staff Access

By default, all users are `student`. To promote a user to `staff`:

1.  Access the database (e.g., `npx prisma studio`).
2.  Find the user in the `User` model.
3.  Change `role` from `student` to `staff`.
4.  The user will now have access to the `/admin` dashboard.
