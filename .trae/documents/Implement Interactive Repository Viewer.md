## Implement Interactive Repository Viewer for Students

This plan outlines the implementation of a comprehensive, modern repository management and viewing system within the existing Cloud Onboarding application.

### 1. Data Layer & Backend Integration
*   **Update Provisioning Logic**: Modify the existing `provisionLabForCohort` action to store the repository URL in the `LabSubmission` table as soon as a repository is successfully created.
*   **GitHub Integration Service**: Create a new `src/lib/github-service.ts` to interact with the GitHub API. This service will:
    *   Retrieve repository metadata (description, language, last update).
    *   Fetch recursive file trees and raw file content.
    *   Gather analytics data (commit history, code frequency).
    *   Pull collaborative data (pull requests, issues, recent commits).
*   **Server-Side Caching**: Implement Next.js caching for GitHub API responses to minimize latency and avoid rate limits.

### 2. Enhanced Repository Dashboard
*   **Updated Labs View**: Enhance the current "My Cloud Labs" page to include repository-specific details.
*   **Quick Actions**: Add "View Repository" and "Open in GitHub" links to each lab row once provisioned.

### 3. Interactive Repository Browser (`/labs/[slug]/repo`)
*   **Centralized Repo Viewer**: Create a new dynamic route for an immersive repository experience.
*   **Interactive File Explorer**:
    *   Recursive folder navigation (expand/collapse).
    *   Real-time file filtering and search.
    *   Breadcrumb navigation for deep paths.
*   **Advanced Code Preview**:
    *   Syntax highlighting using **Shiki** for high-quality theme support.
    *   Line numbering and "Copy to Clipboard" functionality.
    *   Language-aware file icons.

### 4. Visual Analytics & Collaborative Features
*   **Activity Dashboard**:
    *   **Commit History Graph**: Visualizing project activity using **Recharts**.
    *   **Repository Stats**: High-level metrics (total commits, open issues, contributors).
*   **Collaboration Hub**:
    *   Integrated feeds for Recent Commits, Pull Requests, and Issues.
    *   Status badges for PRs (Open/Merged/Closed).

### 5. Technical Excellence & UX
*   **Mobile-First Design**: A responsive layout with a collapsible sidebar for file navigation on smaller screens.
*   **Performance Optimization**: 
    *   Lazy loading of heavy components (Code Viewer, Charts) using Next.js `Suspense`.
    *   Optimized API calls using the `github-admin` token for reliable access.
*   **Accessibility (WCAG)**:
    *   Full keyboard navigation for the file explorer.
    *   Aria labels for interactive elements and screen reader compatibility.
    *   High-contrast syntax highlighting themes.

### Technical Dependencies to be Added:
*   `shiki` (Syntax Highlighting)
*   `recharts` (Visual Analytics)
*   `framer-motion` (Animations)
*   `date-fns` (Date Formatting)

**Please confirm if you would like me to proceed with this implementation.**
