import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "@fontsource-variable/google-sans";
import "./globals.css";
import Providers from "@/components/Providers";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bricolage-grotesque",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OpenMerge - AI PR Review Agents",
  description:
    "Parallel AI code review agents that inspect pull requests, flag issues, and prepare merge-ready summaries.",
  icons: {
    icon: "/companies/openmerge.png",
    shortcut: "/companies/openmerge.png",
    apple: "/companies/openmerge.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${bricolage.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
