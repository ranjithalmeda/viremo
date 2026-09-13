# Viremo Complete Technical Manual

This document reverse-engineers the project for a new developer who has never seen the code before. It explains the product, architecture, folders, files, data flow, authentication, APIs, database, deployment, security, and full user lifecycle.

Think of Viremo as a personal entertainment diary plus a social community. Users track movies, series, anime, and books, organize them into folders, share a public profile, message other users, ask the community for recommendations, and optionally use AI-powered features.

---

## Part 1 - Project Overview

### What This Website Does

Viremo is a web application for tracking entertainment media. A user can:

- Add diary entries for movies, series, anime, and books.
- Set a status such as Watching, Completed, or Dropped.
- Rate entries from 1.0 to 5.0 in 0.5 steps.
- Write notes.
- Search external metadata sources for titles.
- Group entries into folders.
- View a calendar of watched history.
- Customize appearance and profile.
- Follow users, send messages, receive notifications, and comment on profiles.
- Create or answer community recommendation posts.
- Use AI chat and AI recommendations depending on role.
- Submit support tickets.
- Admins can manage users, entries, comments, tickets, AI limits, and help articles.

### Main Business Purpose

The business purpose is to create a personalized, social entertainment diary. Letterboxd is mostly movie-focused; Viremo aims to cover movies, shows, anime, and books in one place with profile customization, folders, community, and AI recommendations.

### Target Users

- Regular entertainment fans who want to remember what they watched/read.
- Anime, movie, series, and book viewers who want one combined diary.
- Users who like sharing curated public profiles.
- Users who want recommendations from AI or other people.
- Admins/moderators who manage users, support, and content.

### Core Features

- Authentication: credentials, Google OAuth, optional GitHub OAuth.
- Diary CRUD: create, read, update, delete entries.
- Search: TMDB for movies/shows/anime-like media and Google Books for books.
- Dashboard: featured entry, filters, stats, recommendations.
- Watch calendar/history.
- Folders: many-to-many custom collections.
- Public profiles and public folders.
- Appearance preferences: layout, theme, accent color, mobile font size, section order.
- Avatar upload through Supabase Storage.
- Social: follow/unfollow, followers/following pages, notifications.
- Direct messages.
- Profile comments.
- Community recommendation posts and replies.
- Help center with admin-managed help articles.
- Support tickets.
- Admin panel.
- AI chat and AI recommendations using Gemini.

### User Journey

1. Visitor opens `/`.
2. Visitor chooses create account or login.
3. User registers with email/password or signs in with Google.
4. User reaches `/dashboard`.
5. User adds diary entries manually or from `/search`.
6. User organizes entries into folders and calendar history.
7. User customizes profile in `/settings/appearance`.
8. User shares `/profile/[username]`.
9. User follows, messages, comments, and posts in community.
10. Pro/admin users can use AI chat.
11. If stuck, user opens `/help` or submits a ticket in `/tickets`.

### Simple English

Viremo is a notebook for everything you watch or read. It remembers your titles, lets you group them, lets other people see your public profile, and adds social/help/admin tools around that core diary.

### Junior Developer Analogy

Imagine a library card system mixed with Instagram profiles and a support desk. The database is the filing cabinet, the API routes are the clerks, and React pages are the desks users interact with.

---

## Part 2 - Complete Text Mind Map

```text
Viremo Project
├── Frontend
│   ├── Next.js App Router
│   │   ├── app/layout.tsx
│   │   ├── app/page.tsx
│   │   ├── app/globals.css
│   │   ├── app/login/page.tsx
│   │   ├── app/dashboard/page.tsx
│   │   ├── app/calendar/page.tsx
│   │   ├── app/folders/page.tsx
│   │   ├── app/folders/[id]/page.tsx
│   │   ├── app/profile/[username]/page.tsx
│   │   ├── app/profile/[username]/folders/[folderId]/page.tsx
│   │   ├── app/community/page.tsx
│   │   ├── app/community/[postId]/page.tsx
│   │   ├── app/messages/page.tsx
│   │   ├── app/messages/[userId]/page.tsx
│   │   ├── app/notifications/page.tsx
│   │   ├── app/search/page.tsx
│   │   ├── app/settings/page.tsx
│   │   ├── app/settings/appearance/page.tsx
│   │   ├── app/tickets/page.tsx
│   │   ├── app/help/page.tsx
│   │   ├── app/ai-chat/page.tsx
│   │   └── app/admin/*
│   ├── Components
│   │   ├── src/components/site-header.tsx
│   │   ├── src/components/providers.tsx
│   │   ├── src/components/theme-initializer.tsx
│   │   ├── src/components/mobile-font-initializer.tsx
│   │   ├── src/components/login-card.tsx
│   │   ├── src/components/dashboard-client.tsx
│   │   ├── src/components/entry-card.tsx
│   │   ├── src/components/add-entry-modal.tsx
│   │   ├── src/components/folders-client.tsx
│   │   ├── src/components/folder-detail-client.tsx
│   │   ├── src/components/watch-calendar-client.tsx
│   │   ├── src/components/watch-history-calendar.tsx
│   │   ├── src/components/profile-social-panel.tsx
│   │   ├── src/components/messages-thread-client.tsx
│   │   ├── src/components/community-create-form.tsx
│   │   ├── src/components/community-reply-panel.tsx
│   │   ├── src/components/settings-client.tsx
│   │   ├── src/components/appearance-settings-client.tsx
│   │   ├── src/components/ticket-form.tsx
│   │   └── src/components/admin/*
│   └── Styling
│       ├── Tailwind CSS 4
│       ├── CSS variables in app/globals.css
│       ├── Soft pastel user theme
│       └── Blue-pink admin theme
├── Backend
│   ├── Next.js route handlers
│   │   └── app/api/**/route.ts
│   ├── Business/data helpers
│   │   ├── src/lib/data.ts
│   │   ├── src/lib/admin-data.ts
│   │   ├── src/lib/settings-data.ts
│   │   ├── src/lib/help.ts
│   │   ├── src/lib/ai-limits.ts
│   │   └── src/lib/entry-payload.ts
│   └── Utility clients
│       ├── src/lib/prisma.ts
│       ├── src/lib/postgres.ts
│       ├── src/lib/supabase-storage.ts
│       ├── src/lib/tmdb.ts
│       └── src/lib/books.ts
├── Database
│   ├── PostgreSQL
│   ├── Prisma schema
│   │   └── prisma/schema.prisma
│   ├── Main models
│   │   ├── User
│   │   ├── Entry
│   │   ├── Folder
│   │   ├── FolderEntry
│   │   ├── WatchHistory
│   │   ├── Follow
│   │   ├── Notification
│   │   ├── DirectMessage
│   │   ├── ProfileComment
│   │   ├── Ticket
│   │   ├── AiUsage
│   │   ├── AppConfig
│   │   ├── CommunityPost
│   │   ├── CommunityReply
│   │   └── HelpArticle
│   └── Auth models
│       ├── Account
│       ├── Session
│       └── VerificationToken
├── Authentication
│   ├── NextAuth.js
│   ├── src/lib/auth.ts
│   ├── Credentials provider
│   ├── Google provider
│   ├── Optional GitHub provider
│   ├── Prisma adapter
│   ├── JWT sessions
│   └── Role and ban checks
├── APIs
│   ├── /api/auth/*
│   ├── /api/entries
│   ├── /api/folders
│   ├── /api/watch-history
│   ├── /api/preferences
│   ├── /api/recommendations
│   ├── /api/ai-chat
│   ├── /api/search
│   ├── /api/upload-avatar
│   ├── /api/follows
│   ├── /api/messages
│   ├── /api/notifications
│   ├── /api/profile-comments
│   ├── /api/community
│   ├── /api/help
│   ├── /api/tickets
│   └── /api/admin/*
├── External Services
│   ├── Supabase PostgreSQL
│   ├── Supabase Storage bucket: avatars
│   ├── Google Gemini API
│   ├── TMDB API
│   ├── Google Books API
│   ├── Google OAuth
│   └── Optional GitHub OAuth
├── Hosting
│   ├── Designed for Vercel-style Next.js deployment
│   ├── Requires environment variables
│   └── Runs npm run build
├── Security
│   ├── Server-side session checks
│   ├── Admin role checks
│   ├── User ownership checks
│   ├── Password hashing with Node crypto scrypt
│   ├── Upload file type/size checks
│   ├── API payload validation
│   └── Remaining risks documented below
└── Deployment
    ├── npm install
    ├── postinstall: prisma generate
    ├── npm run build
    ├── next start or hosting platform
    └── database schema must be pushed/migrated before runtime
```

### Simple English

The app is split into pages, reusable UI components, API routes, helper libraries, and database models. Pages show screens. Components build the screens. API routes receive requests. Libraries contain shared logic. The database stores everything.

### Junior Developer Analogy

Think of the project as a restaurant. The frontend is the dining room, APIs are waiters, library files are kitchen stations, and the database is the pantry.

---

## Part 3 - Folder Structure

### Root Folder

Purpose: Holds project configuration and top-level documentation.

Important files:

- `package.json`: scripts and dependencies.
- `package-lock.json`: exact dependency versions.
- `next.config.ts`: Next.js configuration.
- `tsconfig.json`: TypeScript configuration.
- `eslint.config.mjs`: linting configuration.
- `postcss.config.mjs`: Tailwind/PostCSS setup.
- `prisma.config.ts`: Prisma config.
- `.env`: local secrets, not committed.
- `.env.example`: sample environment variables.
- `PROJECT_STATUS_REPORT.md`: project progress/status.
- `PROJECT_TECHNICAL_MANUAL.md`: this manual.

If removed: the app cannot install, build, type-check, or document itself correctly.

### `app/`

Purpose: Next.js App Router folder. Every route, page, layout, and API endpoint lives here.

Why it exists: Next.js 13+ uses the `app` directory for filesystem-based routing.

If removed: the website has no pages or API routes.

Important subfolders:

- `app/api`: backend route handlers.
- `app/admin`: admin panel pages.
- `app/dashboard`: logged-in diary dashboard.
- `app/profile/[username]`: public profile.
- `app/settings`: user settings.
- `app/community`: community posts.
- `app/messages`: direct messaging.

### `src/components/`

Purpose: Reusable React components.

Why it exists: Keeps UI logic out of page files.

If removed: pages would lose their interactive UI.

Important files:

- `site-header.tsx`: desktop sidebar and mobile drawer.
- `dashboard-client.tsx`: main diary dashboard interactions.
- `entry-card.tsx`: entry card display.
- `add-entry-modal.tsx`: add/edit entry modal.
- `folder-detail-client.tsx`: folder detail and multi-select add flow.
- `profile-social-panel.tsx`: follow/comments profile controls.
- `messages-thread-client.tsx`: DM conversation UI.
- `appearance-settings-client.tsx`: appearance and avatar settings.
- `confirm-toast.tsx`: in-app confirmation toast.

### `src/components/admin/`

Purpose: Admin-only UI components.

Important files:

- `admin-user-actions.tsx`: ban/promote/demote user actions.
- `admin-ticket-controls.tsx`: update ticket status/reply.
- `admin-help-client.tsx`: manage help articles.
- `admin-ai-limit-form.tsx`: configure Pro AI daily limit.
- `admin-delete-button.tsx`: reusable admin deletion button.

If removed: admin pages still load server data but cannot perform client-side actions.

### `src/lib/`

Purpose: Shared backend and frontend logic.

Why it exists: Prevents duplicating database/auth/validation logic across route handlers and pages.

Important files:

- `auth.ts`: NextAuth configuration.
- `data.ts`: main application data functions.
- `admin.ts`: admin guard helpers.
- `admin-data.ts`: admin data operations.
- `prisma.ts`: Prisma client.
- `postgres.ts`: pg pool.
- `entry-payload.ts`: entry validation.
- `settings-data.ts`: settings and account management.
- `ai-limits.ts`: Pro AI usage limits.
- `preferences.ts`: appearance preferences.
- `help.ts`: help article seed/manage logic.
- `supabase-storage.ts`: Supabase Storage client.
- `tmdb.ts`: TMDB search.
- `books.ts`: Google Books search.
- `password.ts`: password hashing/verification.
- `watchlist.ts`: entry/status display helpers.

If removed: APIs and pages lose shared business logic.

### `src/types/`

Purpose: TypeScript type augmentation.

Important file:

- `next-auth.d.ts`: extends NextAuth session/user/token types with `id`, `publicId`, `username`, `role`, `isBanned`.

If removed: TypeScript will complain when code accesses custom session fields.

### `prisma/`

Purpose: Database schema.

Important file:

- `schema.prisma`: all database models/enums.

If removed: Prisma cannot generate client types or know database structure.

### `public/`

Purpose: Static files served by Next.js.

If removed: static assets would be unavailable.

### `img/` and `wireframe/`

Purpose: project assets/reference materials.

If removed: app may still run unless code references assets inside them.

### `.next/` and `node_modules/`

Generated folders.

- `.next`: build output.
- `node_modules`: installed packages.

Do not edit manually.

---

## Part 4 - File-by-File Analysis

This section focuses on every important file. Generated files and binary assets are not deeply analyzed.

### Config Files

#### `package.json`

Purpose: Defines scripts and dependencies.

Scripts:

- `dev`: starts development server.
- `build`: production build.
- `start`: runs built Next.js app.
- `lint`: runs ESLint.
- `postinstall`: runs `prisma generate`, important on hosting.

Dependencies:

- Next.js 16, React 19.
- NextAuth for auth.
- Prisma 7 and PostgreSQL adapter.
- Supabase client for storage.
- Gemini SDK.
- Tailwind CSS 4.

Connected to: deployment, local development, Prisma client generation.

#### `prisma/schema.prisma`

Purpose: The source of truth for database tables and relationships.

Outputs: Prisma Client types and database schema.

Connected to: `src/lib/prisma.ts`, almost every API.

#### `app/globals.css`

Purpose: Global Tailwind import, theme variables, mobile font scaling, compatibility styling.

Important concepts:

- Soft pastel user palette.
- Dark mode palette.
- Admin blue-pink palette through `.admin-theme`.
- Mobile font scaling through `--mobile-font-scale`.
- Global button/card active effects for mobile.

Connected to: every page and component.

#### `app/layout.tsx`

Purpose: Root HTML layout for the entire app.

Does:

- Loads Google fonts.
- Wraps app in `Providers`.
- Mounts `ThemeInitializer`.
- Mounts `SiteHeader`.
- Defines page backdrop and main content area.

Inputs: `children`.

Outputs: global page shell.

Connected to: `Providers`, `SiteHeader`, `ThemeInitializer`, `globals.css`.

### Authentication and User Files

#### `src/lib/auth.ts`

Purpose: NextAuth configuration.

Does:

- Uses Prisma adapter.
- Provides credentials login.
- Provides Google OAuth if env vars exist.
- Provides GitHub OAuth if env vars exist.
- Auto-generates username for OAuth users through custom adapter `createUser`.
- Uses JWT sessions.
- Adds `publicId`, `username`, `role`, and `isBanned` to session.
- Blocks banned users in sign-in.

Inputs:

- Credentials email/password.
- OAuth provider profile data.

Outputs:

- Session object.
- JWT token.
- Database user records.

Connected to:

- `app/api/auth/[...nextauth]/route.ts`
- `src/lib/auth-users.ts`
- `src/lib/password.ts`
- `src/lib/users.ts`
- `src/types/next-auth.d.ts`

#### `src/types/next-auth.d.ts`

Purpose: Teaches TypeScript about custom session fields.

Without it: `session.user.role` and similar fields would show type errors.

#### `src/lib/auth-users.ts`

Purpose: Auth-specific user lookup/creation helpers for credential users.

Main functions:

- `getAuthUserByEmail(email)`: finds login user.
- `createCredentialUser(input)`: creates user with hashed password.

Connected to: registration route and credentials login.

#### `src/lib/users.ts`

Purpose: Creates usernames and OAuth users safely.

Main functions:

- `createBaseUsername(email, name)`: derives a username candidate.
- `createUserWithUniqueUsername(data)`: creates user with unique username/publicId.

Connected to: NextAuth adapter in `auth.ts`.

#### `src/lib/password.ts`

Purpose: Hashes and verifies passwords.

Uses Node `crypto.scrypt`.

Main functions:

- `hashPassword(password)`
- `verifyPassword(password, storedHash)`

Analogy: never store the real password; store a locked fingerprint that can be checked later.

### Database and Core Data Files

#### `src/lib/prisma.ts`

Purpose: Creates Prisma Client using PostgreSQL adapter.

Connected to: all Prisma database operations.

#### `src/lib/postgres.ts`

Purpose: Creates a raw `pg` pool.

Why it exists: Some code uses raw SQL for fields that previously caused Prisma client generation/deployment mismatch issues.

Connected to: `settings-data.ts` and some raw data access.

#### `src/lib/data.ts`

Purpose: Main application data access layer.

Main groups:

- Entries: `getEntriesForUser`.
- Profiles: `getPublicProfile`, `getAvatarForUser`.
- Preferences: `getPreferencesForUser`, `updatePreferencesForUser`.
- Folders: create/update/delete/add/remove.
- Watch history: get/add.
- AI chat history: get/add chat messages.
- Social: follow/unfollow, followers/following.
- Profile comments.
- Direct messages and conversations.
- Notifications.

Inputs: IDs, form data, user IDs.

Outputs: typed records for pages/API responses.

Connected to:

- dashboard, profile, folders, messages, notifications, AI, watch history, social APIs.

Important pattern:

- Almost every operation receives `userId` and checks ownership before changing data.

#### `src/lib/admin.ts`

Purpose: Admin authorization helpers.

Functions:

- `getAdminSession()`: returns session only if admin.
- `requireAdminPage()`: redirects non-admin page users.
- `requireAdminApi()`: returns 403 JSON for non-admin API users.

Connected to: all admin pages and admin API routes.

#### `src/lib/admin-data.ts`

Purpose: Admin database operations.

Functions:

- stats
- list/update/delete users
- list/delete entries
- list/delete comments
- list/update tickets
- user ticket create/list

Connected to: `/admin/*` pages and `/api/admin/*`.

#### `src/lib/settings-data.ts`

Purpose: Settings and account management.

Functions:

- validate email/username.
- load settings profile.
- update display name/username/bio/email.
- change password.
- delete account.

Connected to: `/settings` and settings API routes.

#### `src/lib/entry-payload.ts`

Purpose: Validates diary entry JSON before creating/updating.

Checks:

- title required.
- type must be MOVIE/SERIES/ANIME/BOOK.
- status must be WATCHING/COMPLETED/DROPPED.
- rating must be 1.0 to 5.0 in 0.5 steps.
- tmdbId must be positive integer.

Connected to: `/api/entries`, `/api/entries/[id]`.

#### `src/lib/preferences.ts`

Purpose: Defines and normalizes appearance preferences.

Preferences:

- layout: grid/list/card.
- theme: dark/light/warm/minimal.
- accentColor.
- mobileFontSize: small/medium/large.
- blocks: section order.

Connected to: appearance settings, dashboard, public profile.

#### `src/lib/ai-limits.ts`

Purpose: Pro AI usage tracking.

Functions:

- `getProDailyAiLimit()`
- `setProDailyAiLimit(limit)`
- `getAiUsageForUser(userId)`
- `consumeAiUsage(userId)`

Connected to: `/api/ai-chat`, admin AI limit controls.

#### `src/lib/help.ts`

Purpose: Help article seed and CRUD logic.

Functions:

- seed default help articles.
- get published help articles.
- get all articles for admin.
- create/update/delete.
- validate help payload.

Connected to: `/help`, `/admin/help`, help APIs.

#### `src/lib/tmdb.ts`

Purpose: Search TMDB.

Inputs: search query.

Outputs: normalized search results.

Connected to: `/api/search`.

#### `src/lib/books.ts`

Purpose: Search Google Books.

Connected to: `/api/search`.

#### `src/lib/supabase-storage.ts`

Purpose: Creates Supabase client for uploading avatars.

Requires:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Connected to: `/api/upload-avatar`.

#### `src/lib/watchlist.ts`

Purpose: Common display helpers for entries.

Important:

- Entry types.
- Watch statuses.
- `formatStatus` displays BOOK + WATCHING as `Reading`.
- `formatRating`.
- poster fallback letter.

### Component Files

#### `src/components/providers.tsx`

Wraps app in `SessionProvider` and mounts `MobileFontInitializer`.

#### `src/components/site-header.tsx`

Purpose: Main navigation.

Desktop:

- collapsed sidebar.
- expands on hover.

Mobile:

- top bar with hamburger.
- slide-in drawer.
- notification/profile buttons.

Also polls `/api/notifications` every 30 seconds.

#### `src/components/theme-initializer.tsx`

Reads local storage and applies light/dark theme to `<html>`.

#### `src/components/theme-toggle.tsx`

Button that toggles theme.

#### `src/components/mobile-font-initializer.tsx`

Loads saved mobile font preference and writes `--mobile-font-scale` to document root.

#### `src/components/login-card.tsx`

Login/register card.

Uses NextAuth `signIn`.

#### `src/components/dashboard-client.tsx`

Main interactive diary UI.

State:

- entries
- filters
- add/edit modal
- add-to-folder modal
- delete confirmation toast
- feedback messages

Calls APIs:

- `/api/entries`
- `/api/folders`
- `/api/folders/[id]/entries`

#### `src/components/add-entry-modal.tsx`

Reusable add/edit form for entries.

Inputs:

- open
- initialEntry
- initialDraft
- onSubmit

Outputs:

- EntryDraft passed to parent.

Mobile fix:

- bounded height
- scrollable body
- sticky action buttons

#### `src/components/entry-card.tsx`

Displays one diary entry with poster, badges, rating, notes, and action buttons.

#### `src/components/folders-client.tsx`

Folder list and create/edit/delete UI.

Uses `ConfirmToast` for delete.

#### `src/components/folder-detail-client.tsx`

Folder detail UI.

Features:

- View entries inside a folder.
- Remove entries.
- Search and multi-select entries to add.
- Select visible / Clear.

#### `src/components/confirm-toast.tsx`

Reusable bottom confirmation toast.

Used for diary entry delete and folder delete.

#### `src/components/watch-calendar-client.tsx`

Calendar page client UI for watch history.

#### `src/components/watch-history-calendar.tsx`

Dashboard calendar widget.

#### `src/components/recommendations.tsx`

Loads recommendations from `/api/recommendations`.

Features:

- refresh without full reload.
- add recommendation to diary through `AddEntryModal`.

#### `src/components/search-client.tsx`

Search UI for external titles and users.

#### `src/components/profile-social-panel.tsx`

Profile follow/comment UI.

Calls:

- follow API.
- profile comment API.

#### `src/components/social-user-list.tsx`

Reusable followers/following list.

#### `src/components/messages-thread-client.tsx`

Direct message conversation UI.

Calls `/api/messages/[userId]`.

#### `src/components/community-create-form.tsx`

Community post creation form.

Supports images and YouTube URL.

#### `src/components/community-reply-panel.tsx`

Replies, upvotes, best answer controls.

#### `src/components/settings-client.tsx`

Profile settings, password change, account deletion.

#### `src/components/appearance-settings-client.tsx`

Appearance settings:

- avatar upload.
- layout mode.
- theme.
- mobile font size.
- accent color.
- block order.

#### `src/components/ticket-form.tsx`

Support ticket submission form.

#### `src/components/help-center-client.tsx`

Searchable accordion help center.

#### Admin Components

- `admin-ai-limit-form.tsx`: updates Pro AI daily limit.
- `admin-delete-button.tsx`: generic delete button with browser confirm.
- `admin-help-client.tsx`: help article CRUD UI.
- `admin-ticket-controls.tsx`: ticket status/reply controls.
- `admin-user-actions.tsx`: ban/promote/demote controls.

### Page Files

#### `app/page.tsx`

Public home page. If logged in, CTA goes to dashboard; otherwise login.

#### `app/login/page.tsx`

Redirects logged-in users to dashboard. Shows `LoginCard`.

#### `app/dashboard/page.tsx`

Protected page. Loads entries and preferences, passes them to `DashboardClient`.

#### `app/calendar/page.tsx`

Protected calendar page using `WatchCalendarClient`.

#### `app/folders/page.tsx`

Protected folder list page using `FoldersClient`.

#### `app/folders/[id]/page.tsx`

Protected folder detail page. Ensures the folder belongs to current user.

#### `app/profile/[username]/page.tsx`

Public profile page. Loads public profile by username or public ID.

#### `app/profile/[username]/folders/[folderId]/page.tsx`

Public folder page. Only public folders are visible.

#### `app/community/page.tsx`

Community feed. Optional category filter.

#### `app/community/[postId]/page.tsx`

Single community post page with replies.

#### `app/messages/page.tsx`

Protected conversations inbox.

#### `app/messages/[userId]/page.tsx`

Protected direct message thread.

#### `app/notifications/page.tsx`

Protected notifications page.

#### `app/followers/page.tsx` and `app/following/page.tsx`

Protected social lists.

#### `app/search/page.tsx`

Protected search page.

#### `app/settings/page.tsx`

Protected account settings.

#### `app/settings/appearance/page.tsx`

Protected appearance and avatar settings.

#### `app/tickets/page.tsx`

Protected user support tickets.

#### `app/help/page.tsx`

Public help center.

#### `app/ai-chat/page.tsx`

Protected AI chat page. Free users see locked state; Pro users see usage counter; admin can access as privileged role.

#### `app/admin/*`

Admin-only dashboard, users, entries, comments, tickets, help pages.

### API Files

The API route pattern is:

1. Read session with `getServerSession(authOptions)`.
2. Return 401/403 if unauthorized.
3. Parse request body or params.
4. Validate input.
5. Call library/database function.
6. Return JSON response.
7. Catch errors and return 500 or validation error.

Important API groups:

- `app/api/auth/[...nextauth]/route.ts`: NextAuth handler.
- `app/api/auth/register/route.ts`: credential registration.
- `app/api/entries/route.ts`: GET/POST entries.
- `app/api/entries/[id]/route.ts`: PUT/DELETE one entry.
- `app/api/folders/route.ts`: GET/POST folders.
- `app/api/folders/[id]/route.ts`: PUT/DELETE folder.
- `app/api/folders/[id]/entries/route.ts`: add entry to folder.
- `app/api/folders/[id]/entries/[entryId]/route.ts`: remove entry from folder.
- `app/api/watch-history/route.ts`: GET/POST watch history.
- `app/api/preferences/route.ts`: GET/PUT appearance preferences.
- `app/api/search/route.ts`: searches TMDB/books/users.
- `app/api/recommendations/route.ts`: Gemini/fallback recommendations.
- `app/api/ai-chat/route.ts`: Gemini chat, Pro limits, chat history.
- `app/api/upload-avatar/route.ts`: Supabase avatar upload.
- `app/api/follows/[userId]/route.ts`: follow/unfollow.
- `app/api/messages/[userId]/route.ts`: get/send direct messages.
- `app/api/notifications/route.ts`: unread counts and notifications.
- `app/api/profile-comments/*`: add/delete profile comments.
- `app/api/community/*`: posts, replies, upvotes, best answer.
- `app/api/help/route.ts`: public help articles.
- `app/api/tickets/route.ts`: user ticket list/create.
- `app/api/admin/*`: admin operations.

---

## Part 5 - User Flow

### 1. User Opens Website

```text
Browser -> GET /
Next.js -> app/page.tsx
app/page.tsx -> getServerSession(authOptions)
If session exists -> CTA points to /dashboard
If no session -> CTA points to /login
Browser renders homepage
```

### 2. User Signs Up

```text
Browser form -> POST /api/auth/register
register route -> validates email/password/name
register route -> createCredentialUser()
createCredentialUser -> hashPassword()
createCredentialUser -> creates User with publicId and username
Response -> success JSON
Browser -> can sign in with credentials
```

### 3. User Logs In

Credentials:

```text
LoginCard -> next-auth signIn("credentials")
NextAuth -> CredentialsProvider.authorize()
authorize -> getAuthUserByEmail()
authorize -> verifyPassword()
authorize -> checks isBanned
NextAuth -> jwt callback
NextAuth -> session callback
Browser -> receives session cookie
User -> redirected to /dashboard
```

Google:

```text
LoginCard -> signIn("google")
Google OAuth consent
NextAuth callback
Prisma adapter createUser override
createUserWithUniqueUsername()
Account linked to User
JWT/session callbacks add custom fields
Redirect to app
```

### 4. User Navigates Pages

Protected server pages call `getServerSession`. If no session, they redirect to `/login`.

Example dashboard:

```text
GET /dashboard
dashboard/page.tsx -> getServerSession
dashboard/page.tsx -> getEntriesForUser + getPreferencesForUser
DashboardClient renders entries, filters, stats, forms
```

### 5. User Performs Actions

Example add diary entry:

```text
User opens AddEntryModal
User submits form
DashboardClient -> POST /api/entries
API -> session check
API -> parseEntryPayload
API -> prisma.entry.create
API -> returns created entry
DashboardClient -> adds entry to local state
UI updates without full page reload
```

Example add multiple entries to folder:

```text
User opens /folders/[id]
FolderDetailClient -> GET /api/entries
User selects multiple entries
FolderDetailClient -> POST /api/folders/[id]/entries for each selected entry
API -> ownership checks
API -> creates FolderEntry rows
UI prepends added entries
```

### 6. User Logs Out

```text
SiteHeader -> signOut()
NextAuth clears session cookie
Browser redirects to /
Protected pages redirect to /login if revisited
```

### Simple English

Most actions follow the same loop: user clicks, component sends fetch request, API checks login, database changes, JSON comes back, component updates screen.

### Analogy

The frontend is a form on a counter. The API is the staff member checking the form. The database is the filing cabinet. The staff member writes to the cabinet and gives the user a receipt.

---

## Part 6 - Frontend Flow

### Routing

Next.js App Router maps folders to URLs:

```text
app/dashboard/page.tsx        -> /dashboard
app/folders/[id]/page.tsx     -> /folders/:id
app/profile/[username]/page.tsx -> /profile/:username
app/api/entries/route.ts      -> /api/entries
```

### Server Components vs Client Components

Server components:

- Page files are usually server components.
- They fetch session/data before rendering.
- They can call Prisma/helpers directly.

Client components:

- Files with `"use client"`.
- They handle clicks, forms, local state, `fetch`, and `useState`.

### State Management

There is no Redux/Zustand. State is local React state.

Examples:

- `DashboardClient`: entries, filters, modals.
- `FolderDetailClient`: selected entries, loaded entries, feedback.
- `MessagesThreadClient`: message list and draft.
- `AppearanceSettingsClient`: preferences and avatar upload status.

### Forms

Forms are handled with controlled components:

```text
input value -> React state
onChange -> update state
submit -> fetch API
API response -> update UI
```

### Validation

Frontend validates required inputs lightly. Backend performs authoritative validation:

- `entry-payload.ts` validates entries.
- settings APIs validate email/username/password.
- upload route validates file type/size.
- ticket/help routes validate required fields.

### UI Libraries

- React.
- Tailwind CSS 4.
- No large component library.
- Custom reusable components.

### Page Communication

Pages do not directly talk to each other. Shared data goes through:

- URL routes.
- API routes.
- Database.
- React props from server page to client component.

### Frontend Diagram

```text
Page Server Component
    |
    | fetches initial data/session
    v
Client Component
    |
    | user clicks/submits
    v
fetch("/api/...")
    |
    v
Update local React state
    |
    v
Screen changes
```

---

## Part 7 - Backend Flow

### API Architecture

Backend logic is implemented using Next.js route handlers in `app/api`.

There are no separate Express controllers. Each `route.ts` is the controller for that endpoint.

### Controller Pattern

Example:

```ts
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorized;

  const body = await request.json();
  const parsed = validate(body);
  if (!parsed.success) return badRequest;

  const record = await prisma.model.create(...);
  return NextResponse.json(record);
}
```

### Middleware

There is no global `middleware.ts` in this project. Protection is done inside pages and API routes.

### Services

Service-like files live in `src/lib`:

- `data.ts`
- `admin-data.ts`
- `settings-data.ts`
- `help.ts`
- `ai-limits.ts`
- `entry-payload.ts`

### Business Logic

Examples:

- A user can only update their own entries.
- A folder can only be modified by its owner.
- Public profile pages only show public folders.
- Free users cannot use AI chat.
- Pro users have daily AI limits.
- Admin routes require role ADMIN.

### Error Handling

Common responses:

- 401 Unauthorized: not logged in.
- 403 Forbidden: logged in but not allowed.
- 400 Bad Request: invalid input.
- 404 Not Found: record missing or not visible.
- 500 Server Error: unexpected failure.

### Request Lifecycle

```text
Client fetch
  -> app/api route handler
  -> getServerSession
  -> validate request
  -> call src/lib helper or prisma
  -> database query/mutation
  -> JSON response
  -> client updates UI
```

---

## Part 8 - Database Flow

### Database Type

PostgreSQL, accessed mainly through Prisma Client. Some raw SQL is used with Prisma `$queryRaw` or `pg` for compatibility and precise queries.

### Core Tables

#### User

The central table. Almost everything belongs to a user.

Fields include:

- profile fields: name, email, username, bio, image, avatarUrl, publicId.
- auth fields: passwordHash, accounts, sessions.
- permissions: role, isBanned.
- preferences JSON.

#### Entry

A diary item.

Belongs to User.

Has:

- title
- type
- status
- rating
- notes
- poster
- tmdbId

#### Folder and FolderEntry

Folders are custom collections. FolderEntry is the many-to-many join table.

```text
User 1 -> many Folders
Folder many -> many Entries through FolderEntry
Entry many -> many Folders through FolderEntry
```

#### WatchHistory

Logs when an entry was watched/read.

#### Follow

Represents one user following another.

#### Notification

Currently used for follow notifications.

#### DirectMessage

Stores DMs between sender and recipient.

#### ProfileComment

Comments on public profiles.

#### Ticket

Support tickets.

#### AiUsage and AppConfig

Tracks Pro AI usage and stores admin configurable AI limit.

#### CommunityPost and CommunityReply

Community recommendation requests and replies.

#### HelpArticle

Admin-managed help center content.

### ER Diagram

```text
User
 ├── Entry
 │    ├── WatchHistory
 │    └── FolderEntry ─── Folder ─── User
 ├── Account
 ├── Session
 ├── ChatMessage
 ├── Ticket
 ├── AiUsage
 ├── CommunityPost ─── CommunityReply
 ├── CommunityReply
 ├── DirectMessage(sender)
 ├── DirectMessage(recipient)
 ├── Follow(follower)
 ├── Follow(following)
 ├── Notification(user)
 ├── Notification(actor)
 ├── ProfileComment(profileUser)
 └── ProfileComment(author)
```

### User -> Database -> API -> Frontend Flow

```text
User clicks "Add entry"
  -> Frontend sends JSON
  -> API checks session
  -> API validates body
  -> Prisma writes Entry row
  -> API returns Entry JSON
  -> Frontend adds Entry to state
```

---

## Part 9 - Authentication

### Registration Process

```text
POST /api/auth/register
  -> validate body
  -> hash password
  -> generate publicId
  -> generate username
  -> create User
```

### Login Process

Credentials:

```text
Login form
  -> NextAuth credentials provider
  -> get user by email
  -> verify scrypt password
  -> reject if banned
  -> create JWT session
```

### Google OAuth Process

```text
Click Google login
  -> Google consent
  -> NextAuth callback
  -> Prisma adapter
  -> custom createUser
  -> createUserWithUniqueUsername
  -> Account row links Google account
  -> JWT session created
```

### JWT/Session Handling

Session strategy is JWT. The JWT callback refreshes user fields from DB:

- name
- email
- publicId
- username
- role
- isBanned

Session callback exposes those fields to frontend/server pages.

### Protected Routes

Protected pages call:

```ts
const session = await getServerSession(authOptions);
if (!session?.user?.id) redirect("/login");
```

Admin pages call:

```ts
await requireAdminPage();
```

Admin APIs call:

```ts
const guard = await requireAdminApi();
if (guard.response) return guard.response;
```

### Authentication Sequence Diagram

```text
Browser
  -> /login
  -> signIn(credentials)
NextAuth
  -> CredentialsProvider.authorize
Database
  -> User lookup
NextAuth
  -> JWT callback
  -> Session callback
Browser
  -> session cookie
  -> /dashboard
```

### Simple English

Login proves who you are. The session remembers you. Every protected route checks that session before showing private data.

---

## Part 10 - Deployment

### Hosting Provider

The repository is structured for a standard Next.js hosting provider such as Vercel. The code itself does not include a CI/CD config file like GitHub Actions. Deployment likely happens through the hosting provider connected to GitHub.

### Environment Variables

Required/important:

```text
DATABASE_URL
DIRECT_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
GEMINI_API_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
TMDB_API_KEY
GOOGLE_BOOKS_API_KEY
GITHUB_ID
GITHUB_SECRET
```

Some are optional depending on enabled features.

### Build Process

```text
npm install
postinstall -> prisma generate
npm run build -> next build
npm run start -> next start
```

### Database Deployment

Before production runtime, the PostgreSQL schema must match `prisma/schema.prisma`.

Typical commands:

```text
npx prisma generate
npx prisma db push
```

For mature production, prefer Prisma migrations instead of only `db push`.

### Domain Configuration

Set `NEXTAUTH_URL` to the production URL. OAuth providers must also have callback URLs configured.

Google callback usually:

```text
https://your-domain.com/api/auth/callback/google
```

### CI/CD Pipeline

Current repo does not define explicit CI. Recommended:

```text
GitHub push
  -> hosting provider build
  -> npm install
  -> prisma generate
  -> next build
  -> deploy if build passes
```

---

## Part 11 - Security

### Current Security Measures

- Server session checks on protected pages.
- API session checks.
- Admin role checks.
- Banned users blocked in auth and client header.
- Password hashing with scrypt.
- Entry payload validation.
- Folder/entry ownership checks.
- Public folders filtered by `isPublic`.
- Avatar upload validates type and size.
- Supabase server key kept server-side.
- Prisma parameterized queries and tagged raw SQL reduce injection risk.

### Potential Vulnerabilities

- No global middleware means every new route must remember to check auth.
- Admin delete buttons still use browser confirms in some admin components.
- Community image upload should be reviewed for size/count/type enforcement.
- AI prompt uses user data and should be monitored for prompt injection behavior.
- Rate limiting is limited; most APIs can be spammed if authenticated.
- CSRF risk is lower with same-site app fetches but should be reviewed for sensitive routes.
- Service role Supabase key is powerful; must never be exposed to client.
- Raw SQL must remain parameterized.
- Account deletion is permanent and relies on cascading deletes.

### Recommended Improvements

- Add `middleware.ts` for broad route protection.
- Add rate limits to auth, messages, comments, tickets, AI, uploads.
- Add audit logs for admin destructive actions.
- Add input length limits everywhere.
- Add image scanning or stricter community upload validation.
- Use Prisma migrations for production schema changes.
- Add automated tests for auth and ownership checks.
- Add CI build/typecheck/lint pipeline.
- Replace remaining admin browser confirms with `ConfirmToast`.
- Add database indexes for high-traffic queries as usage grows.

---

## Part 12 - System Architecture

### 1. High-Level Architecture

```text
Browser
  |
  v
Next.js App Router
  |
  ├── Server Pages -> read session/data -> render HTML
  ├── Client Components -> user interactions -> fetch APIs
  └── API Route Handlers
         |
         ├── NextAuth session
         ├── src/lib business logic
         ├── Prisma / pg
         └── External APIs
                ├── Gemini
                ├── TMDB
                ├── Google Books
                └── Supabase Storage
```

### 2. Component Diagram

```text
RootLayout
 ├── Providers
 │    ├── SessionProvider
 │    └── MobileFontInitializer
 ├── ThemeInitializer
 ├── SiteHeader
 └── Page
      ├── Server data fetch
      └── Client component
           ├── Form state
           ├── fetch API
           └── local UI update
```

### 3. Entry Creation Sequence

```text
User -> AddEntryModal -> DashboardClient
DashboardClient -> POST /api/entries
/api/entries -> getServerSession
/api/entries -> parseEntryPayload
/api/entries -> prisma.entry.create
Database -> Entry row
/api/entries -> JSON entry
DashboardClient -> setEntries
User sees new card
```

### 4. Authentication Flow Diagram

```text
Credentials Login:
Browser -> NextAuth -> authorize -> User table -> password verify -> JWT -> Session

Google Login:
Browser -> Google -> NextAuth callback -> Prisma adapter -> User/Account tables -> JWT -> Session
```

### 5. Database Diagram

```text
User 1---N Entry
User 1---N Folder
Entry N---N Folder through FolderEntry
User 1---N WatchHistory
User 1---N ChatMessage
User N---N User through Follow
User 1---N DirectMessage as sender
User 1---N DirectMessage as recipient
User 1---N ProfileComment as profile owner
User 1---N ProfileComment as author
User 1---N Ticket
User 1---1 AiUsage
User 1---N CommunityPost
CommunityPost 1---N CommunityReply
HelpArticle stands alone
AppConfig stands alone
```

### 6. API Flow Diagram

```text
Client fetch
  |
  v
Route handler
  |
  ├── Auth/session check
  ├── Parse params/body
  ├── Validate
  ├── Call src/lib or Prisma
  ├── Catch errors
  └── Return JSON
```

### 7. Deployment Diagram

```text
GitHub
  |
  v
Hosting provider
  |
  ├── npm install
  ├── prisma generate
  ├── next build
  └── deploy serverless/Node runtime
         |
         ├── PostgreSQL/Supabase DB
         ├── Supabase Storage
         ├── Gemini API
         ├── TMDB API
         └── Google APIs
```

---

## Part 13 - Learning Mode Notes

### How to Read This Codebase

Start in this order:

1. `prisma/schema.prisma`: learn the data.
2. `src/lib/auth.ts`: learn login/session.
3. `app/layout.tsx`: learn app shell.
4. `src/components/site-header.tsx`: learn navigation.
5. `app/dashboard/page.tsx` and `src/components/dashboard-client.tsx`: learn main product.
6. `app/api/entries/route.ts`: learn API pattern.
7. `src/lib/data.ts`: learn shared data access.
8. Admin, social, AI, and community features.

### Beginner Explanation

Every feature has three layers:

```text
Screen -> API -> Database
```

Sometimes a server page reads directly from the database before rendering:

```text
Server Page -> Database -> HTML
```

Client components handle interactive changes after the page loads.

### Real-World Analogy

If Viremo were a school:

- Users are students.
- Entries are homework notebooks.
- Folders are binders.
- Public profiles are display boards.
- APIs are office staff.
- Admin panel is the principal's office.
- Database is the student records room.
- Auth is the ID card check at the gate.

---

## Part 14 - Final Master Explanation

When a visitor opens Viremo, Next.js renders the home page through `app/page.tsx`. The root layout wraps everything in shared providers, theme initialization, mobile font initialization, and navigation. If the visitor is not logged in, the page invites them to create an account or log in. If they are logged in, the CTA points to the dashboard.

When a user registers with email and password, the register API validates their input, hashes the password, generates a public ID and username, and stores a new `User` row. When a user logs in, NextAuth checks their credentials, verifies their hashed password, confirms they are not banned, and creates a JWT session. For Google OAuth, NextAuth redirects the user to Google, receives the callback, and uses the Prisma adapter override to create a user with a unique username.

Once logged in, the user opens `/dashboard`. The dashboard server page checks the session, loads the user's entries and preferences, serializes dates, and passes everything into `DashboardClient`. The client component displays the featured entry, stats, filters, entry cards, recommendations, and watch calendar. When the user adds an entry, the modal collects data, sends it to `/api/entries`, the API validates it with `parseEntryPayload`, Prisma writes it into the `Entry` table, and the frontend inserts the returned entry into local state. No full page reload is needed.

If the user searches for titles, `/search` uses `SearchClient`, which calls `/api/search`. That API can query TMDB and Google Books, then returns normalized results. The user can add found titles to their diary. Entries can be edited, deleted, rated, and filtered.

Folders let users organize entries. A folder belongs to one user. Entries belong to one user. The many-to-many relationship is stored in `FolderEntry`. When the user opens `/folders/[id]`, the server verifies ownership by querying a folder with both `id` and `userId`. The client can now load diary entries, select several entries at once, and add them through `/api/folders/[id]/entries`. The API checks the folder and entry both belong to the current user before creating a `FolderEntry`.

The profile system lets users expose public information. `/profile/[username]` can find a user by username or public ID. It loads public entries, public folders, avatar, bio, social counts, comments, and preferences. Private folders are never returned to visitors. Public folder detail pages also require `isPublic: true`.

The social system uses `Follow`, `Notification`, `DirectMessage`, and `ProfileComment`. Following creates a `Follow` row and a follow notification. Unfollowing deletes the follow and removes unread follow notifications. Messages are stored as `DirectMessage` rows with sender and recipient. Profile comments are tied to a profile owner and an author.

The AI system has two parts. Recommendations call `/api/recommendations`; free users receive local fallback recommendations, while Pro/Admin users can use Gemini if `GEMINI_API_KEY` is configured. AI chat calls `/api/ai-chat`; regular users are blocked, Pro users consume daily usage from `AiUsage`, and admins bypass Pro limits. Chat messages are stored in `ChatMessage` so future prompts include recent conversation history.

The admin system is protected by `requireAdminPage` and `requireAdminApi`. Admins can view stats, manage users, moderate entries/comments, answer tickets, manage help articles, and set the Pro AI daily limit. Role and ban data live on the `User` table.

The settings system lets users edit profile info, password, account deletion, avatar, and appearance. Avatar upload goes through `/api/upload-avatar`, validates JPG/PNG and size, uploads to Supabase Storage bucket `avatars`, then stores the public URL in `User.avatarUrl`. Appearance preferences are saved as JSON in `User.preferences`.

The help system uses `HelpArticle`. Public users see only published articles at `/help`. Admins can create, edit, publish/unpublish, reorder, and delete articles at `/admin/help`.

The whole system depends on the database schema being current. `postinstall` runs `prisma generate` so deployment has Prisma types. Production also needs the PostgreSQL schema pushed or migrated. Environment variables connect the app to database, auth secrets, OAuth, Gemini, TMDB, Google Books, and Supabase Storage.

In short, Viremo works like this:

```text
Visitor opens site
  -> logs in/registers
  -> session is created
  -> dashboard loads user data
  -> user creates entries/folders/messages/posts
  -> API validates and writes database rows
  -> UI updates from returned JSON
  -> public profile displays allowed data
  -> admin tools manage the system
```

That is the complete lifecycle: browser request, Next.js route, authentication check, validation, database operation, JSON/HTML response, and React UI update.

---

## Maintenance Checklist

Before changing a feature:

1. Find the page in `app/`.
2. Find the client component in `src/components/`.
3. Find the API route in `app/api/`.
4. Find shared logic in `src/lib/`.
5. Check `prisma/schema.prisma` if data shape changes.
6. Run:

```text
npm run build
```

For database changes:

1. Update `prisma/schema.prisma`.
2. Run `npx prisma generate`.
3. Push/migrate database.
4. Update affected TypeScript types/components.

For new protected APIs:

1. Call `getServerSession(authOptions)`.
2. Return 401 if missing.
3. Check ownership/admin role.
4. Validate inputs.
5. Return safe JSON.

For new admin pages:

1. Use `requireAdminPage`.
2. Use admin theme classes or `.admin-theme`.
3. Add API guard with `requireAdminApi`.

For new upload features:

1. Check file type.
2. Check file size.
3. Store using server-side Supabase client.
4. Never expose service role key.

---

## Known Gaps and Future Improvements

- Add automated tests.
- Add CI pipeline.
- Add global middleware for protected route patterns.
- Replace remaining admin browser confirms with `ConfirmToast`.
- Add rate limiting.
- Add stricter community image validation.
- Add real-time messaging with websockets or polling.
- Add Prisma migrations for production-grade schema history.
- Add logging/monitoring for API failures.
- Add admin audit logs.

