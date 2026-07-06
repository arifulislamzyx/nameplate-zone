# Nameplate Zone — Architecture

Full-stack custom nameplate e-commerce platform, structured as a **Turborepo monorepo** (npm workspaces).

```
House Nameplate Final/
├── package.json          # Root — npm workspaces + turbo scripts
├── turbo.json            # Turborepo task pipeline (dev / build / start / lint)
├── ARCHITECTURE.md       # This file
│
├── backend/              # Express + TypeScript REST API  (port 5000)
│   ├── prisma/
│   │   ├── schema.prisma # PostgreSQL models (Prisma ORM)
│   │   └── seed.ts       # Seed: admin + categories + products
│   └── src/
│       ├── index.ts      # Express app entry, route mounting, CORS
│       ├── lib/
│       │   ├── prisma.ts     # PrismaClient singleton
│       │   └── cloudinary.ts # Cloudinary upload helpers
│       ├── middleware/
│       │   ├── auth.ts          # JWT admin guard (Bearer token)
│       │   └── errorHandler.ts  # Central error + Zod validation handler
│       └── routes/
│           ├── auth.routes.ts     # POST /api/auth/login, GET /api/auth/me
│           ├── category.routes.ts # /api/categories CRUD
│           ├── product.routes.ts  # /api/products CRUD + filters/pagination
│           ├── order.routes.ts    # /api/orders place/track/manage
│           ├── design.routes.ts   # /api/designs (customizer designs)
│           ├── upload.routes.ts   # /api/uploads → Cloudinary (multipart)
│           ├── contact.routes.ts  # /api/contact messages
│           └── stats.routes.ts    # /api/stats (admin dashboard)
│
└── frontend/             # Next.js 14 App Router + TypeScript + Tailwind (port 3000)
    ├── public/products/  # Placeholder nameplate SVGs
    └── src/
        ├── lib/          # api.ts (fetch wrappers), types.ts, format.ts
        ├── store/cart.ts # Zustand persisted cart store
        ├── components/   # Navbar, Footer, Logo, ProductCard, filters,
        │   ├── customizer/  # Design Studio (live SVG preview engine)
        │   └── admin/       # Admin panel building blocks
        └── app/
            ├── layout.tsx       # Fonts (Poppins/Playfair/Hind Siliguri/Great Vibes)
            ├── (site)/          # Public storefront (Navbar + Footer shell)
            │   ├── page.tsx             # Home (hero, categories, featured…)
            │   ├── products/            # Listing + [slug] details
            │   ├── customize/           # Live nameplate Design Studio
            │   ├── cart/  checkout/     # Cart → COD checkout → success
            │   ├── track-order/         # Order tracking timeline
            │   └── contact/             # Contact form
            └── admin/
                ├── login/               # JWT login
                └── (panel)/             # Guarded shell: sidebar + topbar
                    ├── dashboard/       # Stats, charts, recent activity
                    ├── products/  categories/
                    ├── orders/    designs/   messages/
```

## Data flow

```
Browser ──► Next.js (SSR + client components)
                │  fetch (JSON, JWT for admin)
                ▼
        Express REST API (:5000)
                │  Prisma ORM
                ▼
          PostgreSQL (nameplate_zone)
                │
        Cloudinary ◄── image uploads / design previews
```

## Key models (PostgreSQL via Prisma)

| Model          | Purpose                                                       |
|----------------|---------------------------------------------------------------|
| Admin          | Dashboard users (bcrypt password, JWT auth)                   |
| Category       | Product grouping (slug-based)                                 |
| Product        | Catalog items — prices, sizes JSON, images[], features[]      |
| Order + OrderItem | COD orders; items may reference a Product or a CustomDesign |
| CustomDesign   | Design Studio output — full config JSON + preview image       |
| ContactMessage | Contact form inbox                                            |

## Customizer design config (stored as JSON)

```ts
{ shape: "rectangle"|"wide"|"round", sizeLabel, bgColor, textColor,
  border: "none"|"frame"|"corners"|"double",
  icon: "none"|"house"|"bismillah"|"mosque"|"flower",
  lines: [{ id, text, font, size(1-10), bold }] }
```

The studio renders this config to SVG live in the browser, serializes it to a PNG
data-URI on save, POSTs it to `/api/designs`, and the design can be added to the
cart / ordered. Admin sees the same preview in the dashboard.

## Commands (run at repo root)

| Command              | What it does                                  |
|----------------------|-----------------------------------------------|
| `npm run dev`        | Turbo: backend (:5000) + frontend (:3000) together |
| `npm run build`      | Production build of both apps                 |
| `npm run db:migrate` | Prisma migration (backend)                    |
| `npm run db:seed`    | Seed admin/categories/products                |

## Environment

- `backend/.env` — DATABASE_URL, PORT, JWT_SECRET, CLIENT_URL, CLOUDINARY_* keys
- `frontend/.env.local` — NEXT_PUBLIC_API_URL (default http://localhost:5000)

Seeded admin: `admin@nameplatezone.com` / `admin123`
