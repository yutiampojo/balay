import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ChatThread from "./ChatThread";
import ReportButton from "@/app/components/ReportButton";

export const dynamic = "force-dynamic";

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}
function timeLabel(d: Date) {
  return new Date(d).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { c } = await searchParams;

  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ participantAId: user.id }, { participantBId: user.id }] },
    orderBy: { lastMessageAt: "desc" },
    include: {
      listing: { select: { id: true, title: true, city: true, barangay: true, monthlyRent: true } },
      participantA: { select: { id: true, fullName: true } },
      participantB: { select: { id: true, fullName: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  const active = conversations.find((cv) => cv.id === c) ?? conversations[0];
  const other = (cv: (typeof conversations)[number]) =>
    cv.participantAId === user.id ? cv.participantB : cv.participantA;

  return (
    <>
      <div className="chat" style={{ height: "calc(100vh - 70px)" }}>
        {/* inbox */}
        <aside className="chat-list">
          <div className="lhead"><h2>Messages</h2></div>
          <div className="conv-list">
            {conversations.length === 0 && (
              <div className="chat-empty">
                <p>No conversations yet.</p>
                <a className="btn btn-primary btn-sm" href="/rentals" style={{ marginTop: 12 }}>Browse homes</a>
              </div>
            )}
            {conversations.map((cv) => {
              const o = other(cv);
              const last = cv.messages[cv.messages.length - 1];
              const unread = cv.messages.filter((m) => m.senderId !== user.id && !m.readAt).length;
              const isUnread = unread > 0 && active?.id !== cv.id;
              return (
                <a key={cv.id} href={`/messages?c=${cv.id}`} className={`conv${active?.id === cv.id ? " active" : ""}${isUnread ? " unread" : ""}`}>
                  <span className="avatar">{initials(o.fullName)}</span>
                  <span className="cv-body">
                    <span className="cv-top">
                      <span className="cv-name">{o.fullName}</span>
                      {last && <span className="cv-time">{timeLabel(last.createdAt)}</span>}
                    </span>
                    {cv.listing && <span className="cv-prop">{cv.listing.title}</span>}
                    <span className="cv-last">{last ? (last.senderId === user.id ? "You: " : "") + last.body : "No messages yet"}</span>
                  </span>
                  {isUnread && <span className="cv-unread" aria-label={`${unread} unread`}>{unread}</span>}
                </a>
              );
            })}
          </div>
        </aside>

        {/* thread */}
        <section className="chat-main">
          {!active ? (
            <div className="chat-empty">Select a conversation</div>
          ) : (
            <>
              <div className="chat-head">
                <span className="avatar">{initials(other(active).fullName)}</span>
                <div>
                  <div className="ch-name">{other(active).fullName}</div>
                  <div className="ch-sub">Conversation</div>
                </div>
                <div className="chat-head-actions">
                  <ReportButton kind="user" reportedUserId={other(active).id} targetLabel={other(active).fullName.split(" ")[0]} className="report-link report-link-sm" />
                </div>
              </div>
              {active.listing && (
                <a className="chat-listing" href={`/rentals/${active.listing.id}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l9-7 9 7M5 10v10h14V10" /></svg>
                  <span className="cl-body">
                    <span className="cl-label">Inquiry about this listing</span>
                    <span className="cl-title">{active.listing.title}</span>
                    <span className="cl-meta">{active.listing.city} · {active.listing.barangay} · ₱{Number(active.listing.monthlyRent).toLocaleString("en-PH")}/mo</span>
                  </span>
                  <span className="cl-view">View →</span>
                </a>
              )}
              <ChatThread
                conversationId={active.id}
                messages={active.messages.map((m) => ({ id: m.id, body: m.body, mine: m.senderId === user.id, time: timeLabel(m.createdAt) }))}
              />
            </>
          )}
        </section>
      </div>
    </>
  );
}
