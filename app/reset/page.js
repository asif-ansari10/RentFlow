"use client";

export const dynamic = "force-dynamic";

import dynamicImport from "next/dynamic";
import { Suspense } from "react";

const ResetPassword = dynamicImport(
  () => import("@/components/ResetPassword"),
  { ssr: false }
);

export default function ResetPage() {
  return (
    <Suspense fallback={<div className="text-center pt-24">Loading...</div>}>
      <ResetPassword />
    </Suspense>
  );
}
