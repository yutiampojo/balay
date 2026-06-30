"use client";

import { useState } from "react";
import { submitApplication } from "./actions";

export default function ApplyForm({ listingId }: { listingId: string }) {
  const [consent1, setConsent1] = useState(false);
  const [consent2, setConsent2] = useState(false);

  return (
    <form action={submitApplication}>
      <input type="hidden" name="listingId" value={listingId} />

      <section className="card card-pad" style={{ marginBottom: 20 }}>
        <div className="form-section" style={{ marginBottom: 0 }}>
          <h3>Your intended stay</h3>
          <p className="hint">The Keyholder uses this to check the unit fits your plans.</p>
          <div className="grid-2">
            <div className="field-group"><label>Preferred move-in</label><input className="input" type="date" name="moveIn" defaultValue="2026-07-15" /></div>
            <div className="field-group"><label>Intended lease length</label>
              <select className="select" name="leaseMonths" defaultValue="6">
                <option value="6">6 months</option><option value="12">1 year</option><option value="24">2 years</option>
              </select>
            </div>
          </div>
          <div className="field-group"><label>Number of occupants</label>
            <select className="select" name="occupants" defaultValue="1"><option>1</option><option>2</option><option>3</option><option>4</option></select>
          </div>
        </div>
      </section>

      <section className="card card-pad" style={{ marginBottom: 20 }}>
        <div className="form-section" style={{ marginBottom: 0 }}>
          <h3>About you</h3>
          <div className="grid-2">
            <div className="field-group"><label>I am a</label>
              <select className="select" name="tenantType" defaultValue="EMPLOYEE">
                <option value="EMPLOYEE">Working professional</option>
                <option value="REVIEWER">Reviewer</option>
                <option value="STUDENT">Student</option>
                <option value="REMOTE_WORKER">Remote worker</option>
                <option value="FAMILY">Family</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="field-group"><label>Employment status</label>
              <select className="select" name="employmentStatus" defaultValue="Employed full-time">
                <option>Employed full-time</option><option>Self-employed</option><option>Contract / project-based</option><option>Student</option>
              </select>
            </div>
          </div>
          <div className="field-group"><label>Monthly income range <span className="sub">Optional</span></label>
            <select className="select" name="incomeRange" defaultValue="Prefer not to say">
              <option>Prefer not to say</option><option>Below ₱30k</option><option>₱30k–₱60k</option><option>₱60k–₱100k</option><option>Above ₱100k</option>
            </select>
          </div>
          <div className="field-group"><label>Message to the Keyholder <span className="sub">Optional</span></label>
            <textarea className="textarea" name="message" placeholder="Tell them a little about yourself and why this place fits." />
          </div>
        </div>
      </section>

      <section className="card card-pad">
        <div className="form-section" style={{ marginBottom: 0 }}>
          <h3>Review &amp; consent</h3>
          <div className="consent">
            <label className="checkrow"><input type="checkbox" checked={consent1} onChange={(e) => setConsent1(e.target.checked)} />I confirm the information I&apos;m submitting is true and accurate.</label>
            <label className="checkrow"><input type="checkbox" checked={consent2} onChange={(e) => setConsent2(e.target.checked)} />I consent to Balay and this Keyholder processing my personal information for this rental application, verification, communication, and safety purposes.</label>
          </div>
          <p className="muted" style={{ fontSize: ".8rem", marginTop: 12 }}>The Keyholder decides on applications directly. Balay doesn&apos;t approve, rank, or negotiate on either side&apos;s behalf.</p>
        </div>
      </section>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 22, gap: 12 }}>
        <button className="btn btn-gold btn-lg" type="submit" disabled={!(consent1 && consent2)}>Submit application</button>
      </div>
    </form>
  );
}
