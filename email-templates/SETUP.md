# Balaymo — Production email setup (Resend + Supabase SMTP)

Domain: **balaymo.com** (registered at Porkbun — manage DNS in Porkbun's
**Details → DNS Records**). Sending subdomain: **send.balaymo.com** (keeps email
reputation separate from the website, which uses the root domain on Vercel).

Goal: branded, authenticated Balaymo emails (reset / confirm / magic link) with no
rate limit. No app code changes — only Resend, Porkbun DNS, and Supabase.

---

## Your values (fill these into the dashboards)
| Thing | Value |
|---|---|
| Sending subdomain | `send.balaymo.com` |
| Sender email | `noreply@send.balaymo.com` |
| Sender name | `Balaymo` |
| SMTP host | `smtp.resend.com` |
| SMTP port | `465` |
| SMTP username | `resend` |
| SMTP password | your Resend `re_…` API key (sending-only) |
| Site URL | `https://balaymo.com` |
| Redirect URLs | `https://balaymo.com/**` and `http://localhost:3000/**` |

---

## 1. Resend — verify the sending subdomain
1. resend.com → **Domains → Add Domain** → `send.balaymo.com`.
2. In **Porkbun → balaymo.com → DNS Records**, add exactly what Resend shows
   (host/region come from their UI):
   - **MX** on `send` → `feedback-smtp.<region>.amazonses.com` (priority 10)
   - **TXT (SPF)** on `send` → `v=spf1 include:amazonses.com ~all`
   - **TXT (DKIM)** → the `resend._domainkey…` record they give you
3. Add **DMARC** yourself in Porkbun — **TXT** on host `_dmarc`:
   - Start: `v=DMARC1; p=none; rua=mailto:dmarc@balaymo.com`
   - After ~1 week of clean reports → `p=quarantine`, later `p=reject`.
4. Wait for Resend to show **Verified** (all records green — usually minutes on Porkbun).

## 2. Resend — API key (this is the SMTP password)
**API Keys → Create** → **Sending access** only → copy the `re_…` value.

## 3. Supabase → Authentication → Emails → SMTP Settings → Enable Custom SMTP
Paste the values from the table above.

## 4. Supabase → Authentication → Email Templates
Paste the HTML from this folder (keep `{{ .ConfirmationURL }}`):
- **Reset Password** → `reset-password.html`
- **Confirm signup** → `confirm-signup.html`
- **Magic Link** → `magic-link.html`

## 5. Supabase → Authentication → URL Configuration
- **Site URL** → `https://balaymo.com`
- **Redirect URLs** → add `https://balaymo.com/**` (keep `http://localhost:3000/**`)
  - This is what lets the reset link land on `/reset-password` in production.

## 6. Supabase → Authentication → Rate Limits
- Raise **emails per hour** (e.g. 30–100+). The tiny default only applied to the
  built-in sender; custom SMTP lifts it.

## 7. Verify
- Trigger `/forgot-password` → branded email from `noreply@send.balaymo.com` →
  link opens the "Set a new password" form.
- Watch **Resend → Logs** for delivery; review DMARC reports before tightening.

---

### Notes
- The website (balaymo.com root) will point at Vercel later — that's separate
  DNS (A/CNAME) from the email records above (which live on the `send` subdomain).
- The `re_…` key is a secret: set it only in Resend + Supabase. Never commit it;
  it doesn't go in `.env` (Supabase sends the mail, not the app).
