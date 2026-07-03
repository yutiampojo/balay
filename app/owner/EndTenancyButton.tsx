"use client";

import { useRef } from "react";
import { endTenancy } from "./actions";

export default function EndTenancyButton({ tenancyId }: { tenancyId: string }) {
  const reasonRef = useRef<HTMLInputElement>(null);
  return (
    <form
      action={endTenancy}
      onSubmit={(e) => {
        const reason = window.prompt(
          "End this tenancy and re-open the listing to renters?\n\nOptional — note a reason (e.g. “Tenant left early”):",
          ""
        );
        if (reason === null) {
          e.preventDefault(); // cancelled
          return;
        }
        if (reasonRef.current) reasonRef.current.value = reason;
      }}
    >
      <input type="hidden" name="tenancyId" value={tenancyId} />
      <input type="hidden" name="reason" ref={reasonRef} value="" />
      <button className="btn btn-gold btn-sm" type="submit">End tenancy</button>
    </form>
  );
}
