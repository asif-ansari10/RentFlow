"use client";
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import RentsClient from "./RentsClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center pt-24">Loading rents...</div>}>
      <RentsClient />
    </Suspense>
  );
}
