import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import PhoneForm from "./PhoneForm";
import AvatarUpload from "./AvatarUpload";
import DeleteUserButton from "@/app/components/DeleteUserButton";
import VerificationCard from "./VerificationCard";
import { phoneStatus, daysUntilExpiry } from "@/lib/phone";

const initialsOf = (name: string) => name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export const dynamic = "force-dynamic";

const cap = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/profile");

  const status = phoneStatus(user.phoneNumber, user.phoneVerifiedAt);
  const daysLeft = daysUntilExpiry(user.phoneVerifiedAt);

  const statusBadge =
    status === "verified" ? <span className="status ok">Current</span>
    : status === "expired" ? <span className="status rejected">Needs update</span>
    : <span className="status pending">Not set</span>;

  return (
    <>
      <div className="wrap pagehead">
        <h1>Your profile</h1>
        <p>Manage your account details and keep your contact number active.</p>
      </div>

      <main className="wrap-narrow" style={{ padding: "8px 24px 56px" }}>
        {(status === "none" || status === "expired") && (
          <div className="banner gold" style={{ marginBottom: 20 }}>
            <span className="ico"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8"><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.6 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0z" /></svg></span>
            <div className="grow">
              {status === "expired"
                ? "It's been a while — please confirm your contact number is still current (we ask every 3 months)."
                : "Add a contact number so keyholders and applicants can reach you."}
            </div>
          </div>
        )}

        {/* profile photo */}
        <div className="card card-pad" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 14 }}>Profile photo</h3>
          <AvatarUpload currentUrl={user.profilePhotoUrl} initials={initialsOf(user.fullName)} />
        </div>

        {/* account */}
        <div className="card card-pad" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 14 }}>Account</h3>
          <div className="spec-list">
            <div className="it"><span>Full name</span><span>{user.fullName}</span></div>
            <div className="it"><span>Email</span><span>{user.email}</span></div>
            <div className="it"><span>Role</span><span>{cap(user.role)}</span></div>
            <div className="it"><span>Account status</span><span>{cap(user.verificationStatus.replace(/_/g, " "))}</span></div>
          </div>
          <p className="muted" style={{ fontSize: ".8rem", marginTop: 12 }}>Your email is managed through your login and can&apos;t be changed here.</p>
        </div>

        {/* identity verification */}
        <VerificationCard status={user.verificationStatus} userId={user.id} />

        {/* contact number */}
        <div className="card card-pad">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <h3>Contact number</h3>
            {statusBadge}
          </div>
          {user.phoneNumber ? (
            <p className="muted" style={{ marginBottom: 4 }}>
              On file: <strong style={{ color: "var(--ink)" }}>{user.phoneNumber}</strong>
              {status === "verified" && daysLeft !== null && <> · reconfirm in {daysLeft} day{daysLeft === 1 ? "" : "s"}</>}
            </p>
          ) : (
            <p className="muted" style={{ marginBottom: 4 }}>No number on file yet.</p>
          )}
          <p className="hint" style={{ marginBottom: 18 }}>Keep your number up to date — we ask you to reconfirm it every 3 months.</p>
          <PhoneForm currentPhone={user.phoneNumber} needsReconfirm={status === "expired"} />
        </div>

        {/* danger zone */}
        <div className="card card-pad" style={{ marginTop: 20, borderColor: "var(--danger-soft)" }}>
          <h3 style={{ marginBottom: 6 }}>Delete account</h3>
          <p className="muted" style={{ marginBottom: 16, lineHeight: 1.6 }}>
            Permanently delete your Balaymo account and everything tied to it — listings, applications, inquiries,
            messages, saved homes, and tenancy records. This can&apos;t be undone.
          </p>
          <DeleteUserButton userId={user.id} self />
        </div>
      </main>
    </>
  );
}
