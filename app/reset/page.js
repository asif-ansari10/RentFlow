import dynamic from "next/dynamic";
import { Suspense } from "react";

const ResetPassword = dynamic(() => import("@/components/ResetPassword"), {
  ssr: false,
});

export default function ResetPage() {
  return (
    <Suspense fallback={<div className="text-center pt-24">Loading...</div>}>
      <ResetPassword />
    </Suspense>
  );
}
