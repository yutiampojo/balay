"use client";

import { useState } from "react";
import { becomeHost } from "./actions";
import { createClient } from "@/lib/supabase/client";

const PROPERTY_TYPES = [
  { value: "HOUSE", label: "House", icon: "🏠" },
  { value: "CONDO", label: "Condo", icon: "🏙️" },
  { value: "APARTMENT", label: "Apartment", icon: "🏢" },
  { value: "TOWNHOUSE", label: "Townhouse", icon: "🏘️" },
  { value: "STUDIO", label: "Studio", icon: "🛋️" },
  { value: "ROOM", label: "Room", icon: "🚪" },
  { value: "BEDSPACE", label: "Bedspace", icon: "🛏️" },
  { value: "DORMITORY", label: "Dormitory", icon: "🏨" },
];
const FURNISHINGS = [
  { value: "UNFURNISHED", label: "Unfurnished" },
  { value: "SEMI_FURNISHED", label: "Semi-furnished" },
  { value: "FURNISHED", label: "Fully furnished" },
];
const AMENITIES = ["Air conditioning", "Fiber-ready internet", "24/7 security", "Parking", "Gym", "Pool"];
const STEPS = ["Your place", "Details", "Location", "Pricing", "Photos", "Verify"];

export default function HostWizard() {
  const [step, setStep] = useState(0);
  const [propertyType, setPropertyType] = useState("");
  const [furnishing, setFurnishing] = useState("FURNISHED");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const [consents, setConsents] = useState([false, false, false, false]);
  const setConsent = (i: number, v: boolean) => setConsents((c) => c.map((x, j) => (j === i ? v : x)));
  const allConsent = consents.every(Boolean);

  const last = STEPS.length - 1;
  const canNext = step === 0 ? !!propertyType : true;

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadErr(null);
    setUploading(true);
    const supabase = createClient();
    try {
      for (const file of files) {
        if (file.size > 8 * 1024 * 1024) { setUploadErr(`${file.name} is over 8MB — skipped.`); continue; }
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("listing-photos").upload(path, file, { cacheControl: "3600", upsert: false });
        if (error) { setUploadErr(error.message); continue; }
        const { data } = supabase.storage.from("listing-photos").getPublicUrl(path);
        setPhotos((p) => [...p, data.publicUrl]);
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const removePhoto = (url: string) => setPhotos((p) => p.filter((u) => u !== url));
  const makeCover = (url: string) => setPhotos((p) => [url, ...p.filter((u) => u !== url)]);

  const consentText = [
    "I confirm that I own this property or am authorized to lease it.",
    "I'm responsible for applicable tax, permit, building, condo, HOA, and local government requirements.",
    "I understand Balaymo is a listing tool and does not act as my broker, legal adviser, or property manager.",
    "I will list only medium/long-term rentals (3 months+) priced by the month — never nightly stays.",
  ];

  return (
    <form action={becomeHost}>
      <input type="hidden" name="propertyType" value={propertyType} />
      <input type="hidden" name="furnishingStatus" value={furnishing} />
      {photos.map((url) => <input key={url} type="hidden" name="photoUrls" value={url} />)}

      <div className="stepper">
        {STEPS.map((s, i) => (
          <div key={s} className={`s ${i === step ? "active" : i < step ? "done" : ""}`}>
            <div className="n">Step {i + 1}</div>
            {s}
          </div>
        ))}
      </div>

      {/* STEP 1 — property type */}
      <section className="card card-pad" style={{ display: step === 0 ? "block" : "none" }}>
        <h3 style={{ marginBottom: 4 }}>Which of these best describes your place?</h3>
        <p className="hint" style={{ marginBottom: 18 }}>Pick the type of property you want to list.</p>
        <div className="choice-grid">
          {PROPERTY_TYPES.map((t) => (
            <button type="button" key={t.value} className={`choice-card${propertyType === t.value ? " selected" : ""}`} onClick={() => setPropertyType(t.value)} aria-pressed={propertyType === t.value}>
              <span className="ic">{t.icon}</span>
              <span className="lb">{t.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* STEP 2 — details */}
      <section className="card card-pad" style={{ display: step === 1 ? "block" : "none" }}>
        <h3 style={{ marginBottom: 4 }}>Tell us about the space</h3>
        <p className="hint" style={{ marginBottom: 18 }}>The essentials tenants look for.</p>
        <div className="field-group"><label>Listing title</label><input className="input" name="title" placeholder="e.g. Bright 1BR near Ayala" /></div>
        <div className="field-group"><label>Description</label><textarea className="textarea" name="description" placeholder="Describe the space, the neighborhood, and who it suits." /></div>
        <div className="grid-3">
          <div className="field-group"><label>Bedrooms</label><input className="input" type="number" name="bedrooms" defaultValue="1" min="0" /></div>
          <div className="field-group"><label>Bathrooms</label><input className="input" type="number" name="bathrooms" defaultValue="1" min="0" /></div>
          <div className="field-group"><label>Floor area (m²)</label><input className="input" type="number" name="floorArea" placeholder="34" /></div>
        </div>
        <div className="field-group"><label>Furnishing</label>
          <div className="choice-row">
            {FURNISHINGS.map((f) => (
              <button type="button" key={f.value} className={`chip${furnishing === f.value ? " active" : ""}`} onClick={() => setFurnishing(f.value)}>{f.label}</button>
            ))}
          </div>
        </div>
        <div className="field-group"><label>Pet policy</label>
          <select className="select" name="petPolicy" defaultValue="No pets"><option>No pets</option><option>Cats only</option><option>Pets on approval</option><option>Pet-friendly</option></select>
        </div>
        <div className="field-group"><label>Amenities</label>
          <div className="chk-grid" style={{ marginTop: 6 }}>
            {AMENITIES.map((a) => (
              <label className="checkrow" key={a}><input type="checkbox" name="amenities" value={a} defaultChecked={["Air conditioning", "Fiber-ready internet", "24/7 security"].includes(a)} />{a}</label>
            ))}
          </div>
        </div>
        <div className="field-group"><label>House rules <span className="sub">One per line</span></label><textarea className="textarea" name="houseRules" placeholder={"Quiet hours after 10pm\nNo smoking indoors"} /></div>
      </section>

      {/* STEP 3 — location */}
      <section className="card card-pad" style={{ display: step === 2 ? "block" : "none" }}>
        <h3 style={{ marginBottom: 4 }}>Where is it?</h3>
        <p className="hint" style={{ marginBottom: 18 }}>The full address stays private until you accept an inquiry.</p>
        <div className="grid-2">
          <div className="field-group"><label>City</label>
            <select className="select" name="city" defaultValue="Makati"><option>Quezon City</option><option>Makati</option><option>Taguig</option><option>Cebu City</option><option>Davao City</option><option>Baguio</option></select>
          </div>
          <div className="field-group"><label>Barangay / area</label><input className="input" name="barangay" placeholder="e.g. Poblacion" /></div>
        </div>
        <div className="field-group"><label>Full address <span className="sub">Private</span></label><input className="input" name="fullAddress" placeholder="Unit / building / street" /></div>
      </section>

      {/* STEP 4 — pricing */}
      <section className="card card-pad" style={{ display: step === 3 ? "block" : "none" }}>
        <h3 style={{ marginBottom: 4 }}>Set your price &amp; terms</h3>
        <p className="hint" style={{ marginBottom: 18 }}>Monthly rent only — nightly/weekly isn&apos;t allowed on Balaymo.</p>
        <div className="grid-3">
          <div className="field-group"><label>Monthly rent (₱)</label><input className="input" type="number" name="monthlyRent" placeholder="28500" /></div>
          <div className="field-group"><label>Security deposit (₱)</label><input className="input" type="number" name="securityDeposit" placeholder="28500" /></div>
          <div className="field-group"><label>Advance (₱)</label><input className="input" type="number" name="advancePayment" placeholder="28500" /></div>
        </div>
        <div className="grid-2">
          <div className="field-group"><label>Minimum lease</label>
            <select className="select" name="minimumLeaseMonths" defaultValue="6"><option value="3">3 months</option><option value="6">6 months</option><option value="12">12 months</option><option value="24">24 months</option></select>
          </div>
          <div className="field-group"><label>Available from</label><input className="input" type="date" name="availableFrom" defaultValue="2026-07-15" /></div>
        </div>
      </section>

      {/* STEP 5 — photos */}
      <section className="card card-pad" style={{ display: step === 4 ? "block" : "none" }}>
        <h3 style={{ marginBottom: 4 }}>Add photos</h3>
        <p className="hint" style={{ marginBottom: 18 }}>The first photo is the cover (thumbnail). Renters see all of them on your listing. JPG/PNG, up to 8MB each.</p>

        <label className="upload" style={{ display: "block" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 16V4m0 0L7 9m5-5 5 5" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>
          <div>{uploading ? "Uploading…" : "Click to upload photos"}</div>
          <input type="file" accept="image/*" multiple hidden onChange={handleFiles} disabled={uploading} />
        </label>
        {uploadErr && <p className="muted" style={{ color: "var(--danger)", fontSize: ".84rem", marginTop: 8 }}>{uploadErr}</p>}

        {photos.length > 0 && (
          <div className="photo-grid" style={{ marginTop: 16 }}>
            {photos.map((url, i) => (
              <div key={url} className="photo-thumb">
                <img src={url} alt={`Photo ${i + 1}`} />
                {i === 0 && <span className="cover-badge">Cover</span>}
                <div className="photo-actions">
                  {i !== 0 && <button type="button" className="btn btn-ghost btn-sm" onClick={() => makeCover(url)}>Make cover</button>}
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => removePhoto(url)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {photos.length === 0 && <p className="muted" style={{ fontSize: ".84rem", marginTop: 12 }}>No photos yet — a listing with photos gets far more inquiries.</p>}
      </section>

      {/* STEP 6 — verify & consent */}
      <section className="card card-pad" style={{ display: step === 5 ? "block" : "none" }}>
        <h3 style={{ marginBottom: 4 }}>Verify &amp; confirm</h3>
        <p className="hint" style={{ marginBottom: 18 }}>Becoming a Keyholder confirms you&apos;re authorized to lease. Required before your listing goes live.</p>
        <div className="field-group">
          <label>Government-issued ID</label>
          <div className="upload"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 16V4m0 0L7 9m5-5 5 5" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg><div>Click to upload your ID</div></div>
        </div>
        <div className="consent">
          {consentText.map((t, i) => (
            <label className="checkrow" key={i}><input type="checkbox" checked={consents[i]} onChange={(e) => setConsent(i, e.target.checked)} />{t}</label>
          ))}
        </div>
      </section>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22, gap: 12 }}>
        <button type="button" className="btn btn-ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>Back</button>
        {step < last ? (
          <button type="button" className="btn btn-primary btn-lg" onClick={() => setStep((s) => s + 1)} disabled={!canNext || uploading}>Continue</button>
        ) : (
          <button type="submit" className="btn btn-gold btn-lg" disabled={!allConsent || uploading}>Submit &amp; publish for review</button>
        )}
      </div>
      {step === 0 && !propertyType && <p className="muted" style={{ fontSize: ".82rem", textAlign: "right", marginTop: 8 }}>Select a property type to continue.</p>}
    </form>
  );
}
