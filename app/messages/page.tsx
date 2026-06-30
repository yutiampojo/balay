import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SiteNav from "@/app/components/SiteNav";
import { sendMessage } from "./actions";

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
      listing: { select: { title: true } },
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
      <SiteNav current="messages" />
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
              return (
                <a key={cv.id} href={`/messages?c=${cv.id}`} className={`conv${active?.id === cv.id ? " active" : ""}`}>
                  <span className="avatar">{initials(o.fullName)}</span>
                  <span className="cv-body">
                    <span className="cv-top">
                      <span className="cv-name">{o.fullName}</span>
                      {last && <span className="cv-time">{timeLabel(last.createdAt)}</span>}
                    </span>
                    {cv.listing && <span className="cv-prop">{cv.listing.title}</span>}
                    <span className="cv-last">{last ? (last.senderId === user.id ? "You: " : "") + last.body : "No messages yet"}</span>
                  </span>
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
                  {active.listing && <div className="ch-sub">{active.listing.title}</div>}
                </div>
              </div>
              <div className="chat-body">
                {active.messages.length === 0 && <div className="chat-empty">Say hello 👋</div>}
                {active.messages.map((m) => (
                  <div key={m.id} className={`msg ${m.senderId === user.id ? "out" : "in"}`}>
                    {m.body}
                    <span className="t">{timeLabel(m.createdAt)}</span>
                  </div>
                ))}
              </div>
              <form className="chat-composer" action={sendMessage}>
                <input type="hidden" name="conversationId" value={active.id} />
                <textarea name="body" rows={1} placeholder="Write a message…" required />
                <button className="chat-send" type="submit" aria-label="Send">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </>
  );
}
