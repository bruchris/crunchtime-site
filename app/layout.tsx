import type { Metadata } from "next";

// Minimal root layout — locale-specific UI lives in app/[locale]/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL("https://crunchtime.no")
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
