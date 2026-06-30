"use client";

import { useState } from "react";
import { becomeKeyholder } from "./actions";

export default function KeyholderForm({ fullName }: { fullName: string }) {
  const [checks, setChecks] = useState([false, false, false, false]);
  const allChecked = checks.every(Boolean);
  const set = (i: number, v: boolean) => setChecks((c) => c.map((x, j) => (j === i ? v : x)));

  const consents = [
    "I confirm that I own this property or am authorized to lease it.",
    "I understand I'm responsible for applicable tax, permit, building, condo, subdivision, HOA, and local government requirements.",
    "I understand Balay is a listing and rental-management tool and does not act as my real estate broker, legal adviser, tax adviser, or property manager.",
    "I will list only medium and long-term rentals (3 months and above) priced by the month — never nightly or transient stays.",
  ];

  return (
    <form action={becomeKeyholder}>
      <div className="card card-pad">
        <div className="form-section">
          <h3>Identity</h3>
          <p className="hint">We confirm you&apos;re a real person. Documents are encrypted and only an admin reviewer can open them.</p>
          <div className="grid-2">
            <div className="field-group"><label>Full legal name</label><input className="input" name="fullName" defaultValue={fullName} /></div>
            <div className="field-group"><label>Mobile number</label><input className="input" name="mobile" placeholder="+63 9XX XXX XXXX" /></div>
          </div>
          <div className="field-group">
            <label>Government-issued ID <span className="sub">PhilID, passport, driver&apos;s license, or UMID</span></label>
            <div className="upload"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 16V4m0 0L7 9m5-5 5 5" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg><div>Click to upload your ID</div></div>
          </div>
        </div>

        <div className="form-section">
          <h3>Property authority</h3>
          <p className="hint">Show you own the unit you&apos;ll list, or that you&apos;re authorized to lease it on the owner&apos;s behalf.</p>
          <div className="field-group">
            <label>Proof of ownership or authority to lease <span className="sub">Title, tax declaration, deed, or notarized authorization</span></label>
            <div className="upload"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 16V4m0 0L7 9m5-5 5 5" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg><div>Upload proof of ownership / authority</div></div>
          </div>
          <div className="field-group"><label>Property address <span className="sub">Kept private until you publish</span></label><input className="input" name="address" placeholder="Unit / street / barangay / city" /></div>
        </div>

        <div className="form-section" style={{ marginBottom: 0 }}>
          <h3>Confirm &amp; submit</h3>
          <p className="hint">Required before you can list. This keeps Balay out of broker territory and keeps tenants safe.</p>
          <div className="consent">
            {consents.map((text, i) => (
              <label className="checkrow" key={i}>
                <input type="checkbox" checked={checks[i]} onChange={(e) => set(i, e.target.checked)} />
                {text}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 22, flexWrap: "wrap", gap: 12 }}>
        <a className="btn btn-ghost" href="/dashboard">Cancel</a>
        <button className="btn btn-gold btn-lg" type="submit" disabled={!allChecked}>Submit for verification</button>
      </div>
      <p className="muted" style={{ fontSize: ".82rem", textAlign: "right", marginTop: 8 }}>All four confirmations are required to submit.</p>
    </form>
  );
}
