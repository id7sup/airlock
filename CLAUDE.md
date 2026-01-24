# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Airlock is a secure file sharing platform built with Next.js 16, featuring authentication, folder management, analytics, and geographic tracking. The application allows users to upload files, organize them in folders, and share them securely with tokens, expiration dates, password protection, and view quotas.

## Common Commands

### Development
```bash
npm run dev          # Start development server on port 3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Deployment
```bash
./deploy.sh          # Full deployment script (git pull, build, PM2 restart)
./kill-port.sh       # Force kill processes on port 3000 (use if port is occupied)
pm2 logs airlock --lines 50    # View application logs
pm2 status airlock             # Check PM2 process status
pm2 restart airlock            # Restart the application
```

## Architecture Overview

### Tech Stack
- **Next.js 16** with App Router (Server Components by default)
- **React 19** and **TypeScript**
- **Firebase Admin** for Firestore database
- **Clerk** for authentication
- **Cloudflare R2** for file storage (via S3-compatible API)
- **Mapbox** for geographic visualization
- **PM2** for process management (production)

### Critical: Next.js 16 Authentication Pattern

**IMPORTANT:** Next.js 16+ uses `proxy.ts` instead of `middleware.ts` for authentication. The proxy file at [src/proxy.ts](src/proxy.ts) handles Clerk authentication and protects routes.

Public routes (no auth required):
- `/`, `/pricing`, `/security`, `/faq`, `/share/*`, `/api/public/*`
- SEO routes: `/sitemap.xml`, `/robots.txt`, `/manifest.json`

All other routes require authentication via Clerk.

### Directory Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── api/                 # API routes
│   │   ├── analytics/       # Analytics tracking endpoints
│   │   ├── public/          # Public APIs (share access)
│   │   └── share/           # Share link APIs
│   ├── dashboard/           # Protected dashboard pages
│   │   ├── folder/[id]/     # Folder view
│   │   ├── settings/        # User settings
│   │   └── sharing/         # Share management
│   └── share/[token]/       # Public share pages
├── components/
│   ├── dashboard/           # Dashboard UI components
│   └── shared/              # Reusable components
├── lib/
│   ├── actions/             # Server Actions (files, folders, sharing, notifications)
│   ├── firebase.ts          # Firebase Admin initialization
│   ├── geolocation.ts       # Geolocation utilities
│   └── seo.ts               # SEO metadata helpers
├── services/
│   ├── analytics.ts         # Analytics tracking
│   ├── sharing.ts           # Share link validation/creation
│   ├── storage.ts           # S3 operations
│   └── watermarking.ts      # File watermarking
└── proxy.ts                 # Clerk authentication proxy (Next.js 16+)
```

## Key Technical Patterns

### Server Components vs Client Components

**Default to Server Components** - Only use `"use client"` directive when necessary (state, events, browser APIs).

Server Components are preferred for:
- Data fetching from Firestore
- Server Actions
- SEO-critical pages

Client Components required for:
- Interactive UI (forms, buttons with state)
- Browser APIs (localStorage, window)
- Third-party libraries requiring browser context

### Firestore Timestamp Conversion

**CRITICAL:** Firestore Timestamps cannot be serialized to Client Components. Always convert them to ISO strings when passing data from Server to Client.

Pattern used throughout the codebase (see [src/services/sharing.ts:13-40](src/services/sharing.ts#L13-L40)):

```typescript
function convertFirestoreData(data: any): any {
  // Convert Firestore Timestamps to ISO strings
  if (val instanceof admin.firestore.Timestamp) {
    converted[key] = val.toDate().toISOString();
  }
  // Handle nested objects and arrays...
}
```

Apply this conversion in:
- Server Actions before returning data
- API routes before sending responses
- Any Server Component passing props to Client Components

### File Upload Flow

1. User requests upload → Server Action generates presigned R2 URL (S3-compatible)
2. Client uploads directly to R2 (bypass server bandwidth)
3. On success → Create Firestore entry with file metadata
4. File stored with key: `{workspaceId}/{folderId}/{fileId}-{filename}`

See [src/lib/actions/files.ts](src/lib/actions/files.ts) for implementation.

### Share Link System

Each share link is **independent** with its own:
- Unique token (64-char hex, hashed with SHA-256)
- Expiration date, password protection, view quota
- Analytics counters (viewCount, downloadCount)
- Permissions (allowDownload, allowViewOnline, allowFolderAccess)

A folder can have multiple active share links simultaneously. Modifying one link never affects others.

Key functions in [src/services/sharing.ts](src/services/sharing.ts):
- `createShareLink()` - Creates new share link with unique token
- `validateShareLink()` - Validates token and checks expiration/quota/revocation

Public share pages: [src/app/share/[token]/page.tsx](src/app/share/[token]/page.tsx)

## Firestore Collections

### `folders`
```typescript
{
  id: string
  name: string
  parentId: string | null  // null = root folder
  workspaceId: string
  isFavorite: boolean
  isDeleted: boolean       // Soft delete (trash)
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### `files`
```typescript
{
  id: string
  name: string
  size: number
  mimeType: string
  folderId: string
  workspaceId: string
  s3Key: string           // R2 object key (S3-compatible)
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### `shareLinks`
```typescript
{
  id: string
  token: string           // Plain token for dashboard display
  tokenHash: string       // SHA-256 hash for validation
  folderId: string
  creatorId: string
  expiresAt: Timestamp | null
  passwordHash: string | null
  maxViews: number | null
  viewCount: number
  downloadCount: number
  isRevoked: boolean
  allowDownload: boolean
  allowViewOnline: boolean
  allowFolderAccess: boolean
  restrictDomain: boolean
  blockVpn: boolean
  allowedDomains: string[]
  createdAt: Timestamp
}
```

### `permissions`
```typescript
{
  id: string
  folderId: string
  userId: string
  role: "OWNER" | "EDITOR" | "VIEWER"
  canDownload: boolean
  createdAt: Timestamp
}
```

## Development Workflow

### Making Changes

1. **Always use Server Actions for mutations** - Located in `src/lib/actions/`
2. **Validate permissions** - Check user has access to folder/file before operations
3. **Convert Firestore Timestamps** - Use `convertFirestoreData()` pattern
4. **Handle errors gracefully** - Try/catch blocks, return error objects instead of throwing
5. **Use path aliases** - Import with `@/` prefix (e.g., `@/lib/firebase`)

### Adding New API Routes

API routes in `src/app/api/` follow Next.js App Router conventions:
- Export `GET`, `POST`, `PUT`, `DELETE` functions
- Use `NextRequest` and `NextResponse`
- Public APIs go in `api/public/` (no auth required)
- Protected APIs require Clerk authentication check

### Environment Variables

Critical environment variables (see full list in README):
- `NEXT_PUBLIC_FIREBASE_*` - Firebase client config
- `FIREBASE_PRIVATE_KEY` - Firebase Admin service account key
- `CLERK_SECRET_KEY` - Clerk authentication
- `S3_*` - Cloudflare R2 credentials and bucket (S3-compatible API)
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` - Mapbox for globe visualization

### Security Considerations

1. **Never expose Firebase Admin credentials** - Only use in server-side code
2. **R2 presigned URLs** - Always generate time-limited URLs (default 3600s)
3. **Share link tokens** - Hash before storage/comparison (SHA-256)
4. **Input validation** - Validate all user inputs in Server Actions
5. **Permission checks** - Verify user has access before any operation

## Common Issues & Solutions

### Port 3000 Already in Use

Run `./kill-port.sh` to aggressively kill all processes on port 3000. This script handles PM2 processes, Node processes, and zombie processes.

### Firestore Timestamp Serialization Error

If you see errors about serializing Firestore Timestamps:
1. Check if data is being passed from Server to Client Component
2. Apply `convertFirestoreData()` to convert Timestamps to ISO strings
3. See [src/services/sharing.ts:13-40](src/services/sharing.ts#L13-L40) for reference implementation

### Share Link Not Working

Check in this order:
1. Token validation in [src/services/sharing.ts](src/services/sharing.ts)
2. Link expiration (expiresAt field)
3. View quota exceeded (viewCount >= maxViews)
4. Link revoked (isRevoked = true)
5. Folder deleted (isDeleted = true)

### Build Failures

Common causes:
- TypeScript errors - Check strict mode compliance
- Missing environment variables - Verify `.env.local` or `.env.production`
- Dependency issues - Run `npm ci` for clean install

## Deployment

The application is deployed using PM2 on a production server:

1. Code is in `/var/www/airlock`
2. Run `./deploy.sh` for automated deployment:
   - Git pull latest changes
   - Install dependencies (npm ci)
   - Build production bundle
   - Restart PM2 process
   - Verify deployment

PM2 process name: `airlock`
Production port: `3000` (reverse proxied via Nginx)

## Additional Resources

- [ARCHITECTURE.md](ARCHITECTURE.md) - Detailed architecture documentation
- [DEPLOY.md](DEPLOY.md) - Full deployment guide
- [README.md](README.md) - Project overview and setup
