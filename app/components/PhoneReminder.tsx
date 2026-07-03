import { getCurrentUser } from "@/lib/auth";
import { phoneStatus } from "@/lib/phone";

// Proactive prompt to (re)verify a contact number. Renders nothing if the
// user's number is currently verified.
export default async function PhoneReminder() {
  const user = await getCurrentUser();
  if (!user) return null;
  const st = phoneStatus(user.phoneNumber, user.phoneVerifiedAt);
  if (st === "verified") return null;

  return (
    <div className="wrap" style={{ marginBottom: 20 }}>
      <div className="banner gold">
        <span className="ico"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg></span>
        <div className="grow">
          {st === "expired"
            ? "It's been a while — please confirm your contact number is still current (we ask every 3 months)."
            : "Add a contact number so keyholders and applicants can reach you."}
        </div>
        <a className="btn btn-gold btn-sm" href="/profile">{st === "expired" ? "Reconfirm" : "Add number"}</a>
      </div>
    </div>
  );
}
