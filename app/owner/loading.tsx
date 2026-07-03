import { PageHeadSkeleton, PanelSkeleton } from "@/app/components/Skeletons";

export default function OwnerLoading() {
  return (
    <>
      <PageHeadSkeleton />
      <main className="wrap" style={{ paddingBottom: 64, display: "grid", gap: 18, marginTop: 8 }}>
        <PanelSkeleton rows={3} />
        <PanelSkeleton rows={2} />
      </main>
    </>
  );
}
