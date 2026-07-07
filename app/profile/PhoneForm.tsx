"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePhone, confirmPhoneCurrent } from "./actions";

export default function PhoneForm({ currentPhone, needsReconfirm }: { currentPhone: string | null; needsReconfirm: boolean }) {
  const router = useRouter();
  const [phone, setPhone] = useState(currentPhone ?? "");
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setMsg(null); setBusy(true);
    const res = await updatePhone(phone);
    setBusy(false);
    if (!res.ok) { setErr(res.error ?? "Something went wrong."); return; }
    setMsg("Contact number saved ✓");
    router.refresh();
  }

  async function onConfirm() {
    setErr(null); setMsg(null); setBusy(true);
    const res = await confirmPhoneCurrent();
    setBusy(false);
    if (!res.ok) { setErr(res.error ?? "Something went wrong."); return; }
    setMsg("Thanks — marked as current ✓");
    router.refresh();
  }

  return (
    <div>
      {err && <div className="banner" style={{ background: "var(--danger-soft)", marginBottom: 14, fontSize: ".88rem" }}>{err}</div>}
      {msg && <div className="banner green" style={{ marginBottom: 14, fontSize: ".88rem" }}>{msg}</div>}

      <form onSubmit={onSave}>
        <div className="field-group">
          <label htmlFor="phone">Mobile number</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0917 123 4567" required />
          <span className="sub">PH mobile format, e.g. 0917 123 4567.</span>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Save number"}</button>
          {currentPhone && needsReconfirm && (
            <button className="btn btn-ghost" type="button" onClick={onConfirm} disabled={busy}>It&apos;s still current</button>
          )}
        </div>
      </form>
    </div>
  );
}
