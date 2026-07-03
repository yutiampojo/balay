"use client";

import { useState } from "react";
import { createListing } from "./actions";
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
const STEPS = ["Your place", "About", "Location", "Pricing", "Photos", "Confirm"];

export default function ListingForm() {
  const [step, setStep] = useState(0);
  const [propertyType, setPropertyType] = useState("");
  const [furnishing, setFurnishing] = useState("FURNISHED");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const [ck1, setCk1] = useState(false);
  const [ck2, setCk2] = useState(false);

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

  return (
    <form action={createListing}>
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

      {/* STEP 2 — about */}
      <section className="card card-pad" style={{ display: step === 1 ? "block" : "none" }}>
        <h3 style={{ marginBottom: 4 }}>Name your listing</h3>
        <p className="hint" style={{ marginBottom: 18 }}>Give it a clear title and tell tenants about the space.</p>
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
        <div className="field-group"><label>Full address <span className="sub">Private — hidden from the public, shared only after an inquiry</span></label><input className="input" name="fullAddress" placeholder="Unit / building / street" /></div>
      </section>

      {/* STEP 4 — pricing */}
      <section className="card card-pad" style={{ display: step === 3 ? "block" : "none" }}>
        <h3 style={{ marginBottom: 4 }}>Set your price &amp; terms</h3>
        <p className="hint" style={{ marginBottom: 18 }}>Monthly rent only — nightly/weekly isn&apos;t supported on Balaymo.</p>
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
        <div className="banner gold" style={{ marginTop: 6, fontSize: ".86rem" }}>
          <span className="ico"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg></span>
          <div className="grow">Minimum lease is locked to 3 months and above. Balaymo does not allow nightly or weekly stays.</div>
        </div>
      </section>

      {/* STEP 5 — photos */}
      <section className="card card-pad" style={{ display: step === 4 ? "block" : "none" }}>
        <h3 style={{ marginBottom: 4 }}>Add photos</h3>
        <p className="hint" style={{ marginBottom: 18 }}>The first photo is the cover (thumbnail) renters see. JPG/PNG, up to 8MB each.</p>
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
      </section>

      {/* STEP 6 — confirm */}
      <section className="card card-pad" style={{ display: step === 5 ? "block" : "none" }}>
        <h3 style={{ marginBottom: 4 }}>Owner confirmation</h3>
        <p className="hint" style={{ marginBottom: 18 }}>Required before your listing is submitted for admin review.</p>
        <div className="consent">
          <label className="checkrow"><input type="checkbox" checked={ck1} onChange={(e) => setCk1(e.target.checked)} />This listing is true and accurate, and the unit doesn&apos;t violate condo, subdivision, HOA, or building rules.</label>
          <label className="checkrow"><input type="checkbox" checked={ck2} onChange={(e) => setCk2(e.target.checked)} />I&apos;m responsible for applicable taxes and permits, and Balaymo isn&apos;t acting as my broker or agent.</label>
        </div>
      </section>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22, gap: 12 }}>
        <button type="button" className="btn btn-ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>Back</button>
        {step < last ? (
          <button type="button" className="btn btn-primary btn-lg" onClick={() => setStep((s) => s + 1)} disabled={!canNext || uploading}>Continue</button>
        ) : (
          <button type="submit" className="btn btn-primary btn-lg" disabled={!(ck1 && ck2) || uploading}>Submit for review</button>
        )}
      </div>
      {step === 0 && !propertyType && <p className="muted" style={{ fontSize: ".82rem", textAlign: "right", marginTop: 8 }}>Select a property type to continue.</p>}
    </form>
  );
}
