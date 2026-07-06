# 🏠 Nameplate Zone

Premium custom acrylic nameplate e-commerce platform — customers browse ready designs, **design their own nameplate with a live preview**, and order with cash-on-delivery. Fully manageable from an admin dashboard.

Built as a **Turborepo monorepo**: Next.js 14 (TypeScript + Tailwind) frontend, Express + Prisma + PostgreSQL backend, Cloudinary for image hosting. See [ARCHITECTURE.md](ARCHITECTURE.md) for the full breakdown.

## ✨ Features

**Storefront**
- Home page with hero, categories, featured products, how-it-works
- Product catalog with category filter, search, sort & pagination
- Product details with image gallery, size-based pricing, discounts
- 🎨 **Design Studio** — live nameplate customizer (shape, size, plate/letter colors, borders, icons, up to 7 Bengali/English text lines with fonts & sizes), instant SVG preview, PNG download, save & add to cart
- Cart (persisted) → COD checkout (inside/outside Dhaka delivery) → order success
- Order tracking by order number + phone with status timeline
- Contact form; bilingual UI (English + বাংলা) throughout

**Admin panel** (`/admin`)
- JWT login, dashboard with revenue/order stats + 30-day chart
- Products CRUD (image upload via Cloudinary or manual URLs, sizes, features, featured/stock toggles)
- Categories CRUD, Orders management with status workflow, Custom design review, Message inbox

## 🚀 Getting started

**Prerequisites:** Node 18+, PostgreSQL running locally.

```bash
# 1. Install everything (root, uses npm workspaces)
npm install

# 2. Configure backend/.env  (DATABASE_URL, JWT_SECRET, CLOUDINARY_* keys)
#    Configure frontend/.env.local (NEXT_PUBLIC_API_URL, default http://localhost:5000)

# 3. Create & seed the database
npm run db:migrate
npm run db:seed

# 4. Run both apps together
npm run dev
```

| App      | URL                          |
|----------|------------------------------|
| Store    | http://localhost:3000        |
| Admin    | http://localhost:3000/admin  |
| API      | http://localhost:5000/api    |

**Seeded admin:** `admin@nameplatezone.com` / `admin123` *(change in production!)*

## 📸 Image uploads

Product image upload needs Cloudinary credentials in `backend/.env`
(`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — free at
[cloudinary.com](https://cloudinary.com)). Without them the admin panel still works: paste
image URLs or public paths (e.g. `/products/house-classic.svg`) manually.

## 🧰 Scripts (root)

| Script               | Description                          |
|----------------------|--------------------------------------|
| `npm run dev`        | Run frontend + backend (Turbo)       |
| `npm run build`      | Production build of both apps        |
| `npm run db:migrate` | Prisma migrate dev                   |
| `npm run db:seed`    | Seed demo data                       |
