# Copilot Instructions for Fresh (Hexa Shop)

## Project Overview

**Fresh** is a Next.js 16 full-stack e-commerce application (Hexa Shop) with Supabase authentication, built with TypeScript, React 19, Tailwind CSS, and Radix UI components. The app supports admin dashboards, customer authentication, and product/order management.

## Architecture Essentials

### Client/Server Boundary

- **Server Components** (`"use server"` or no directive): Use for data fetching, auth checks, server-side logic
- **Client Components** (`"use client"`): Use for interactivity, state, event handlers
- **Key Pattern**: Root layout (`app/layout.tsx`) is async server component that fetches initial user via `createClient()` from `lib/supabase/server.ts` and passes to `UserProvider`

### Supabase Integration

- **Server Client**: `lib/supabase/server.ts` - Use in Server Components and Route Handlers. Creates new instance each function call (important for Fluid compute)
- **Browser Client**: `lib/supabase/client.ts` - Use in Client Components with `"use client"` directive
- **Session Proxy**: `lib/supabase/proxy.ts` and `proxy.ts` - Middleware that refreshes sessions via `updateSession()` on every request
- **Auth Callback**: `app/auth/callback/route.ts` - Exchanges auth code for session after OAuth flows

### State Management & User Context

- **UserProvider** (`providers/user-provider.tsx`): React Context-based provider for user state
  - Subscribes to Supabase auth state changes automatically
  - Exposes `useUser()` hook and `refreshUser()` method for manual sync
  - Wrapped at root layout with `initialUser` from server-side fetch
  - Used for: checking logged-in user, triggering auth UI changes

### Authentication & Authorization

- **Login Flow**: `components/auth/login-form.tsx` - Email/password + Google OAuth via `GoogleAuthButton`
- **Role-Based Access**: Check admin status using `isAdmin(user)` from `lib/auth/roles.ts`
  - Reads from `user.app_metadata.role` or `user.user_metadata.role` (set in Supabase)
  - Admin layout at `app/admin/layout.tsx` requires admin role check before rendering

### UI Component Library

- **Radix UI + CVA**: All UI components in `components/ui/` use Radix primitives wrapped with CVA variants
- **Example**: `button.tsx` uses `cva()` to define variant/size props (default, destructive, outline, ghost, link, etc.)
- **Styling**: Tailwind CSS v4 with PostCSS (`postcss.config.mjs`), dark mode via `next-themes`
- **Icons**: Lucide React (`lucide-react` package)
- **Notifications**: Sonner toast component (`components/ui/sonner.tsx`)

## Project-Specific Conventions

### File Organization

- `app/` - Next.js App Router pages (route groups like `app/(root)/`, `app/admin/`, `app/auth/`)
- `components/` - Organized by feature: `admin/`, `auth/`, `home/`, `ui/`
- `lib/` - Utilities and SDK clients: `supabase/` (server/client/proxy), `auth/` (role checks)
- `providers/` - React Context providers (currently: UserProvider)
- `hooks/` - Custom React hooks (e.g., `use-mobile.ts`)

### Path Alias

- `@/*` maps to workspace root (configured in `tsconfig.json`)
- Always use `@/` imports: `import { Button } from "@/components/ui/button"`

### CSS & Theming

- Global styles in `app/globals.css`
- Tailwind CSS v4 (latest syntax)
- Dark mode: `next-themes` provider wraps app (see `app/layout.tsx`)
- Theme switcher: `components/ui/theme-switcher.tsx`

## Development Workflows

### Build & Run

```bash
pnpm dev      # Start dev server (localhost:3000)
pnpm build    # Build for production
pnpm start    # Run production build
pnpm lint     # Run ESLint (ESLint v9)
```

### Package Manager

- **pnpm** is the project package manager (see `pnpm-lock.yaml`)
- Use `pnpm add <package>` for dependencies, not `npm` or `yarn`

### Environment Setup

- Requires `.env.local` with Supabase credentials:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `NEXT_PUBLIC_BASE_URL` (for metadata)
- These are public (NEXT*PUBLIC*\*) since browser client needs them

## Critical Patterns to Follow

### Creating New Pages

1. Place in `app/` with appropriate route group (e.g., `app/(root)/products/page.tsx`)
2. Mark as `"use client"` only if interactivity needed
3. Import UI components from `@/components/ui/`
4. For data fetching: use server component with async/await

### Protected Pages (Admin)

1. Check auth in Server Component: `const { data: { user } } = await supabase.auth.getUser()`
2. Verify role: `if (!user || !isAdmin(user)) { redirect("/auth") }`
3. Admin layout provides sidebar via `AppSidebar` and breadcrumbs via `DynamicBreadcrumb`

### Form Components

1. Use `"use client"` directive (forms are interactive)
2. Get Supabase client: `const supabase = createClient()`
3. Handle loading/error states with local `useState`
4. Use Sonner toast for feedback: `import { toast } from "sonner"`
5. Use Next.js `useRouter()` for navigation, `useSearchParams()` for query params

### UI Component Usage

- Import from `@/components/ui/` and compose with Radix primitives
- Pass `className` for additional Tailwind overrides via `cn()` utility
- All components support dark mode via CSS custom properties

## Integration Points

### OAuth Redirect Flow

1. User clicks Google button → redirects to Supabase OAuth endpoint
2. Supabase redirects back to `app/auth/callback/route.ts?code=...`
3. Route handler exchanges code for session and redirects to final URL
4. Session proxy (`proxy.ts`) syncs cookies on every request

### Admin Routes

- Protected via layout checks (`app/admin/layout.tsx`)
- Sidebar navigation in `components/admin/sidebar/app-sidebar.tsx`
- Breadcrumb auto-generates from URL using `DynamicBreadcrumb` component

### Forms with Errors

- Forms redirect with `?redirect=<URL>` query param for post-auth flow
- Errors displayed via `useState` and Sonner toast or inline error messages
- See `components/auth/forgot-password-form.tsx` and `components/auth/update-password-form.tsx` for patterns

## Common Gotchas

- **Server Client Creation**: Always create new Supabase server client inside functions, never at module level
- **Session Sync**: Middleware proxy handles automatic session refresh—no manual intervention needed in most cases
- **User Context Hook**: Must be called from Client Components; throws error if called from Server Components
- **Route Groups**: `(root)` and `(auth)` are invisible in URL (they organize routes semantically)
- **Dark Mode**: Use `className` with Tailwind dark: prefix; theme provider handles logic

## Debugging Tips

1. **Auth Issues**: Check Supabase dashboard for user roles in user_metadata/app_metadata
2. **Session Problems**: Verify session proxy is running (middleware at `proxy.ts`)
3. **Build Errors**: Ensure all Server Components are properly marked; check TypeScript with `pnpm build`
4. **Component Not Found**: Verify import paths use `@/` alias and file exists
