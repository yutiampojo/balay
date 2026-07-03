import { PageHeadSkeleton, PanelSkeleton } from "@/app/components/Skeletons";

export default function MessagesLoading() {
  return (
    <>
      <PageHeadSkeleton />
      <main className="wrap" style={{ paddingBottom: 64 }}>
        <div className="sk-chat">
          <div className="sk-chat-list">
            <PanelSkeleton rows={4} />
          </div>
          <div className="sk-chat-thread">
            <PanelSkeleton rows={6} />
          </div>
        </div>
      </main>
    </>
  );
}
