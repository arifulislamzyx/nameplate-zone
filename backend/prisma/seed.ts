import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ---- Admin ----
  const password = await bcrypt.hash("admin123", 10);
  await prisma.admin.upsert({
    where: { email: "admin@nameplatezone.com" },
    update: {},
    create: {
      name: "Nameplate Zone Admin",
      email: "admin@nameplatezone.com",
      password,
    },
  });

  // ---- Categories ----
  const categoriesData = [
    {
      name: "House Nameplates",
      nameBn: "বাড়ির নেমপ্লেট",
      slug: "house-nameplates",
      description: "Premium acrylic house nameplates with golden mirror lettering",
      image: "/products/house-classic.svg",
    },
    {
      name: "Islamic Calligraphy Plates",
      nameBn: "ইসলামিক ক্যালিগ্রাফি প্লেট",
      slug: "islamic-calligraphy",
      description: "Nameplates with Ayatul Kursi, Bismillah and duas in golden calligraphy",
      image: "/products/islamic-ayat.svg",
    },
    {
      name: "Round Logo Plates",
      nameBn: "গোল লোগো প্লেট",
      slug: "round-logo-plates",
      description: "Round signature plates for brands, boutiques and businesses",
      image: "/products/round-boutique.svg",
    },
    {
      name: "Office & Shop Signs",
      nameBn: "অফিস ও দোকানের সাইন",
      slug: "office-shop-signs",
      description: "Professional signage for offices, shops and institutions",
      image: "/products/office-sign.svg",
    },
  ];

  const categories: Record<string, string> = {};
  for (const c of categoriesData) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
    categories[c.slug] = cat.id;
  }

  // ---- Products ----
  const productsData = [
    {
      name: "Classic Golden Villa Nameplate",
      nameBn: "ক্লাসিক গোল্ডেন ভিলা নেমপ্লেট",
      slug: "classic-golden-villa-nameplate",
      description:
        "Premium black acrylic base with golden mirror acrylic lettering. Features an elegant house icon, ornamental corners and full Bengali/English text support. Weather-resistant and perfect for villa entrances.",
      descriptionBn:
        "প্রিমিয়াম ব্ল্যাক এক্রেলিক বেসের উপর গোল্ডেন মিরর এক্রেলিক লেটারিং। বাড়ির আইকন, কর্নার অর্নামেন্ট সহ বাংলা/ইংরেজি লেখার সুবিধা।",
      price: 2500,
      discountPrice: 2200,
      images: ["/products/house-classic.svg"],
      material: "Black Acrylic + Golden Mirror",
      shape: "RECTANGLE",
      sizes: [
        { label: "12 x 18 inch", price: 2200 },
        { label: "15 x 22 inch", price: 3000 },
        { label: "18 x 26 inch", price: 3800 },
      ],
      features: [
        "Weather-proof premium acrylic",
        "Golden mirror 3D lettering",
        "Bengali & English text support",
        "Free drill holes & fittings",
        "Custom house icon included",
      ],
      featured: true,
      categorySlug: "house-nameplates",
    },
    {
      name: "Ayatul Kursi Calligraphy Nameplate",
      nameBn: "আয়াতুল কুরসি ক্যালিগ্রাফি নেমপ্লেট",
      slug: "ayatul-kursi-calligraphy-nameplate",
      description:
        "Elegant nameplate featuring round Ayatul Kursi calligraphy in golden mirror acrylic, with holding number, ward and full address lines. Includes dua for entering the home.",
      descriptionBn:
        "গোল্ডেন মিরর এক্রেলিকে গোলাকার আয়াতুল কুরসি ক্যালিগ্রাফি সহ নেমপ্লেট। হোল্ডিং নম্বর, ওয়ার্ড ও সম্পূর্ণ ঠিকানা লেখা যাবে।",
      price: 3500,
      discountPrice: 3200,
      images: ["/products/islamic-ayat.svg"],
      material: "Black Acrylic + Golden Mirror",
      shape: "RECTANGLE",
      sizes: [
        { label: "15 x 22 inch", price: 3200 },
        { label: "18 x 26 inch", price: 4000 },
        { label: "20 x 30 inch", price: 5000 },
      ],
      features: [
        "Laser-cut Ayatul Kursi calligraphy",
        "Golden ornamental border",
        "Dua for entering home included",
        "Full address customization",
      ],
      featured: true,
      categorySlug: "islamic-calligraphy",
    },
    {
      name: "Round Boutique Logo Plate",
      nameBn: "গোল বুটিক লোগো প্লেট",
      slug: "round-boutique-logo-plate",
      description:
        "Stylish round signage plate with custom monogram and brand name in golden mirror acrylic. Perfect for boutiques, salons and online brands' physical stores.",
      descriptionBn:
        "কাস্টম মনোগ্রাম ও ব্র্যান্ড নাম সহ স্টাইলিশ গোলাকার সাইন প্লেট। বুটিক, স্যালন ও ব্র্যান্ড শপের জন্য পারফেক্ট।",
      price: 2800,
      discountPrice: null,
      images: ["/products/round-boutique.svg"],
      material: "Black Acrylic + Golden Mirror",
      shape: "ROUND",
      sizes: [
        { label: "18 inch diameter", price: 2800 },
        { label: "24 inch diameter", price: 3600 },
      ],
      features: [
        "Custom monogram design",
        "Golden ring border",
        "Script + serif typography",
        "Indoor & outdoor use",
      ],
      featured: true,
      categorySlug: "round-logo-plates",
    },
    {
      name: "Mansion Wide Nameplate",
      nameBn: "ম্যানশন ওয়াইড নেমপ্লেট",
      slug: "mansion-wide-nameplate",
      description:
        "Extra-wide landscape nameplate with golden frame border, large Bengali villa name and up to six lines of family/address details. A statement piece for duplex homes and mansions.",
      descriptionBn:
        "গোল্ডেন ফ্রেম বর্ডার সহ চওড়া নেমপ্লেট। বড় বাংলা নাম এবং ৬ লাইন পর্যন্ত পরিবারের/ঠিকানার তথ্য।",
      price: 4500,
      discountPrice: 4000,
      images: ["/products/mansion-wide.svg"],
      material: "Black Acrylic + Golden Mirror",
      shape: "WIDE",
      sizes: [
        { label: "18 x 36 inch", price: 4000 },
        { label: "22 x 44 inch", price: 5500 },
      ],
      features: [
        "Full golden frame border",
        "Up to 6 lines of text",
        "Bismillah header included",
        "Premium corner ornaments",
      ],
      featured: true,
      categorySlug: "house-nameplates",
    },
    {
      name: "Bismillah House Nameplate",
      nameBn: "বিসমিল্লাহ হাউস নেমপ্লেট",
      slug: "bismillah-house-nameplate",
      description:
        "Compact house nameplate with Bismillahir Rahmanir Rahim header, owner name and address in shining golden acrylic on jet black base.",
      descriptionBn:
        "বিসমিল্লাহির রাহমানির রাহিম হেডার সহ কমপ্যাক্ট নেমপ্লেট। মালিকের নাম ও ঠিকানা গোল্ডেন এক্রেলিকে।",
      price: 1800,
      discountPrice: 1600,
      images: ["/products/bismillah-compact.svg"],
      material: "Black Acrylic + Golden Mirror",
      shape: "RECTANGLE",
      sizes: [
        { label: "10 x 14 inch", price: 1600 },
        { label: "12 x 18 inch", price: 2000 },
      ],
      features: ["Bismillah calligraphy header", "Budget friendly", "Quick 3-day delivery"],
      featured: false,
      categorySlug: "islamic-calligraphy",
    },
    {
      name: "Office Door Sign Plate",
      nameBn: "অফিস ডোর সাইন প্লেট",
      slug: "office-door-sign-plate",
      description:
        "Professional office door sign with designation, name and room number. Clean modern typography in golden acrylic on matte black base.",
      descriptionBn:
        "পদবি, নাম ও রুম নম্বর সহ প্রফেশনাল অফিস ডোর সাইন। ম্যাট ব্ল্যাক বেসে গোল্ডেন টাইপোগ্রাফি।",
      price: 1200,
      discountPrice: null,
      images: ["/products/office-sign.svg"],
      material: "Matte Black Acrylic + Golden Mirror",
      shape: "RECTANGLE",
      sizes: [
        { label: "6 x 12 inch", price: 1200 },
        { label: "8 x 16 inch", price: 1600 },
      ],
      features: ["Modern minimal design", "Double-sided tape mounting", "Designation + name + room no"],
      featured: false,
      categorySlug: "office-shop-signs",
    },
    {
      name: "Shop Signboard Premium",
      nameBn: "শপ সাইনবোর্ড প্রিমিয়াম",
      slug: "shop-signboard-premium",
      description:
        "Large-format premium shop signboard with brand name, tagline and contact number. Golden mirror acrylic letters with optional LED backlight preparation.",
      descriptionBn:
        "ব্র্যান্ড নাম, ট্যাগলাইন ও যোগাযোগ নম্বর সহ বড় সাইজের প্রিমিয়াম শপ সাইনবোর্ড। LED ব্যাকলাইট প্রস্তুতি ঐচ্ছিক।",
      price: 6500,
      discountPrice: 6000,
      images: ["/products/shop-signboard.svg"],
      material: "Black Acrylic + Golden Mirror",
      shape: "WIDE",
      sizes: [
        { label: "24 x 48 inch", price: 6000 },
        { label: "30 x 60 inch", price: 8500 },
      ],
      features: ["LED backlight ready", "Large format lettering", "Weather sealed edges"],
      featured: false,
      categorySlug: "office-shop-signs",
    },
    {
      name: "Duplex Twin Name Villa Plate",
      nameBn: "ডুপ্লেক্স টুইন নেম ভিলা প্লেট",
      slug: "duplex-twin-name-villa-plate",
      description:
        "Designed for joint-family homes — two owner names with shared villa title, holding number, ward and area details, plus dua lines at the bottom.",
      descriptionBn:
        "যৌথ পরিবারের জন্য — দুইজন মালিকের নাম, ভিলার নাম, হোল্ডিং নম্বর, ওয়ার্ড ও এলাকার তথ্য এবং নিচে দোয়ার লাইন।",
      price: 3800,
      discountPrice: 3500,
      images: ["/products/duplex-twin.svg"],
      material: "Black Acrylic + Golden Mirror",
      shape: "RECTANGLE",
      sizes: [
        { label: "16 x 24 inch", price: 3500 },
        { label: "20 x 30 inch", price: 4500 },
      ],
      features: ["Two owner names", "Dua lines included", "Ornamental frame"],
      featured: false,
      categorySlug: "house-nameplates",
    },
    {
      name: "Round Cafe & Restaurant Plate",
      nameBn: "গোল ক্যাফে ও রেস্টুরেন্ট প্লেট",
      slug: "round-cafe-restaurant-plate",
      description:
        "Eye-catching round plate for cafes and restaurants with custom logo, established year and script typography in golden mirror acrylic.",
      descriptionBn:
        "ক্যাফে ও রেস্টুরেন্টের জন্য আকর্ষণীয় গোল প্লেট — কাস্টম লোগো, প্রতিষ্ঠার সাল ও স্ক্রিপ্ট টাইপোগ্রাফি।",
      price: 3200,
      discountPrice: null,
      images: ["/products/round-cafe.svg"],
      material: "Black Acrylic + Golden Mirror",
      shape: "ROUND",
      sizes: [
        { label: "20 inch diameter", price: 3200 },
        { label: "26 inch diameter", price: 4200 },
      ],
      features: ["Custom logo engraving", "Established year badge", "Premium script fonts"],
      featured: false,
      categorySlug: "round-logo-plates",
    },
  ];

  for (const p of productsData) {
    const { categorySlug, ...rest } = p;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { ...rest, categoryId: categories[categorySlug] },
      create: { ...rest, categoryId: categories[categorySlug] },
    });
  }

  console.log("✅ Seed complete: 1 admin, 4 categories, 9 products");
  console.log("   Admin login → admin@nameplatezone.com / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
