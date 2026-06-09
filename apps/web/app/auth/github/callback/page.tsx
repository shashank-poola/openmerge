import { Suspense } from "react";
import { GithubCallbackPage } from "@/components/auth/GithubCallbackPage";

export default function Page() {
  return (
    <Suspense>
      <GithubCallbackPage />
    </Suspense>
  );
}
