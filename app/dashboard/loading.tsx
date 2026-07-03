import { PageHeadSkeleton, ListingGridSkeleton } from "@/app/components/Skeletons";

export default function DashboardLoading() {
  return (
    <>
      <PageHeadSkeleton />
      <main className="wrap" style={{ paddingBottom: 64 }}>
        <ListingGridSkeleton count={6} />
      </main>
    </>
  );
}
