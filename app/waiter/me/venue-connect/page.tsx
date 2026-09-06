"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, Check, Loader, Clock, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const ROLE_OPTIONS = [
  { value: "manager", label: "Manager" },
  { value: "chef", label: "Chef" },
  { value: "waiter", label: "Waiter" },
  { value: "bartender", label: "Bartender" },
  { value: "captain", label: "Captain" },
  { value: "host", label: "Host" },
];

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending approval",
  approved: "Approved",
  declined: "Declined",
};

interface VenueLink {
  id: string;
  role: string;
  employment_type: string;
  status?: string;
  requested_at?: string;
  bar?: { id: string; name: string; slug: string } | null;
}

export default function VenueConnectPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [venue, setVenue] = useState("");
  const [role, setRole] = useState("waiter");
  const [employmentType, setEmploymentType] = useState<"full_time" | "gig">("full_time");
  const [requests, setRequests] = useState<VenueLink[]>([]);
  const [roster, setRoster] = useState<VenueLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  };

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      const token = await getToken();
      if (!token) { setLoading(false); return; }
      const res = await fetch("/api/venues/connect-request", {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      if (data.requests) setRequests(data.requests);
      if (data.roster) setRoster(data.roster);
    } catch { /* silent */ }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit() {
    setSubmitting(true);
    setFeedback(null);
    try {
      const token = await getToken();
      if (!token) { setFeedback({ ok: false, text: "Please sign in again." }); return; }
      const res = await fetch("/api/venues/connect-request", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ venue, role, employment_type: employmentType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ ok: false, text: data.error || "Could not send request." });
        return;
      }
      setFeedback({ ok: true, text: data.message || "Request sent!" });
      setVenue("");
      await load();
    } catch {
      setFeedback({ ok: false, text: "Network error — please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  const sectionBlock = (list: VenueLink[], emptyText: string) => {
    if (!list.length) {
      return (
        <div className="card" style={{ padding: "1rem 1.125rem", background: "var(--background-secondary)" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", margin: 0 }}>{emptyText}</p>
        </div>
      );
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {list.map((item) => (
          <div key={item.id} className="card" style={{ padding: "0.75rem 1rem", background: "var(--background-secondary)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
              background: "var(--amber-pale)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Building2 size={16} style={{ color: "var(--amber)" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>{item.bar?.name}</div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "capitalize" }}>
                {item.role}
                {item.employment_type === "full_time" ? " · Full-time" : " · Gig"}
                {item.status ? " · " + (STATUS_LABEL[item.status] ?? item.status) : ""}
              </div>
            </div>
            {item.status === "approved" && <Check size={16} style={{ color: "var(--success)", flexShrink: 0 }} />}
            {item.status === "pending" && <Clock size={15} style={{ color: "var(--amber)", flexShrink: 0 }} />}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "1.25rem" }}>
        <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: "0.5rem", background: "var(--background-secondary)", border: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <ArrowLeft size={18} style={{ color: "var(--text-primary)" }} />
        </button>
        <div>
          <h1 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-primary)" }}>Connect to a Venue</h1>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.1rem" }}>Let your workplace&apos;s customers find you</p>
        </div>
      </div>

      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "1.25rem" }}>
        Work somewhere regularly — full-time or as a regular? Connect to that venue so its
        customers can see you on their table screen, and like, tip or review you for great
        service. Full-time staff stay hidden from the public job marketplace unless you opt in.
      </p>

      {/* Form */}
      <div className="card" style={{ padding: "1rem", background: "var(--background-secondary)", marginBottom: "1.5rem" }}>
        <label className="input-label">Venue code</label>
        <input
          className="input"
          type="text"
          placeholder="e.g. the code on your table / venue QR"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          style={{ marginBottom: "0.875rem" }}
        />

        <label className="input-label">Your role at this venue</label>
        <select className="input" value={role} onChange={(e) => setRole(e.target.value)} style={{ marginBottom: "0.875rem" }}>
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          {(
            [
              { value: "full_time", title: "Full-time", desc: "Private on marketplace" },
              { value: "gig", title: "Gig", desc: "Listed for shifts" },
            ] as const
          ).map((opt) => {
            const active = employmentType === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setEmploymentType(opt.value)}
                style={{
                  flex: 1,
                  padding: "0.6rem 0.75rem",
                  borderRadius: "0.625rem",
                  cursor: "pointer",
                  textAlign: "left",
                  border: "1px solid " + (active ? "var(--amber)" : "var(--border-default)"),
                  background: active ? "var(--amber-pale)" : "var(--background-primary)",
                }}
              >
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: active ? "var(--amber)" : "var(--text-primary)" }}>{opt.title}</div>
                <div style={{ fontSize: "0.65rem", color: "var(--text-tertiary)" }}>{opt.desc}</div>
              </button>
            );
          })}
        </div>

        <button className="btn-primary" style={{ width: "100%" }} onClick={handleSubmit} disabled={submitting || !venue.trim()}>
          {submitting ? <><Loader size={14} /> Sending...</> : <>Request to Join</>}
        </button>

        {feedback && (
          <p style={{
            marginTop: "0.75rem", fontSize: "0.8rem", lineHeight: 1.5,
            color: feedback.ok ? "var(--success)" : "var(--error)",
            background: feedback.ok ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.06)",
            border: "1px solid " + (feedback.ok ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"),
            borderRadius: "0.5rem", padding: "0.625rem 0.75rem",
          }}>
            {feedback.text}
          </p>
        )}
      </div>

      {/* Existing connections */}
      {loading ? (
        <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>Loading...</p>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <Check size={14} style={{ color: "var(--success)" }} />
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>Connected venues</span>
          </div>
          {sectionBlock(roster, "Not connected to any venue yet — request to join above.")}

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "1.25rem 0 0.5rem" }}>
            <Clock size={14} style={{ color: "var(--amber)" }} />
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>Requests</span>
          </div>
          {sectionBlock(requests, "No requests yet.")}
        </>
      )}

      <div style={{ marginTop: "1.25rem", display: "flex", alignItems: "flex-start", gap: "0.5rem", padding: "0.625rem 0.75rem", background: "rgba(255,79,0,0.04)", border: "1px solid rgba(255,79,0,0.15)", borderRadius: "0.5rem" }}>
        <Users size={15} style={{ color: "var(--amber)", flexShrink: 0, marginTop: "0.1rem" }} />
        <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
          A manager at the venue approves your request before you appear to customers.
          Your profile, marketplace visibility and photos are managed under Privacy &amp; Marketplace.
        </p>
      </div>
    </div>
  );
}
