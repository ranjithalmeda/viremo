# Viremo Project Status Report

**Date:** June 6, 2026  
**Project:** Viremo - Entertainment Diary for Movies, Series, Anime, and Books  
**Status:** Release candidate / ready for staging deployment  
**Recommendation:** Deploy to staging first, run the manual checklist below, then deploy production.

---

## 1. Executive Summary

Viremo is now a feature-complete release candidate. The core diary, folders, calendar, public profiles, social features, direct messages, notifications, community recommendations, admin panel, support tickets, help articles, avatar upload, Google OAuth, Pro AI limits, Gemini recommendations, and Gemini AI chat are implemented.

The latest UI overhaul is also complete:

- The crowded top navbar was replaced with a collapsible left sidebar on desktop.
- Mobile uses a bottom navigation bar.
- The default theme is now the new dark purple/gold Viremo theme.
- Light and dark modes use consistent CSS variables.
- The login page, empty states, community page, dashboard stats, recommendation cards, search/find users page, and admin context styling were refreshed.
- The recent hydration issue in `ThemeToggle` was fixed.

The app builds successfully. ESLint passes with warnings only.

---

## 2. Current Stack

- Frontend: Next.js 16.2.2, React 19.2.4, TypeScript, Tailwind CSS 4
- Backend: Next.js App Router route handlers
- Database: PostgreSQL on Supabase
- ORM: Prisma 7.6.0 with `@prisma/adapter-pg`
- Auth: NextAuth.js 4.24.14
- Storage: Supabase Storage
- AI: Google Gemini via `@google/generative-ai`
- AI model currently used: `gemini-2.0-flash`
- External APIs: TMDB, Google Books, Gemini, Supabase Storage

---

## 3. Latest Verification

Commands run on June 6, 2026:

```bash
npm run lint
npm run build
```

Results:

- `npm run lint`: passed with warnings only.
- `npm run build`: passed successfully.
- TypeScript check: passed as part of `next build`.
- Production route generation: passed for 48 app routes.

Current lint warnings:

- Several files use raw `<img>` instead of `next/image`.
- `src/components/watch-history-calendar.tsx` has an unused `WatchHistoryItem` type.

These warnings do not block deployment, but they are good cleanup tasks before a polished v1.

---

## 4. Deployment Recommendation

My suggestion: **yes, it is ready to deploy to staging.**  
For production, I recommend one final browser smoke test with real accounts and real environment variables.

Deploy now if:

- Supabase database schema is already synced with `prisma/schema.prisma`.
- Supabase Storage buckets exist and are public where required.
- Production environment variables are complete.
- You have created or promoted at least one admin user.
- You can successfully log in with credentials and Google OAuth in the deployment environment.
- Gemini, TMDB, Google Books, and Supabase Storage keys are valid.

Do not treat this as final production-ready until the manual checklist in section 12 is completed once on the deployed URL.

---

## 5. Database Schema Status

Current major models:

- `User`
- `Entry`
- `WatchHistory`
- `ChatMessage`
- `Folder`
- `FolderEntry`
- `Follow`
- `Notification`
- `DirectMessage`
- `ProfileComment`
- `Ticket`
- `AiUsage`
- `AppConfig`
- `CommunityPost`
- `CommunityReply`
- `HelpArticle`
- `Account`
- `Session`
- `VerificationToken`

Current enums:

- `Role`: `USER`, `PRO`, `ADMIN`
- `EntryType`: `MOVIE`, `SERIES`, `ANIME`, `BOOK`
- `WatchStatus`: `WATCHING`, `COMPLETED`, `DROPPED`
- `ChatRole`: `USER`, `ASSISTANT`
- `NotificationType`: `FOLLOW`
- `TicketStatus`: `OPEN`, `IN_PROGRESS`, `RESOLVED`
- `TicketCategory`: `BUG`, `INAPPROPRIATE_CONTENT`, `ACCOUNT_ISSUE`, `OTHER`

Important schema features now present:

- `User.avatarUrl`
- `User.bio`
- `User.role`
- `User.isBanned`
- `User.preferences`
- `Entry.rating` is `Float?` for decimal ratings.
- Folder many-to-many support through `FolderEntry`.
- Public/private folders.
- Direct messages with read state.
- Follow notifications.
- Profile comments.
- Help articles.
- Support tickets.
- Community posts/replies.
- Pro AI usage tracking.
- App config storage for admin-managed AI limits.

---

## 6. Completed Product Features

Core diary:

- Register/login.
- Google OAuth sign-in.
- Credential sign-in.
- Entry CRUD.
- Movie, series, anime, and book support.
- Decimal ratings from 1.0 to 5.0.
- Book status displays `Reading` when the stored status is `WATCHING`.
- External search through TMDB and Google Books.
- Add external results to diary.

Dashboard:

- Featured entry hero retained.
- Entry filters and cards.
- Stats bar with purple/gold accents.
- Recommendation cards with gold type badges.
- Add recommendation to diary.
- Refresh recommendations without full page reload.
- Add entry to folder from entry cards.
- Personalized diary view based on saved appearance preferences.

Folders:

- Create public/private folders.
- Edit/delete folders.
- Add/remove entries.
- One entry can belong to multiple folders.
- Public folders appear on public profiles.
- Public folders are clickable at `/profile/[username]/folders/[folderId]`.
- Private folders are protected.

Calendar and watch history:

- Watch history model and API.
- Calendar month view.
- Date selection.
- Log entry modal connected to `POST /api/watch-history`.
- Successful logging refreshes calendar data.

Appearance and profile customization:

- Layout modes: Grid, List, Card.
- Themes: Dark, Light, Warm, Minimal.
- Custom accent color.
- Reorder profile blocks.
- Preferences saved per user.
- Public profile reflects owner preferences.
- Avatar upload through Supabase Storage.
- Initials fallback avatar.

Social:

- Follow/unfollow.
- Followers/following counts.
- `/followers` page.
- `/following` page.
- Empty states with Find users action.
- Direct messages.
- Inbox with latest message preview.
- Conversation threads.
- Message button on public profiles.
- Clickable username/display name in message thread.
- Profile comments.
- Profile owner can delete comments.
- Notifications for new follows.
- Unread message and notification badges.

Community:

- `/community` feed.
- Create recommendation request posts.
- Category filters.
- Up to 3 image uploads through Supabase Storage bucket `community`.
- Optional YouTube/trailer link support.
- Post detail page.
- Replies.
- Upvote/helpful action.
- Best answer marking by post author.
- Clickable usernames to public profiles.

AI and Pro access:

- Free users cannot access AI chat.
- Pro users get daily AI chat limits.
- Admin can configure the Pro daily limit.
- Free users receive local fallback recommendations.
- Pro/Admin users can receive Gemini-powered recommendations.
- AI chat stores history best-effort.
- AI chat can answer harmless out-of-context questions briefly.
- AI features use `gemini-2.0-flash`.

Admin and support:

- Role-based admin access.
- Ban/unban users.
- Promote/demote users, including Pro/Admin.
- Delete users and associated data.
- Moderate entries.
- Moderate comments.
- View stats.
- Manage support tickets.
- Admin replies to tickets.
- User-side ticket submission and ticket list.
- Admin-managed help articles.
- Public help page with search and accordion articles.

UI shell and theme:

- Collapsible desktop sidebar.
- Mobile bottom nav.
- Message/notification badges in nav.
- New default color system:
  - Purple: `#8B5CF6`
  - Gold: `#D4AF37`
  - Dark background: `#171923`
  - Dark panels: `#1E2130`
- Consistent dark/light CSS variables.
- Hydration-safe theme toggle.
- Updated login page with poster-collage style hero.
- Combined `/search` page includes Find Profile plus title search.

---

## 7. API Endpoint Status

Authentication:

- `POST /api/auth/register`
- `/api/auth/[...nextauth]`

Entries:

- `GET/POST /api/entries`
- `PUT/DELETE /api/entries/[id]`

Watch history:

- `GET/POST /api/watch-history`

Folders:

- `GET/POST /api/folders`
- `PUT/DELETE /api/folders/[id]`
- `POST /api/folders/[id]/entries`
- `DELETE /api/folders/[id]/entries/[entryId]`

Profiles and social:

- `GET /api/profile/[username]`
- `GET /api/profile/[username]/folders/[folderId]`
- `POST/DELETE /api/follows/[userId]`
- `GET/POST /api/messages/[userId]`
- `GET /api/notifications`
- `POST /api/profile-comments/users/[userId]`
- `DELETE /api/profile-comments/[commentId]`

Settings:

- `PUT /api/settings/profile`
- `PUT /api/settings/password`
- `DELETE /api/settings/account`
- `GET/PUT /api/preferences`
- `POST /api/upload-avatar`

AI:

- `POST /api/ai-chat`
- `GET /api/recommendations`

Community:

- `GET/POST /api/community`
- `GET/DELETE /api/community/[postId]`
- `POST /api/community/[postId]/replies`
- `PUT /api/community/replies/[replyId]/upvote`
- `PUT /api/community/replies/[replyId]/best`

Tickets:

- `GET/POST /api/tickets`

Help:

- `GET /api/help`
- `GET/POST /api/admin/help`
- `PUT/DELETE /api/admin/help/[id]`

Admin:

- `GET /api/admin/stats`
- `GET /api/admin/users`
- `PUT/DELETE /api/admin/users/[id]`
- `GET /api/admin/entries`
- `DELETE /api/admin/entries/[id]`
- `GET /api/admin/comments`
- `DELETE /api/admin/comments/[id]`
- `GET /api/admin/tickets`
- `PUT /api/admin/tickets/[id]`
- `PUT /api/admin/settings/ai-limit`

Search:

- `GET /api/search`

---

## 8. Page Route Status

Public or guest-accessible:

- `/`
- `/login`
- `/help`
- `/profile/[username]`
- `/profile/[username]/folders/[folderId]`

Authenticated user pages:

- `/dashboard`
- `/search`
- `/folders`
- `/folders/[id]`
- `/calendar`
- `/settings`
- `/settings/appearance`
- `/followers`
- `/following`
- `/messages`
- `/messages/[userId]`
- `/notifications`
- `/tickets`
- `/community`
- `/community/[postId]`
- `/ai-chat`

Admin pages:

- `/admin`
- `/admin/users`
- `/admin/entries`
- `/admin/comments`
- `/admin/tickets`
- `/admin/help`

---

## 9. Required Production Environment Variables

Required:

```env
DATABASE_URL=
DIRECT_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
TMDB_API_KEY=
GOOGLE_BOOKS_API_KEY=
NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY=
GEMINI_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Notes:

- `.env.example` should be updated to include `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `TMDB_API_KEY`.
- `NEXTAUTH_URL` must match the deployed domain exactly.
- Google OAuth redirect URI must match the deployed NextAuth callback URL.
- Supabase Storage buckets required:
  - `avatars`
  - `community`
- Buckets should be public if the app stores public image URLs.
- Do not commit real secrets.

---

## 10. Deployment Checklist

Before staging:

- [ ] Run `npx prisma generate`.
- [ ] Run `npx prisma db push` or apply migrations to the production database.
- [ ] Confirm all environment variables are set on the hosting platform.
- [ ] Confirm Supabase Storage buckets exist.
- [ ] Confirm Google OAuth callback URL is configured.
- [ ] Confirm one admin user exists.
- [ ] Confirm `NEXTAUTH_URL` is the deployed URL.

Before production:

- [ ] Run the manual browser checklist in section 12.
- [ ] Test with at least two real users.
- [ ] Test one admin account.
- [ ] Test one Pro account.
- [ ] Test one free user.
- [ ] Upload avatar.
- [ ] Upload community images.
- [ ] Confirm Gemini AI chat and recommendations work.
- [ ] Confirm fallback recommendations work if Gemini is unavailable.

---

## 11. Known Non-Blocking Issues

No build-blocking issue is currently known.

Non-blocking polish items:

- Replace raw `<img>` usage with `next/image`.
- Remove unused `WatchHistoryItem` type in `watch-history-calendar.tsx`.
- Update `.env.example` with all production variables.
- Add automated Playwright tests.
- Review mobile spacing on every route after deployment.
- Review Supabase Storage policies for least privilege.
- Consider making `/help` dynamic if admin article edits must appear immediately without rebuild.

---

## 12. Manual Browser Smoke Test

Authentication:

- [ ] Register with email/password.
- [ ] Login with email/password.
- [ ] Login with Google.
- [ ] Banned user cannot continue using the app.

Diary:

- [ ] Add entry.
- [ ] Edit entry.
- [ ] Delete entry.
- [ ] Add decimal rating like `4.5`.
- [ ] Add a book and confirm `Reading` label appears.
- [ ] Search TMDB and add a result.
- [ ] Search Google Books and add a result.

Folders:

- [ ] Create public folder.
- [ ] Create private folder.
- [ ] Add an entry to a folder.
- [ ] Remove an entry from a folder.
- [ ] Confirm public folder appears on public profile.
- [ ] Confirm public folder opens for logged-out visitor.
- [ ] Confirm private folder does not open publicly.

Profile and settings:

- [ ] Update display name.
- [ ] Update username.
- [ ] Update bio.
- [ ] Update email.
- [ ] Change password for credential user.
- [ ] Upload avatar.
- [ ] Change layout/theme/accent color.
- [ ] Reorder profile blocks.
- [ ] Confirm public profile reflects preferences.

Social:

- [ ] Follow another user.
- [ ] Unfollow another user.
- [ ] Confirm follower notification appears.
- [ ] Confirm `/followers` and `/following`.
- [ ] Leave profile comment.
- [ ] Delete comment as profile owner.

Messages:

- [ ] Start DM from public profile.
- [ ] Send message.
- [ ] Confirm inbox preview.
- [ ] Confirm unread badge appears.
- [ ] Open thread and confirm unread badge clears.
- [ ] Click username/display name in thread and confirm profile opens.

Community:

- [ ] Create community post.
- [ ] Upload community images.
- [ ] Add YouTube/trailer link.
- [ ] Filter by category.
- [ ] Reply to post.
- [ ] Upvote reply.
- [ ] Mark best answer.
- [ ] Delete own post.

Calendar:

- [ ] Open `/calendar`.
- [ ] Select date.
- [ ] Log existing entry.
- [ ] Confirm day and month data refresh.

AI:

- [ ] Free user sees locked AI chat.
- [ ] Pro user can send AI chat message.
- [ ] Pro daily counter updates.
- [ ] Pro limit blocks after daily quota.
- [ ] Recommendations load for free user using fallback.
- [ ] Recommendations load for Pro/Admin using Gemini when available.
- [ ] Refresh recommendations.
- [ ] Add recommendation to diary.

Admin:

- [ ] Non-admin cannot access `/admin`.
- [ ] Admin can view stats.
- [ ] Admin can ban/unban user.
- [ ] Admin can promote/demote user.
- [ ] Admin can promote user to Pro.
- [ ] Admin can delete entry.
- [ ] Admin can delete comment.
- [ ] Admin can view tickets.
- [ ] Admin can update ticket status and reply.
- [ ] Admin can create/edit/delete help articles.

Help and support:

- [ ] Public `/help` opens without login.
- [ ] Help search works.
- [ ] Help accordion expands/collapses.
- [ ] User submits support ticket.
- [ ] User sees ticket status/admin reply.

UI shell:

- [ ] Desktop sidebar collapses by default.
- [ ] Desktop sidebar expands on hover.
- [ ] Mobile bottom nav works.
- [ ] Theme toggle works.
- [ ] No hydration error appears in browser console.

---

## 13. Final Assessment

Viremo is approximately **99% complete** as a product release candidate.

The code is build-clean and feature-complete enough for staging. My production recommendation is cautious but positive: deploy to staging, run the manual smoke test once, fix any environment-specific issues, then deploy production.

The biggest remaining gap is not feature work. It is confidence work: automated tests, final browser QA, and production environment verification.

*Report updated: June 6, 2026*
