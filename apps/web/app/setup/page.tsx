import { Suspense } from "react";
import { SetupCallbackPage } from "@/components/setup/SetupCallbackPage";

export const metadata = { title: "Activating OpenMerge…" };

export default function SetupPage() {
  return (
    <Suspense>
      <SetupCallbackPage />
    </Suspense>
  );
}
