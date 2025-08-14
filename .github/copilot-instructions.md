# Copilot Instructions

## Project Overview

This is a **React Router 7 + BetterAuth + Trigger.dev + Prisma** full-stack application for AI-powered image generation using OpenAI's DALL-E 3. Users authenticate, create prompts, generate images asynchronously via Trigger.dev tasks, and view results in a responsive gallery with a credit-based system.

## Architecture Patterns

### Core Stack

- **Frontend**: React Router 7 (SSR framework), TailwindCSS v4, TypeScript, React 19
- **Backend**: Prisma ORM + PostgreSQL, Trigger.dev v3 for async tasks
- **Authentication**: BetterAuth with Prisma adapter, session-based auth with 7-day expiry
- **Caching**: flat-cache for server-side response caching
- **Media**: Cloudinary for image uploads and storage (optional)
- **AI**: OpenAI GPT-4o for prompt enhancement, DALL-E 3 for image generation
- **UI**: Custom components with Lucide icons, responsive grid layouts, comprehensive dark mode

### Key Architectural Decisions

**Promise-based CRUD**: All model functions in `app/models/` return Prisma promises directly (no async/await) for cleaner composition.

**Singleton patterns**:

- `app/db.server.ts` - Prisma client with dev connection pooling prevention
- `app/cache.ts` - FlatCache instance with TTL and user-scoped keys
- `app/lib/auth.server.ts` - BetterAuth instance with Prisma adapter

**Layout-based authentication**: Uses React Router 7 layout routes for auth protection via `app/routes/authenticated.tsx`.

## File Structure Conventions

```
app/
├── lib/              # Shared utilities and singletons
│   ├── auth.server.ts    # BetterAuth server configuration
│   ├── auth.client.ts    # BetterAuth client configuration
│   └── session.server.ts # Authentication helpers (requireUser, getUser)
├── models/           # Prisma CRUD operations (user.server.ts, image.server.ts, etc.)
├── routes/           # React Router 7 pages and API endpoints
│   ├── authenticated.tsx # Layout route for protected pages
│   ├── sign-in.tsx      # Authentication routes (top-level)
│   ├── sign-up.tsx      # Authentication routes (top-level)
│   └── api/            # API routes (dalle.ts, auth.ts, completion.ts, cloudinary.ts)
├── components/       # Reusable UI components with dark mode support
├── validations/      # Zod schemas for input validation (auth.ts)
├── config/           # Configuration utilities (app.ts, env.ts)
├── constants/        # App constants (api.ts, defaults.ts, errors.ts, ui.ts)
├── cache.ts          # FlatCache singleton and utilities
├── db.server.ts      # Prisma client singleton
├── ai.ts             # OpenAI client singleton
├── utils.ts          # Shared utilities (seeds, helpers)
└── routes.ts         # Route configuration with layout patterns

trigger/
└── generateContent.ts # Trigger.dev task for OpenAI integration

prisma/
└── schema.prisma     # Database schema with User/Auth/Prompt/Image models
```

## Essential Workflows

### Development

```bash
npm run dev          # Start React Router dev server (port 5173)
npm run trigger:dev  # Start Trigger.dev dev server (separate terminal)
npm run typecheck    # TypeScript validation
```

### Database Operations

```bash
npx prisma migrate dev    # Apply schema changes in development
npx prisma studio        # Visual database browser
npx prisma generate      # Regenerate client after schema changes
```

## Critical Patterns

### 1. Authentication Integration

- **BetterAuth setup**: Server config in `app/lib/auth.server.ts` with Prisma adapter and email/password auth
- **Session management**: 7-day expiry with 1-day update age, automatic redirect handling
- **Layout-based protection**: `app/routes/authenticated.tsx` layout protects all nested routes
- **Helper functions**: `requireUser()`, `getUser()`, `requireAnonymous()` in `session.server.ts`
- **Route structure**: Top-level `/sign-in` and `/sign-up` routes, protected routes under layout

### 2. Trigger.dev Integration

- Tasks defined in `trigger/` directory, imported as types in API routes
- Use `tasks.trigger<typeof taskFunction>()` pattern for type safety
- Real-time status via `useRealtimeRun()` hook with runId and accessToken
- Automatic image persistence: tasks save to database, not just return data

### 3. Credit System

- Pre-generation validation in `app/routes/api/dalle.ts`
- Atomic credit deduction before task trigger
- Models enforce minimum 0 credits with clamping

### 4. Caching Strategy

- Server-side caching in loaders using flat-cache
- Cache invalidation on data mutations (new images clear library cache)
- User-scoped cache keys: `library:${userId}`

### 5. Component Patterns

- **Unique fetcher keys**: Use `useId()` for multiple instances of same component
- **Promise-based models**: Chain Prisma operations without async/await
- **Server/client separation**: `.server.ts` files never imported client-side

### 6. UI State Management

- Real-time updates via Trigger.dev hooks, not polling
- Optimistic UI states during async operations
- Error surfacing through fetcher error objects

### 7. Input Validation

- **Zod schemas**: Centralized validation in `app/validations/` directory
- **Type-safe parsing**: Use schema validation before database operations
- **Form data handling**: Prefer schema validation over manual type coercion
- **Error formatting**: Consistent error responses across API routes

### 8. Media Upload Integration

- **Cloudinary API**: `/api/cloudinary` endpoint for image uploads
- **File handling**: Convert to base64 for cloud upload
- **Response format**: Structured response with URL, metadata, and error handling
- **Optional feature**: Gracefully handle missing Cloudinary credentials

## Data Flow Example

1. User submits prompt in `PromptCard` component
2. `useFetcher` posts to `/api/dalle` route
3. Route validates credits, deducts 1 credit, invalidates cache
4. Trigger.dev task `generate-content` runs asynchronously
5. Task calls OpenAI APIs, saves image to database
6. `useRealtimeRun` hook updates UI with progress/results
7. Library page shows cached results (5min TTL)

## Database Schema Notes

- **User**: credits field with default 10, relationships to prompts/images
- **Authentication tables**: Account, Session, Verification models for BetterAuth
- **Prompt**: reusable theme/description pairs for generation
- **Image**: stores both URL and base64, linked to prompts and runs
- **Cascading deletes**: User deletion removes all associated data

## Environment Requirements

Required variables:

- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API access
- `TRIGGER_SECRET_KEY` - Trigger.dev authentication

Optional integrations:

- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - For media uploads

## Common Gotchas

- Always use absolute file paths in tool calls
- Cache invalidation must happen before async operations
- Fetcher keys must be unique per component instance
- Database models expect userId parameter for data isolation
- Trigger.dev tasks require separate dev server running
