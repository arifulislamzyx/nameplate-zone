# 🚀 Vercel Deployment Guide — Nameplate Zone

এই মনোরেপো থেকে Vercel-এ **দুটো আলাদা প্রজেক্ট** ডিপ্লয় হবে: `backend` (API) আগে, তারপর `frontend`।

---

## ⚠️ আগে জানা জরুরি: Supabase কানেকশন

Supabase-এর ডাইরেক্ট হোস্ট (`db.qbdpgwzkhpwcornhuwxf.supabase.co:5432`) **IPv6-only** —
Vercel serverless থেকে এতে কানেক্ট হয় না। Vercel-এর জন্য **Session Pooler** URL লাগবে:

1. Supabase Dashboard → আপনার প্রজেক্ট → **Connect** (উপরের বাটন)
2. **Session pooler** ট্যাব থেকে URI কপি করুন — দেখতে এরকম:
   ```
   postgresql://postgres.qbdpgwzkhpwcornhuwxf:[PASSWORD]@aws-0-<region>.pooler.supabase.com:5432/postgres
   ```
3. পাসওয়ার্ডের স্পেশাল ক্যারেক্টার URL-encode করুন: `!` → `%21`, `@` → `%40`, `#` → `%23`
   (যেমন `Arif123454321!@#` → `Arif123454321%21%40%23`)

---

## ধাপ ১ — ডাটাবেস মাইগ্রেশন + সিড (একবারই, লোকাল থেকে)

`backend/.env`-এ প্রোডাকশন `DATABASE_URL` বসিয়ে:

```bash
cd backend
npx prisma migrate deploy   # টেবিল তৈরি
npx prisma db seed          # অ্যাডমিন + ক্যাটাগরি + প্রোডাক্ট
```

---

## ধাপ ২ — Backend ডিপ্লয়

1. [vercel.com/new](https://vercel.com/new) → GitHub repo import করুন
2. **Root Directory** = `backend` ← গুরুত্বপূর্ণ!
3. Framework Preset: **Other**
4. Environment Variables:

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | Session Pooler URL (উপরে দেখুন) |
   | `JWT_SECRET` | লম্বা র‍্যান্ডম স্ট্রিং |
   | `CLIENT_URL` | ফ্রন্টএন্ড URL (ধাপ ৩-এর পরে আপডেট করবেন), যেমন `https://nameplate-zone.vercel.app` |
   | `CLOUDINARY_CLOUD_NAME` | `djjuiseux` |
   | `CLOUDINARY_API_KEY` | `398819519112996` |
   | `CLOUDINARY_API_SECRET` | (আপনার সিক্রেট) |

5. Deploy → পেলে API URL যেমন `https://nameplate-zone-api.vercel.app`
6. টেস্ট: `https://<backend-url>/api/health` → `{"status":"ok"}`

> `backend/vercel.json` + `backend/api/index.ts` আগে থেকেই কনফিগার করা আছে —
> Express অ্যাপটা serverless function হিসেবে চলবে, `prisma generate` অটো হবে।

## ধাপ ৩ — Frontend ডিপ্লয়

1. আবার [vercel.com/new](https://vercel.com/new) → **একই repo** import
2. **Root Directory** = `frontend`
3. Framework Preset: **Next.js** (অটো ধরবে)
4. Environment Variable:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_API_URL` | ধাপ ২-এর backend URL (শেষে `/` ছাড়া) |

5. Deploy

## ধাপ ৪ — CORS আপডেট

Backend প্রজেক্টের `CLIENT_URL` env var-এ ফ্রন্টএন্ডের ফাইনাল URL বসিয়ে **Redeploy** করুন।
একাধিক origin লাগলে কমা দিয়ে দিন:
`https://nameplate-zone.vercel.app,https://www.nameplatezone.com`

---

## ✅ ডিপ্লয়-পরবর্তী চেকলিস্ট

- [ ] `/api/health` → ok
- [ ] হোম পেজে প্রোডাক্ট দেখা যাচ্ছে
- [ ] অ্যাডমিন লগইন → **সাথে সাথে পাসওয়ার্ড বদলান** (সিড করা `admin123` পাবলিক জানে)
- [ ] ডিজাইন স্টুডিও থেকে টেস্ট ডিজাইন সেভ
- [ ] টেস্ট অর্ডার → অ্যাডমিনে দেখা যাচ্ছে
- [ ] অ্যাডমিন থেকে ইমেজ আপলোড (Cloudinary)

## 🔒 সিকিউরিটি নোট

- `.env` ফাইল **কখনো git-এ কমিট করবেন না** (`.gitignore`-এ আছে)
- `JWT_SECRET` প্রোডাকশনে আলাদা ও লম্বা রাখুন
- Supabase পাসওয়ার্ডে `!@#` জাতীয় ক্যারেক্টার থাকায় URL-encoding ভুললে কানেকশন ভাঙবে
