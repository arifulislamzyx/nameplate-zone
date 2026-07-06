export interface Category {
  id: string;
  name: string;
  nameBn?: string | null;
  slug: string;
  description?: string | null;
  image?: string | null;
  _count?: { products: number };
}

export interface ProductSize {
  label: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  nameBn?: string | null;
  slug: string;
  description: string;
  descriptionBn?: string | null;
  price: number;
  discountPrice?: number | null;
  images: string[];
  material: string;
  shape: string;
  sizes: ProductSize[];
  features: string[];
  featured: boolean;
  inStock: boolean;
  categoryId: string;
  category?: { name: string; nameBn?: string | null; slug: string };
  createdAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PRODUCTION"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItem {
  id: string;
  productId?: string | null;
  designId?: string | null;
  name: string;
  price: number;
  quantity: number;
  size?: string | null;
  customization?: unknown;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email?: string | null;
  address: string;
  city: string;
  note?: string | null;
  status: OrderStatus;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  items: OrderItem[];
  createdAt: string;
}

export type DesignStatus = "DRAFT" | "SUBMITTED" | "REVIEWED" | "ORDERED";

export interface TextLine {
  id: string;
  text: string;
  font: string;
  size: number; // relative scale 1-10
  bold: boolean;
}

export interface DesignConfig {
  shape: "rectangle" | "wide" | "round";
  sizeLabel: string;
  bgColor: string;
  textColor: string;
  border: "none" | "frame" | "corners" | "double";
  icon: "none" | "house" | "bismillah" | "mosque" | "flower";
  lines: TextLine[];
}

export interface CustomDesign {
  id: string;
  title: string;
  config: DesignConfig;
  previewImage?: string | null;
  customerName?: string | null;
  phone?: string | null;
  status: DesignStatus;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  subject?: string | null;
  message: string;
  read: boolean;
  createdAt: string;
}
