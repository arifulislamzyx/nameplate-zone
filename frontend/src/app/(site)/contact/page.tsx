"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  CheckCircle,
  Clock,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { apiFetch } from "@/lib/api";

const CONTACT_INFO: {
  icon: LucideIcon;
  title: string;
  titleBn: string;
  value: string;
  valueBengali?: boolean;
}[] = [
  {
    icon: Phone,
    title: "Phone",
    titleBn: "ফোন",
    value: "+880 1XXX-XXXXXX",
  },
  {
    icon: Mail,
    title: "Email",
    titleBn: "ইমেইল",
    value: "hello@nameplatezone.com",
  },
  {
    icon: MapPin,
    title: "Address",
    titleBn: "ঠিকানা",
    value: "Dhaka, Bangladesh",
  },
  {
    icon: Clock,
    title: "Business Hours",
    titleBn: "কার্যসময়",
    value: "শনি–বৃহস্পতি, সকাল ১০টা – রাত ৮টা",
    valueBengali: true,
  },
];

interface FormState {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const INITIAL_FORM: FormState = {
  name: "",
  phone: "",
  email: "",
  subject: "",
  message: "",
};

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const setField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.name.trim()) {
      next.name = "Please enter your name — নাম লিখুন";
    }
    const phoneDigits = form.phone.replace(/\D/g, "");
    if (!form.phone.trim()) {
      next.phone = "Please enter your phone number — ফোন নম্বর লিখুন";
    } else if (phoneDigits.length < 10) {
      next.phone = "Phone number must be at least 10 digits — সঠিক নম্বর দিন";
    }
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      next.email = "Please enter a valid email address";
    }
    if (!form.message.trim()) {
      next.message = "Please write your message — বার্তা লিখুন";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch("/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          subject: form.subject.trim() || undefined,
          message: form.message.trim(),
        }),
      });
      setSent(true);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to send message. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50/40">
      {/* Header band */}
      <section className="bg-ink-950 py-14 text-center sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-500">
            Nameplate Zone
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
            Get in <span className="gold-gradient-text">Touch</span>
          </h1>
          <p className="mt-3 font-bengali text-lg text-ink-300">
            আমাদের সাথে যোগাযোগ করুন
          </p>
          <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Left: contact info */}
          <div className="space-y-4 lg:col-span-2">
            {CONTACT_INFO.map((info) => {
              const Icon = info.icon;
              return (
                <div key={info.title} className="card flex items-start gap-4 p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-gold-400 to-gold-600 shadow-lg shadow-gold-500/25">
                    <Icon className="h-5 w-5 text-ink-950" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-900">
                      {info.title}{" "}
                      <span className="font-bengali font-medium text-ink-400">
                        — {info.titleBn}
                      </span>
                    </p>
                    <p
                      className={`mt-0.5 break-words text-sm text-ink-600 ${
                        info.valueBengali ? "font-bengali" : ""
                      }`}
                    >
                      {info.value}
                    </p>
                  </div>
                </div>
              );
            })}

            <div className="rounded-2xl border border-gold-500/30 bg-ink-950 p-6">
              <h3 className="font-display text-lg font-semibold text-white">
                Need a <span className="gold-gradient-text">custom design</span>?
              </h3>
              <p className="mt-2 font-bengali text-sm text-ink-300">
                আপনার পছন্দমতো ডিজাইন নিয়ে কথা বলতে সরাসরি কল করুন — আমরা
                সাহায্য করতে প্রস্তুত।
              </p>
            </div>
          </div>

          {/* Right: form / thank-you */}
          <div className="lg:col-span-3">
            {sent ? (
              <div className="card flex h-full flex-col items-center justify-center p-10 text-center sm:p-14">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-green-400 to-green-600 shadow-lg shadow-green-500/30">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h2 className="mt-6 font-display text-2xl font-semibold text-ink-900">
                  Message Sent!
                </h2>
                <p className="mt-2 font-bengali text-base text-ink-500">
                  ধন্যবাদ! আমরা শীঘ্রই যোগাযোগ করবো।
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForm(INITIAL_FORM);
                    setSent(false);
                  }}
                  className="btn-dark mt-8"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="card p-6 sm:p-8">
                <h2 className="font-display text-xl font-semibold text-ink-900">
                  Send Us a Message
                </h2>
                <p className="font-bengali text-sm text-ink-400">
                  নিচের ফর্মটি পূরণ করুন
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="label">
                      Name <span className="text-red-500">*</span>{" "}
                      <span className="font-bengali text-ink-400">— নাম</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      className={`input ${errors.name ? "border-red-400 focus:border-red-500 focus:ring-red-300/30" : ""}`}
                      placeholder="Your name"
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="label">
                      Phone <span className="text-red-500">*</span>{" "}
                      <span className="font-bengali text-ink-400">— ফোন</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      className={`input ${errors.phone ? "border-red-400 focus:border-red-500 focus:ring-red-300/30" : ""}`}
                      placeholder="01XXXXXXXXX"
                      value={form.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="label">
                      Email <span className="text-ink-400">(optional)</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      className={`input ${errors.email ? "border-red-400 focus:border-red-500 focus:ring-red-300/30" : ""}`}
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="subject" className="label">
                      Subject <span className="text-ink-400">(optional)</span>{" "}
                      <span className="font-bengali text-ink-400">— বিষয়</span>
                    </label>
                    <input
                      id="subject"
                      type="text"
                      className="input"
                      placeholder="e.g. Custom design query"
                      value={form.subject}
                      onChange={(e) => setField("subject", e.target.value)}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="message" className="label">
                      Message <span className="text-red-500">*</span>{" "}
                      <span className="font-bengali text-ink-400">— বার্তা</span>
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className={`input resize-none ${errors.message ? "border-red-400 focus:border-red-500 focus:ring-red-300/30" : ""}`}
                      placeholder="Write your message here…"
                      value={form.message}
                      onChange={(e) => setField("message", e.target.value)}
                    />
                    {errors.message && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.message}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gold mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
