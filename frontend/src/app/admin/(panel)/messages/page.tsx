"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ChevronDown, Mail, MailOpen, Phone, Trash2 } from "lucide-react";
import { adminFetch } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { ContactMessage } from "@/lib/types";
import { ConfirmDialog } from "@/components/admin/Modal";
import { EmptyState, TableSkeleton, useApiError } from "@/components/admin/ui";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<ContactMessage | null>(null);
  const [busyDelete, setBusyDelete] = useState(false);
  const onError = useApiError();

  const load = useCallback(async () => {
    try {
      setMessages(await adminFetch<ContactMessage[]>("/api/contact"));
    } catch (err) {
      onError(err, "Failed to load messages");
      setMessages([]);
    }
  }, [onError]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleMessage(msg: ContactMessage) {
    const next = expanded === msg.id ? null : msg.id;
    setExpanded(next);
    if (next && !msg.read) {
      try {
        await adminFetch(`/api/contact/${msg.id}/read`, { method: "PATCH" });
        setMessages((prev) =>
          prev?.map((m) => (m.id === msg.id ? { ...m, read: true } : m)) ?? null
        );
      } catch (err) {
        onError(err);
      }
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setBusyDelete(true);
    try {
      await adminFetch(`/api/contact/${deleting.id}`, { method: "DELETE" });
      toast.success("Message deleted");
      setDeleting(null);
      load();
    } catch (err) {
      onError(err);
    } finally {
      setBusyDelete(false);
    }
  }

  const unread = messages?.filter((m) => !m.read).length ?? 0;

  return (
    <div className="space-y-4">
      {messages && messages.length > 0 && (
        <p className="text-sm text-ink-500">
          {messages.length} messages{unread > 0 && (
            <> · <span className="font-semibold text-gold-600">{unread} unread</span></>
          )}
        </p>
      )}

      <div className="card overflow-hidden">
        {messages === null ? (
          <TableSkeleton rows={5} />
        ) : messages.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="Inbox is empty"
            subtitle="Messages from the contact form will appear here."
          />
        ) : (
          <ul className="divide-y divide-ink-50">
            {messages.map((msg) => {
              const isOpen = expanded === msg.id;
              return (
                <li
                  key={msg.id}
                  className={`transition ${!msg.read ? "border-l-4 border-gold-500 bg-gold-50/40" : "border-l-4 border-transparent"}`}
                >
                  <button
                    onClick={() => toggleMessage(msg)}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left"
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        msg.read ? "bg-ink-100 text-ink-400" : "bg-gold-500 text-ink-950"
                      }`}
                    >
                      {msg.read ? <MailOpen className="h-4.5 w-4.5 h-[18px] w-[18px]" /> : <Mail className="h-[18px] w-[18px]" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm ${msg.read ? "font-medium text-ink-700" : "font-bold text-ink-900"}`}>
                        {msg.name}
                        {msg.subject && <span className="text-ink-400"> — {msg.subject}</span>}
                      </p>
                      <p className="truncate text-xs text-ink-400">{msg.message}</p>
                    </div>
                    <span className="hidden shrink-0 text-xs text-ink-400 sm:block">
                      {formatDate(msg.createdAt)}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-ink-300 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="space-y-3 px-5 pb-5 pl-[76px]">
                      <p className="whitespace-pre-wrap rounded-xl bg-ink-50 p-4 text-sm leading-relaxed text-ink-700">
                        {msg.message}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <a
                          href={`tel:${msg.phone}`}
                          className="flex items-center gap-1.5 font-medium text-gold-700 hover:text-gold-800"
                        >
                          <Phone className="h-4 w-4" /> {msg.phone}
                        </a>
                        {msg.email && (
                          <a
                            href={`mailto:${msg.email}`}
                            className="flex items-center gap-1.5 font-medium text-gold-700 hover:text-gold-800"
                          >
                            <Mail className="h-4 w-4" /> {msg.email}
                          </a>
                        )}
                        <button
                          onClick={() => setDeleting(msg)}
                          className="ml-auto flex items-center gap-1.5 text-sm font-medium text-red-500 transition hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete message?"
        message={
          <>
            Message from <span className="font-semibold">{deleting?.name}</span> will be permanently
            removed.
          </>
        }
        busy={busyDelete}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
