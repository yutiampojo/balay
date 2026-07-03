"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateAvatar, removeAvatar } from "./actions";

export default function AvatarUpload({ currentUrl, initials }: { currentUrl: string | null; initials: string }) {
  const router = useRouter();
  const [url, setUrl] = useState(currentUrl);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErr("Image must be under 5MB."); return; }
    setErr(null); setBusy(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) { setErr(error.message); return; }
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const res = await updateAvatar(data.publicUrl);
      if (!res.ok) { setErr(res.error ?? "Could not save."); return; }
      setUrl(data.publicUrl);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function onRemove() {
    setBusy(true);
    await removeAvatar();
    setUrl(null);
    router.refresh();
    setBusy(false);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
      <span className="avatar" style={{ width: 76, height: 76, fontSize: "1.4rem", fontWeight: 700, overflow: "hidden" }}>
        {url ? <img src={url} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
      </span>
      <div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <label className="btn btn-ghost btn-sm" style={{ cursor: "pointer" }}>
            {busy ? "Uploading…" : url ? "Change photo" : "Upload photo"}
            <input type="file" accept="image/*" hidden onChange={onFile} disabled={busy} />
          </label>
          {url && <button className="btn btn-danger btn-sm" type="button" onClick={onRemove} disabled={busy}>Remove</button>}
        </div>
        {err ? <p className="muted" style={{ color: "var(--danger)", fontSize: ".82rem", marginTop: 8 }}>{err}</p>
             : <p className="muted" style={{ fontSize: ".82rem", marginTop: 8 }}>JPG or PNG, up to 5MB. Shown across Balaymo.</p>}
      </div>
    </div>
  );
}
