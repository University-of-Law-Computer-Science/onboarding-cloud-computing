# Cloud Module Onboarding Web Application – AI Build Specification

## Purpose

This document is a **machine-readable build specification** for an AI-assisted code generator.

The goal is to generate a **Next.js + React web application** that implements a scalable onboarding system for Computer Science students using:

- GitHub (identity & access control)
- Docker (local development tooling)
- AWS Academy (cloud sandbox accounts)

Students onboard using their `@law.ac.uk` email address.  
The system must support **current and future cohorts** with minimal manual administration.

---

## Core Design Principles

- GitHub is the **single source of identity**
- No passwords are stored
- No cloud credentials are handled
- All onboarding is **self-service**
- Access is enforced via email domain + organisation membership
- Student lifecycle is automatic (join → study → leave)

---

## Tech Stack (Required)

### Frontend
- Next.js 14+
- App Router
- React Server Components
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend
- Next.js Server Actions / Route Handlers
- PostgreSQL (Supabase or Neon)
- Optional ORM: Prisma

### Authentication
- Auth.js (NextAuth v5)
- GitHub OAuth Provider

---

## Authentication Requirements

### OAuth Provider
- GitHub

### Required Scopes
```
read:user
user:email
read:org
```

### Optional (Admin Automation)
```
admin:org
```

### Authentication Rules
1. User must authenticate via GitHub
2. User must have a **verified** email ending with `@law.ac.uk`
3. If email is not verified or domain is incorrect → block access
4. GitHub user ID is the primary identifier

---

## Application Pages

### `/` – Landing Page
- Brief explanation of the module
- “Sign in with GitHub” button

---

### `/onboarding` – Student Dashboard (Protected)

Display onboarding progress as a stepper:

```
[✓] GitHub Account Verified
[✓] Joined GitHub Organisation
[ ] Docker Installed
[ ] AWS Academy Enrolled
```

Each step must:
- Be stored in the database
- Update in real time
- Prevent progression if prerequisites are unmet

---

### `/onboarding/github`

Checks:
- Verified `@law.ac.uk` email
- Membership in GitHub organisation

Actions:
- Display “Join GitHub Organisation” link if not a member
- Re-check membership on page refresh

---

### `/onboarding/docker`

Explain Docker installation.

Actions:
- Provide platform-specific install links
- Ask student to confirm installation via checkbox
- Persist confirmation state

Note:
- Browser-based Docker detection is not possible
- This step is manual confirmation only

---

### `/onboarding/aws`

Explain AWS Academy onboarding.

Actions:
- Link to cohort-specific AWS Academy enrolment URL
- Ask student to confirm enrolment
- Optionally store AWS Academy username (not credentials)

---

## Role-Based Access

### Roles
- `student`
- `staff`

### Assignment Logic
- Staff are manually flagged in the database
- Students are default

### Staff Capabilities
- View onboarding status across cohorts
- Filter by completion state
- Export CSV
- View blocked students (email/org issues)

---

## Data Model

### `users`
```ts
id: uuid
github_id: string
github_username: string
email: string
role: "student" | "staff"
cohort_id: uuid
created_at: timestamp
```

### `cohorts`
```ts
id: uuid
name: string
github_team_slug: string
aws_academy_link: string
active: boolean
```

### `onboarding_status`
```ts
user_id: uuid
github_verified: boolean
org_joined: boolean
docker_confirmed: boolean
aws_enrolled: boolean
updated_at: timestamp
```

---

## GitHub Integration Logic

### Read-Only Checks (Required)
- Fetch user emails
- Confirm verified `@law.ac.uk` email
- Check organisation membership
- Check team membership (optional)

### Write Actions (Optional / Phase 2)
- Auto-add user to GitHub organisation
- Auto-assign cohort team

---

## Security Constraints

- Do NOT store:
  - GitHub access tokens long-term
  - AWS credentials
  - Docker credentials
- Use short-lived OAuth tokens only
- Enforce server-side checks for all protected routes

---

## UX Requirements

- Clear step-by-step onboarding
- Persistent progress state
- Friendly error messages
- Explicit blocking reasons (e.g. “Email not verified”)

---

## Non-Goals

- Provisioning AWS accounts directly
- Managing Docker licenses
- Acting as a learning management system (LMS)

---

## Deployment Requirements

- Environment variables for:
  - GitHub OAuth
  - Database connection
- Must deploy cleanly on:
  - Vercel or equivalent

---

## Success Criteria

- A new student with `@law.ac.uk` can onboard in <15 minutes
- No manual admin action required for standard onboarding
- Removing a user from GitHub org revokes access automatically
- App supports multiple cohorts concurrently

---

## Final Instruction to AI Builder

Generate a **production-ready Next.js application** that satisfies **all constraints in this document**.

Prioritise:
- Security
- Maintainability
- Simplicity
- Clear separation of concerns

Avoid unnecessary abstractions or overengineering.
