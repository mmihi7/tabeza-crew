"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import LocationSearch from "@/components/shared/LocationSearch";

export default function PrivacyPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [marketplaceVisible, setMarketplaceVisible] = useState(true);
  const [locations, setLocations] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) { setLoading(false); return; }
      try {
        const res = await fetch("/api/staff/profile", {
          headers: { Authorization: "Bearer " + accessToken },
        });
        const data = await res.json();
        if (data.marketplace_visible != null) setMarketplaceVisible(data.marketplace_visible);
        if (data.preferred_locations?.length) setLocations(data.preferred_locations);
      } catch { /* silent */ }
      setLoading(false);
    }
    load();
  }, [user?.id]);

  function addLocation(loc: { label: string; county?: string }) {
    if (!loc.label || locations.includes(loc.label)) return;
    const value = loc.county && !loc.label.includes(loc.county)
      ? loc.label + ", " + loc.county + " County"
      : loc.label;
    setLocations(prev => [...prev, value]);
  }

  function removeLocation(loc: string) {
    setLocations(prev => prev.filter(l => l !== loc));
  }

  async function handleSave() {
    if (!user?.id) return;
    setSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      const res = await fetch("/api/staff/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: "Bearer " + accessToken } : {}),
        },
        body: JSON.stringify({
          marketplace_visible: marketplaceVisible,
          preferred_locations: locations,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* silent */ }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="page-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "40dvh" }}>
        <div style={{ fontSize: "0.85rem", color: "var(--text-tertiary)" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "1.5rem" }}>
        <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: "0.5rem", background: "var(--background-secondary)", border: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <ArrowLeft size={18} style={{ color: "var(--text-primary)" }} />
        </button>
        <div>
          <h1 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-primary)" }}>Privacy & Marketplace</h1>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.1rem" }}>Control what venues see</p>
        </div>
      </div>

      <div className="text-section-heading" style={{ marginBottom: "0.5rem" }}>Marketplace Visibility</div>
      <div className="card" style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.2rem" }}>
            {marketplaceVisible ? "Visible to venues" : "Hidden from marketplace"}
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            {marketplaceVisible ? "Your profile appears in venue searches. You will receive hire requests." : "Only venues you have worked with before can see you."}
          </p>
        </div>
        <button onClick={() => setMarketplaceVisible(v => !v)} style={{ width: 50, height: 28, borderRadius: "14px", background: marketplaceVisible ? "var(--success)" : "var(--background-tertiary)", border: "1px solid " + (marketplaceVisible ? "var(--success)" : "var(--border-default)"), position: "relative", cursor: "pointer", flexShrink: 0, transition: "all 0.2s" }}>
          <div style={{ position: "absolute", top: 3, left: marketplaceVisible ? 24 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
        </button>
      </div>

      <div className="text-section-heading" style={{ marginBottom: "0.5rem" }}>Preferred Work Locations</div>
      <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.875rem" }}>
        Search for towns or areas where you want to work. This helps venues nearby find you.
      </p>

      <LocationSearch onSelect={addLocation} placeholder="Search for a town or area in Kenya..." />

      {locations.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.875rem", marginBottom: "1.5rem" }}>
          {locations.map(loc => (
            <span key={loc} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem", background: "var(--amber-pale)", border: "1px solid rgba(255,79,0,0.25)", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 500, color: "var(--amber)" }}>
              {loc}
              <button onClick={() => removeLocation(loc)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}

      <button className="btn-primary" style={{ width: "100%" }} onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : saved ? "Saved!" : "Save Settings"}
      </button>
    </div>
  );
}

