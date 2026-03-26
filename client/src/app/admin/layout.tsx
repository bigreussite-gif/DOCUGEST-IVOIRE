import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administration",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false }
  }
};

export default function AdminLayoutSegment({ children }: { children: React.ReactNode }) {
  return children;
}
