import ListingCard from "@/app/components/ListingCard";
import { getPublishedListings } from "@/lib/listings";
import { photoSrc } from "@/lib/photo";
import { prisma } from "@/lib/prisma";

// Refresh the homepage (featured listings + live stats) every 5 minutes.
export const revalidate = 300;

const TYPE_LABEL: Record<string, string> = {
  ROOM: "Room", BEDSPACE: "Bedspace", STUDIO: "Studio", CONDO: "Condo",
  APARTMENT: "Apartment", HOUSE: "House", TOWNHOUSE: "Townhouse", DORMITORY: "Dormitory",
};
const peso = (n: number) => "₱" + n.toLocaleString("en-PH");

export default async function Home() {
  const listings = await getPublishedListings({ take: 6 });
  const [verifiedListings, verifiedOwners] = await Promise.all([
    prisma.listing.count({ where: { listingStatus: "PUBLISHED", verificationStatus: "VERIFIED" } }),
    prisma.user.count({ where: { role: "OWNER", verificationStatus: "VERIFIED" } }),
  ]);
  const hero = listings[0]; // feature a real available unit in the visual
  const fmt = (n: number) => n.toLocaleString("en-PH");

  return (
    <>

      <main id="top">
        {/* HERO */}
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <p className="eyebrow">Balaymo · Move light. Live easy.</p>
              <h1>Find a place you can&nbsp;actually <em>settle into.</em></h1>
              <p className="lede">Cozy homes for the long stay — priced by the month, never by the night.</p>

              <form className="searchcard" action="/rentals" method="get" aria-label="Search rentals">
                <div className="searchrow">
                  <div className="field">
                    <label htmlFor="city">Where</label>
                    <select id="city" name="city">
                      <option value="">Any city</option>
                      <option>Quezon City</option><option>Makati</option><option>Taguig</option>
                      <option>Cebu City</option><option>Davao City</option><option>Baguio</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="minLease">Lease length</label>
                    <select id="minLease" name="minLease">
                      <option value="">Any</option>
                      <option value="3">3 months+</option><option value="6">6 months+</option>
                      <option value="12">1 year+</option><option value="24">2 years+</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="maxRent">Monthly budget</label>
                    <select id="maxRent" name="maxRent">
                      <option value="">Any</option>
                      <option value="10000">Up to ₱10k</option><option value="20000">Up to ₱20k</option>
                      <option value="35000">Up to ₱35k</option><option value="60000">Up to ₱60k</option>
                    </select>
                  </div>
                  <div className="field-go">
                    <button className="btn btn-primary" type="submit">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
                      Search
                    </button>
                  </div>
                </div>
              </form>

              <div className="trustline">
                <span><span className="dot" /> Verified owners</span>
                <span><span className="dot" /> From 3 months</span>
                <span><span className="dot" /> Monthly rent, never nightly</span>
                <span><span className="dot" /> Admin-reviewed listings</span>
              </div>
            </div>

            {/* hero visual — a real available unit */}
            <div className="hero-visual">
              <div className="blob" style={{ width: 280, height: 280, background: "var(--mist)", right: 0, top: 30 }} />
              <div className="blob" style={{ width: 200, height: 200, background: "var(--gold-soft)", left: 30, bottom: 0 }} />
              {hero ? (
                <a className="float card-main" href={`/rentals/${hero.id}`}>
                  {hero.verificationStatus === "VERIFIED" && (
                    <div className="seal"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5" /></svg>Verified unit</div>
                  )}
                  <div
                    className="thumb"
                    style={{
                      background: "linear-gradient(135deg,#2E6B53,#13322A)",
                      ...(hero.photos[0] ? { backgroundImage: `linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.35)),url('${photoSrc(hero.photos[0].photoUrl)}')`, backgroundSize: "cover", backgroundPosition: "center" } : {}),
                    }}
                  >
                    <span className="pill">📍 {hero.city} · {hero.barangay}</span>
                  </div>
                  <div className="body">
                    <div className="ttl">{hero.title}</div>
                    <div className="loc">{TYPE_LABEL[hero.propertyType]} · {hero.bedrooms} br · {hero.minimumLeaseMonths} mo min</div>
                    <div className="price">{peso(hero.monthlyRent)} <small>/ month</small></div>
                  </div>
                </a>
              ) : (
                <div className="float card-main">
                  <div className="thumb" style={{ background: "linear-gradient(135deg,#2E6B53,#13322A)" }} />
                  <div className="body"><div className="ttl">Verified homes, from 3 months</div><div className="loc">New listings added daily</div></div>
                </div>
              )}
              <div className="float card-mini" aria-hidden="true">
                <div className="row">
                  <div className="avatar"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M5 20a7 7 0 0 1 14 0" /></svg></div>
                  <div><div className="nm">Verified Keyholder</div><div className="sub">ID &amp; ownership confirmed</div></div>
                </div>
                <div className="meter">
                  <div className="meter-bar"><i style={{ width: "92%" }} /></div>
                  <div className="meter-label"><span>Trust profile</span><span>Strong</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST STRIP */}
        <div className="strip">
          <div className="wrap strip-in">
            <div className="stat"><div className="k tabular">{fmt(verifiedListings)}</div><div className="l">Verified listings</div></div>
            <div className="stat"><div className="k tabular">{fmt(verifiedOwners)}</div><div className="l">ID-checked owners</div></div>
            <div className="stat"><div className="k tabular">3<em>mo</em></div><div className="l">Minimum lease, always</div></div>
            <div className="stat"><div className="k tabular">₱0</div><div className="l">Broker success fees</div></div>
          </div>
        </div>

        {/* LISTINGS */}
        <section id="listings">
          <div className="wrap">
            <div className="sec-head">
              <p className="eyebrow">Homes available now</p>
              <h2>Browse verified rentals</h2>
              <p>Every home here is listed by an identity-checked owner and reviewed before it goes public.</p>
            </div>
            <div className="grid" style={{ marginTop: 30 }}>
              {listings.map((l) => (
                <ListingCard key={l.id} l={{ ...l, monthlyRent: Number(l.monthlyRent), floorArea: l.floorArea ? Number(l.floorArea) : null }} />
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <a className="btn btn-ghost btn-lg" href="/rentals">See all homes</a>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="how">
          <div className="wrap">
            <div className="sec-head">
              <p className="eyebrow">For tenants</p>
              <h2>Three steps to a place that&apos;s yours</h2>
              <p>You talk to owners directly. Balaymo gives you the tools and the checks — it never negotiates or decides for either side.</p>
            </div>
            <div className="steps">
              <div className="step"><div className="num">1</div><h3>Search &amp; shortlist</h3><p>Filter by city, barangay, rent and lease length. Save the homes worth a second look.</p></div>
              <div className="step"><div className="num">2</div><h3>Inquire with the owner</h3><p>Send your move-in date, intended lease length and a message. Verified badges show who you&apos;re talking to.</p></div>
              <div className="step"><div className="num">3</div><h3>Apply with confidence</h3><p>Submit your details and documents securely. You consent to exactly what&apos;s processed.</p></div>
            </div>
          </div>
        </section>

        {/* OWNER BAND */}
        <section id="owner">
          <div className="wrap">
            <div className="owner">
              <div>
                <p className="eyebrow">Become a Keyholder</p>
                <h2>List your unit. Reach tenants who plan to stay.</h2>
                <p>Any account can rent. To list, you verify once and become a <strong>Keyholder</strong> — built for owners who want serious, longer-term tenants, not nightly turnover.</p>
                <ul>
                  <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6 9 17l-5-5" /></svg> Earn the Keyholder badge after a one-time ID and ownership check</li>
                  <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6 9 17l-5-5" /></svg> Set your own rent, deposit, rules and minimum lease</li>
                  <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6 9 17l-5-5" /></svg> Review inquiries and applications on your terms</li>
                </ul>
              </div>
              <div className="owner-cta">
                <a className="btn btn-primary btn-lg" href="/keyholder">Become a Keyholder</a>
                <a className="btn btn-ghost btn-lg" href="/owner">See how it works</a>
                <p className="note">Free plan includes 1 active listing. No success commission, ever.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand">
              <a className="brand" href="/">
                <img className="mark" src="/logo-mark.png" alt="" width="30" height="30" />
                Balaymo
              </a>
              <p>A medium and long-term residential rental marketplace for the Philippines. Verified owners, monthly pricing, leases from 3 months.</p>
            </div>
            <div><h4>Explore</h4><a href="/rentals">Browse homes</a><a href="/rentals">Near review centers</a><a href="/rentals">For students</a></div>
            <div><h4>Owners</h4><a href="/keyholder">List a property</a><a href="/owner">Verification</a><a href="/owner">Owner guide</a></div>
            <div><h4>Account</h4><a href="/login">Log in</a><a href="/signup">Sign up</a><a href="/dashboard">Dashboard</a></div>
          </div>
          <p className="disclaimer">
            Balaymo helps owners and tenants connect for medium and long-term residential rentals starting from 3 months and above. The platform does not own, operate, inspect, guarantee, or broker the listed properties unless expressly stated, and does not act as a real estate broker, legal adviser, or property manager. Owners are responsible for the accuracy, legality, and availability of their listings.
          </p>
          <div className="foot-base">
            <span>© 2026 Balaymo. A listing &amp; rental-management platform.</span>
            <span><a href="/terms">Terms</a> · <a href="/privacy">Privacy</a> · Made for the long stay 🇵🇭</span>
          </div>
        </div>
      </footer>
    </>
  );
}
