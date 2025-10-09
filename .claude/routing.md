# TanStack Router Guide

## Overview

TanStack Router provides **file-based routing** with **full type safety**. Routes are automatically generated from files in `src/routes/`.

## How It Works

### 1. File Structure = Route Structure

```
src/routes/
├── __root.tsx          → Root layout (wraps all routes)
├── index.tsx           → / (home page)
├── about.tsx           → /about
├── posts/
│   ├── index.tsx       → /posts
│   └── $postId.tsx     → /posts/:postId (dynamic param)
└── dashboard/
    ├── _layout.tsx     → Layout for dashboard routes only
    └── settings.tsx    → /dashboard/settings
```

### 2. Route Generation

The **Vite plugin** (`@tanstack/router-plugin`) automatically:
1. Scans `src/routes/` for `.tsx` files
2. Generates `src/routeTree.gen.ts` with typed route tree
3. Updates on file changes (dev mode)

**IMPORTANT**: Never edit `routeTree.gen.ts` manually - it's auto-generated!

### 3. Route File Anatomy

Every route file exports a `Route` using `createFileRoute()`:

```tsx
import { createFileRoute } from "@tanstack/react-router";

function MyPage() {
  return <div>Page content</div>;
}

// MUST be named "Route" and exported
export const Route = createFileRoute("/my-page")({
  component: MyPage,
});
```

### 4. Root Layout (`__root.tsx`)

The root route wraps **all other routes**:

```tsx
import { createRootRoute } from "@tanstack/react-router";
import App from "@/App";

export const Route = createRootRoute({
  component: () => (
    <>
      <App />  {/* Contains <Outlet /> to render child routes */}
      <TanStackRouterDevtools />
    </>
  ),
});
```

**Current structure**:
- `__root.tsx` renders `<App />` (theme logic + header)
- `App.tsx` contains `<Outlet />` to render route content
- `index.tsx` is the home page (`/`)

### 5. Outlet Component

`<Outlet />` is where child routes render:

```tsx
// App.tsx (layout component)
function App() {
  return (
    <div className="app-layout">
      <header>Navigation here</header>
      <main>
        <Outlet />  {/* Child routes render here */}
      </main>
    </div>
  );
}
```

## Special File Names

| File | Purpose |
|------|---------|
| `__root.tsx` | Root layout (wraps everything) |
| `index.tsx` | Index route for that folder (`/` or `/folder`) |
| `$param.tsx` | Dynamic route parameter (e.g., `$postId.tsx` → `/posts/:postId`) |
| `_layout.tsx` | Layout route (groups routes without adding URL segment) |
| `route.tsx` | Alternative to `index.tsx` (same behavior) |

## Navigation

### Using Links

```tsx
import { Link } from "@tanstack/react-router";

<Link to="/about">About</Link>
<Link to="/posts/$postId" params={{ postId: "123" }}>Post 123</Link>
```

### Programmatic Navigation

```tsx
import { useNavigate } from "@tanstack/react-router";

function MyComponent() {
  const navigate = useNavigate();

  const goToAbout = () => {
    navigate({ to: "/about" });
  };
}
```

## Route Parameters

### Dynamic Routes

File: `src/routes/posts/$postId.tsx`

```tsx
import { createFileRoute } from "@tanstack/react-router";

function PostPage() {
  const { postId } = Route.useParams();  // Type-safe!
  return <div>Post ID: {postId}</div>;
}

export const Route = createFileRoute("/posts/$postId")({
  component: PostPage,
});
```

### Search Params (Query Strings)

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/search")({
  validateSearch: z.object({
    query: z.string().optional(),
    page: z.number().default(1),
  }),
  component: SearchPage,
});

function SearchPage() {
  const { query, page } = Route.useSearch();  // Type-safe!
}
```

## Data Loading

### Loader Pattern

```tsx
export const Route = createFileRoute("/posts/$postId")({
  loader: async ({ params }) => {
    const post = await fetchPost(params.postId);
    return { post };
  },
  component: PostPage,
});

function PostPage() {
  const { post } = Route.useLoaderData();  // Type-safe!
}
```

**With TanStack Query** (our setup):

```tsx
import { useSuspenseQuery } from "@tanstack/react-query";

function PostPage() {
  const { postId } = Route.useParams();
  const { data } = useSuspenseQuery({
    queryKey: ["post", postId],
    queryFn: () => fetchPost(postId),
  });
}
```

## Current Project Structure

```
src/
├── routes/
│   ├── __root.tsx       → Root layout (renders App + devtools)
│   └── index.tsx        → Home page with Whisper model UI
├── App.tsx              → Layout with theme switcher + <Outlet />
└── main.tsx             → RouterProvider setup
```

**How it renders**:
1. `main.tsx` → `<RouterProvider router={router} />`
2. Router loads `__root.tsx` → `<App />` + devtools
3. `App.tsx` renders header + `<Outlet />`
4. `<Outlet />` renders `index.tsx` content

## Adding New Routes

### Step 1: Create Route File

```bash
# Manual
touch src/routes/about.tsx
```

### Step 2: Define Route

```tsx
import { createFileRoute } from "@tanstack/react-router";

function AboutPage() {
  return <div>About page</div>;
}

export const Route = createFileRoute("/about")({
  component: AboutPage,
});
```

### Step 3: Navigate

Route is auto-available at `/about` (no imports needed!)

```tsx
<Link to="/about">About</Link>
```

## Type Safety

### Autocomplete Everywhere

```tsx
// ✅ TypeScript knows all routes
navigate({ to: "/posts" });  // Autocomplete!

// ✅ TypeScript knows params
navigate({ to: "/posts/$postId", params: { postId: "123" } });

// ✅ TypeScript validates search params
navigate({ to: "/search", search: { query: "test", page: 1 } });
```

### Route Typing

```tsx
// Get typed params/search in any component
import { getRouteApi } from "@tanstack/react-router";

const routeApi = getRouteApi("/posts/$postId");

function MyComponent() {
  const params = routeApi.useParams();  // { postId: string }
  const search = routeApi.useSearch();  // Type-safe search params
}
```

## Devtools

**Included in development builds only**:
- Shows route tree
- Displays active routes
- Inspects params/search/loader data
- Bottom-right corner (floating panel)

To hide: Remove `<TanStackRouterDevtools />` from `__root.tsx`

## Common Patterns

### Layout Routes

Share UI across multiple routes without adding URL segment:

```
src/routes/
└── dashboard/
    ├── _layout.tsx      → Layout for all dashboard routes
    ├── index.tsx        → /dashboard
    ├── settings.tsx     → /dashboard/settings
    └── profile.tsx      → /dashboard/profile
```

```tsx
// _layout.tsx
export const Route = createFileRoute("/dashboard/_layout")({
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <div className="dashboard">
      <aside>Sidebar</aside>
      <Outlet />  {/* Renders settings.tsx, profile.tsx, etc. */}
    </div>
  );
}
```

### Nested Routes

```
src/routes/
└── blog/
    ├── index.tsx        → /blog (list)
    ├── $slug.tsx        → /blog/my-post (detail)
    └── new.tsx          → /blog/new (create)
```

### Catch-All Routes

```tsx
// src/routes/$.tsx (404 page)
export const Route = createFileRoute("/$")({
  component: NotFoundPage,
});
```

## Best Practices

1. **Keep routes small**: Move logic to hooks/components
2. **Use loaders for data**: Prefetch before render
3. **Leverage type safety**: Use `Route.useParams()` not manual parsing
4. **Colocate route logic**: Keep route-specific code near route file
5. **Use layouts**: Share headers/sidebars with `<Outlet />`

## Troubleshooting

### Route not found
- Check file is in `src/routes/`
- Verify `export const Route = createFileRoute(...)`
- Restart dev server (plugin may need refresh)

### TypeScript errors
- Ensure `routeTree.gen.ts` exists (dev server generates it)
- Check `main.tsx` has `declare module "@tanstack/react-router"`
- Verify route path matches file structure

### Routes not updating
- Dev server auto-reloads, but may need manual refresh (Ctrl+R)
- Check Vite plugin is before `react()` in `vite.config.ts`

## Resources

- [TanStack Router Docs](https://tanstack.com/router)
- [File-Based Routing Guide](https://tanstack.com/router/latest/docs/framework/react/guide/file-based-routing)
- Context7: Use `resolve-library-id` with "tanstack router" for latest docs
