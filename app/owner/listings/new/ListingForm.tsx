"use client";

import { useState } from "react";
import { createListing } from "./actions";

const AMENITIES = ["Air conditioning", "Fiber-ready internet", "24/7 security", "Parking", "Gym", "Pool"];

export default function ListingForm() {
  const [ck1, setCk1] = useState(false);
  const [ck2, setCk2] = useState(false);

  return (
    <form action={createListing}>
      <div className="card card-pad">
        <div className="form-section">
          <h3>The basics</h3>
          <div className="field-group"><label>Listing title</label><input className="input" name="title" placeholder="e.g. Bright 1BR near Ayala" required /></div>
          <div className="grid-2">
            <div className="field-group"><label>Property type</label>
              <select className="select" name="propertyType" defaultValue="CONDO">
                <option value="ROOM">Room</option><option value="BEDSPACE">Bedspace</option><option value="STUDIO">Studio unit</option>
                <option value="CONDO">Condo</option><option value="APARTMENT">Apartment</option><option value="HOUSE">House</option>
                <option value="TOWNHOUSE">Townhouse</option><option value="DORMITORY">Dormitory-style room</option>
              </select>
            </div>
            <div className="field-group"><label>Furnishing</label>
              <select className="select" name="furnishingStatus" defaultValue="FURNISHED">
                <option value="UNFURNISHED">Unfurnished</option><option value="SEMI_FURNISHED">Semi-furnished</option><option value="FURNISHED">Fully furnished</option>
              </select>
            </div>
          </div>
          <div className="field-group"><label>Description</label><textarea className="textarea" name="description" placeholder="Describe the space, the neighborhood, and who it suits." /></div>
        </div>

        <div className="form-section">
          <h3>Location</h3>
          <div className="grid-2">
            <div className="field-group"><label>City</label>
              <select className="select" name="city" defaultValue="Makati">
                <option>Quezon City</option><option>Makati</option><option>Taguig</option><option>Cebu City</option><option>Davao City</option><option>Baguio</option>
              </select>
            </div>
            <div className="field-group"><label>Barangay / area</label><input className="input" name="barangay" placeholder="e.g. Poblacion" /></div>
          </div>
          <div className="field-group"><label>Full address <span className="sub">Private — hidden from the public, shared only after an inquiry</span></label><input className="input" name="fullAddress" placeholder="Unit / building / street" /></div>
        </div>

        <div className="form-section">
          <h3>Pricing</h3>
          <p className="hint">Monthly rent only. Nightly and weekly pricing isn&apos;t supported on Balay.</p>
          <div className="grid-3">
            <div className="field-group"><label>Monthly rent (₱)</label><input className="input" type="number" name="monthlyRent" placeholder="28500" required /></div>
            <div className="field-group"><label>Security deposit (₱)</label><input className="input" type="number" name="securityDeposit" placeholder="28500" /></div>
            <div className="field-group"><label>Advance (₱)</label><input className="input" type="number" name="advancePayment" placeholder="28500" /></div>
          </div>
        </div>

        <div className="form-section">
          <h3>Lease terms</h3>
          <div className="grid-2">
            <div className="field-group"><label>Minimum lease</label>
              <select className="select" name="minimumLeaseMonths" defaultValue="6">
                <option value="3">3 months</option><option value="6">6 months</option><option value="12">12 months</option><option value="24">24 months</option>
              </select>
            </div>
            <div className="field-group"><label>Available from</label><input className="input" type="date" name="availableFrom" defaultValue="2026-07-15" /></div>
          </div>
          <div className="banner gold" style={{ marginTop: 6, fontSize: ".86rem" }}>
            <span className="ico"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg></span>
            <div className="grow">Minimum lease is locked to 3 months and above. Balay does not allow nightly or weekly stays.</div>
          </div>
        </div>

        <div className="form-section">
          <h3>Details</h3>
          <div className="grid-3">
            <div className="field-group"><label>Bedrooms</label><input className="input" type="number" name="bedrooms" defaultValue="1" /></div>
            <div className="field-group"><label>Bathrooms</label><input className="input" type="number" name="bathrooms" defaultValue="1" /></div>
            <div className="field-group"><label>Floor area (m²)</label><input className="input" type="number" name="floorArea" placeholder="34" /></div>
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
          <div className="field-group"><label>House &amp; building rules <span className="sub">One per line</span></label><textarea className="textarea" name="houseRules" placeholder={"Quiet hours after 10pm\nNo smoking indoors"} /></div>
        </div>

        <div className="form-section" style={{ marginBottom: 0 }}>
          <h3>Owner confirmation</h3>
          <div className="consent">
            <label className="checkrow"><input type="checkbox" checked={ck1} onChange={(e) => setCk1(e.target.checked)} />This listing is true and accurate, and the unit doesn&apos;t violate condo, subdivision, HOA, or building rules.</label>
            <label className="checkrow"><input type="checkbox" checked={ck2} onChange={(e) => setCk2(e.target.checked)} />I&apos;m responsible for applicable taxes and permits, and Balay isn&apos;t acting as my broker or agent.</label>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 22, gap: 12 }}>
        <button className="btn btn-primary btn-lg" type="submit" disabled={!(ck1 && ck2)}>Submit for review</button>
      </div>
    </form>
  );
}
