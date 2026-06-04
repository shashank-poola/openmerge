"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function SignInCard() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md border border-gray-200 rounded-xl p-10 shadow-sm">

        <h2
          className="text-3xl text-center text-gray-950 mb-2"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Welcome Back
        </h2>
        <p
          className="text-center text-gray-500 text-sm mb-8"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 400 }}
        >
          Sign in to your PullRabbit account
        </p>

        <Button
          onClick={() => signIn("github", { callbackUrl: "/" })}
          className="w-full bg-gradient-to-t from-[#0700FF] to-[#5661F9] hover:opacity-90 text-white py-5 text-base rounded-lg transition-opacity flex items-center justify-center gap-3"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Sign in with GitHub
        </Button>

        <p
          className="text-center text-gray-400 text-xs mt-6"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 400 }}
        >
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
