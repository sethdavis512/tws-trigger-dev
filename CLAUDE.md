# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
```bash
npm run dev          # Start React Router dev server (port 5173)
npm run trigger:dev  # Start Trigger.dev dev server (separate terminal required)
npm run typecheck    # TypeScript validation - run before commits
npm run build        # Production build
```

### Database Operations
```bash
npx prisma migrate dev       # Apply schema changes in development
npx prisma generate         # Regenerate client after schema changes
npx prisma studio          # Visual database browser
npx prisma migrate dev --name [name]  # Create named migration
```

### Testing and Validation
Always run `npm run typecheck` before making commits to ensure TypeScript compliance.

## Architecture Overview

This is a **React Router 7 + BetterAuth + Trigger.dev + Prisma** full-stack AI image generation platform using OpenAI's DALL-E 3. Key architectural decisions:

### Core Technology Stack
- **Frontend**: React Router 7 (SSR), TailwindCSS v4, TypeScript, React 19
- **Backend**: Prisma ORM + PostgreSQL, BetterAuth session management
- **Async Processing**: Trigger.dev v3 for background image generation tasks
- **AI**: OpenAI GPT-4o + DALL-E 3 integration
- **Billing**: Polar.sh integration for credit purchases and subscriptions

### Critical Patterns

#### 1. Singleton Architecture
Key singletons that must be imported correctly:
- `app/db.server.ts` - Prisma client with dev connection pooling prevention
- `app/cache.ts` - FlatCache instance with TTL and user-scoped keys
- `app/lib/auth.server.ts` - BetterAuth instance with Prisma adapter
- `app/ai.ts` - OpenAI client singleton

#### 2. Authentication Flow
- **Layout-based protection**: `app/routes/authenticated.tsx` protects all nested routes
- **Helper functions**: `requireUser()`, `getUser()`, `requireAnonymous()` in `session.server.ts`
- **Session config**: 7-day expiry with 1-day update age
- **Error handling**: Non-throwing mode with graceful degradation

#### 3. Trigger.dev Integration Pattern
```typescript
// In API routes
const result = await tasks.trigger<typeof generateContent>(
    "generate-content",
    { payload }
);

// Real-time updates in components
const { run } = useRealtimeRun(runId, { accessToken });
```
Tasks are defined in `trigger/` directory and save results directly to database.

#### 4. Credit System & Validation Sequencing
**Critical**: Always validate in this order for optimal UX:
1. **Credits first** - Users see "insufficient credits" rather than confusing rate limit messages
2. **Rate limits second** - Secondary protection
3. **General validation third** - Tertiary checks

Credit validation happens in `app/routes/api/dalle.ts` before task triggering.

#### 5. Error Display Patterns
- **Top-level banner alerts**: Error messages appear as banners at page top, not inline
- **Categorized styling**: Credit errors (blue), rate limiting (amber), general errors (red)
- **Actionable messaging**: Include support contact with pre-filled emails
- **Graceful degradation**: Authentication failures redirect to sign-in with context

### File Structure Conventions

```
app/
├── constants/          # Centralized app constants (errors, api, ui, defaults)
├── lib/               # Shared utilities and singletons
│   ├── auth.server.ts     # BetterAuth configuration with Polar integration
│   ├── auth.client.ts     # Client-side auth utilities
│   └── session.server.ts  # Auth helpers (requireUser, getUser)
├── models/            # Prisma CRUD operations (promise-based, no async/await)
├── validations/       # Zod schemas for input validation
├── components/        # Reusable UI components with dark mode support
├── routes/            # React Router 7 pages and API endpoints
│   ├── authenticated.tsx  # Layout route for protected pages
│   └── api/              # API routes (dalle.ts, auth.ts, completion.ts)
├── cache.ts           # FlatCache singleton
├── db.server.ts       # Prisma client singleton  
├── ai.ts              # OpenAI client singleton
└── utils.ts           # Shared utilities

trigger/
└── generateContent.ts  # Async image generation task

prisma/
└── schema.prisma      # Database schema with Polar billing integration
```

### Database Schema Key Points

- **User model**: Includes Polar billing fields (`polarCustomerId`, `subscriptionTier`, etc.)
- **Credit system**: Default 10 credits, monthly credit tracking for subscriptions
- **BetterAuth tables**: Account, Session, Verification models
- **Image persistence**: Both URL and base64 storage, linked to generation runs
- **Cascading deletes**: User deletion removes all associated data

### UI Design Patterns

#### Compact UI Philosophy
- **Minimal spacing**: `gap-1`, `space-y-1`, `px-2`, `py-1`
- **Consistent heights**: `h-9` for inputs and buttons
- **Small typography**: `text-xs` for labels and compact content
- **Grid layouts**: `grid grid-cols-1 md:grid-cols-5 gap-1` for responsive forms

#### Component Standards
```tsx
// Label pattern
<label className="block text-xs font-medium text-emerald-800 dark:text-emerald-200">

// Input pattern  
<input className="w-full h-9 rounded border border-emerald-300 dark:border-emerald-600 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500" />

// Button pattern
<button className="w-full h-9 inline-flex items-center justify-center gap-1.5 rounded border text-xs font-medium" />
```

### Environment Variables

**Required**:
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API access
- `TRIGGER_SECRET_KEY` - Trigger.dev authentication
- `POLAR_ACCESS_TOKEN` - Polar.sh API access
- `POLAR_WEBHOOK_SECRET` - Polar webhook validation
- `BETTER_AUTH_SECRET` - BetterAuth session encryption

**Optional**:
- `POLAR_SERVER` - "sandbox" or "production" (defaults to sandbox)
- `CLOUDINARY_*` - For optional media upload integration

### Data Flow Example

1. User submits prompt in `PromptCard` component
2. `useFetcher` posts to `/api/dalle` route
3. Route validates credits FIRST, then rate limits (proper UX sequencing)
4. Credits deducted atomically, cache invalidated
5. Trigger.dev task `generate-content` runs asynchronously
6. Task calls OpenAI APIs, saves image to database
7. `useRealtimeRun` hook updates UI with progress/results
8. Library page shows cached results (5min TTL)

### Common Gotchas

- **Promise-based models**: All functions in `app/models/` return Prisma promises directly (no async/await)
- **Cache invalidation**: Must happen before async operations
- **Fetcher keys**: Must be unique per component instance using `useId()`
- **Server/client separation**: `.server.ts` files never imported client-side
- **Trigger.dev**: Requires separate dev server running for background tasks
- **Credit validation sequencing**: Always check credits before rate limits for better UX
- **Error display**: Use top-level banners, not inline form errors

### Polar Billing Integration

The app integrates with Polar.sh for credit purchases and subscription billing:
- **Products**: Defined in `auth.server.ts` with IDs like `prod_starter_50`
- **Webhooks**: Automatically handled by Polar BetterAuth plugin
- **Usage tracking**: Monthly credit limits based on subscription tier
- **Customer portal**: Available at `/billing/portal` for subscription management

When working with billing features, always test with Polar's sandbox environment first.