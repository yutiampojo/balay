"use client";

import { useEffect, useOptimistic, useRef } from "react";
import { sendMessage, markConversationRead } from "./actions";

type Msg = { id: string; body: string; mine: boolean; time: string; sending?: boolean };

function SingleCheck() {
  return (
    <svg className="tick" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-label="Sending"><path d="M20 6 9 17l-5-5" /></svg>
  );
}
function DoubleCheck() {
  return (
    <svg className="tick" width="18" height="14" viewBox="0 0 30 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-label="Sent"><path d="M2 13l4 4 9-11" /><path d="M12 17l1 1 9-11" /></svg>
  );
}

export default function ChatThread({ conversationId, messages }: { conversationId: string; messages: Msg[] }) {
  const [optimistic, addOptimistic] = useOptimistic<Msg[], string>(messages, (state, body) => [
    ...state,
    { id: `temp-${Date.now()}`, body, mine: true, time: "Sending…", sending: true },
  ]);

  const bodyRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [optimistic.length]);

  // mark inbound messages read when this conversation is opened
  useEffect(() => {
    markConversationRead(conversationId);
  }, [conversationId]);

  return (
    <>
      <div className="chat-body" ref={bodyRef}>
        {optimistic.length === 0 && <div className="chat-empty">Say hello 👋</div>}
        {optimistic.map((m) => (
          <div key={m.id} className={`msg ${m.mine ? "out" : "in"}`}>
            {m.body}
            <span className="t">
              {m.time}
              {m.mine && (m.sending ? <SingleCheck /> : <DoubleCheck />)}
            </span>
          </div>
        ))}
      </div>

      <form
        ref={formRef}
        className="chat-composer"
        action={async (fd) => {
          const body = String(fd.get("body") || "").trim();
          if (!body) return;
          addOptimistic(body);
          formRef.current?.reset();
          await sendMessage(fd);
        }}
      >
        <input type="hidden" name="conversationId" value={conversationId} />
        <textarea
          name="body"
          rows={1}
          placeholder="Write a message…  (Enter to send, Shift+Enter for new line)"
          required
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (e.currentTarget.value.trim()) e.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <button className="chat-send" type="submit" aria-label="Send">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
        </button>
      </form>
    </>
  );
}
