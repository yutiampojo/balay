import { PageHeadSkeleton, ListingGridSkeleton } from "@/app/components/Skeletons";

// Page-content skeleton only — the nav lives in the root layout and stays put.
export default function RentalsLoading() {
  return (
    <>
      <PageHeadSkeleton />
      <main className="wrap" style={{ paddingBottom: 64 }}>
        <div className="rentals-toolbar">
          <div className="sk sk-line" style={{ width: "100%", maxWidth: 520, height: 44, borderRadius: 12 }} />
        </div>
        <ListingGridSkeleton />
      </main>
    </>
  );
}
