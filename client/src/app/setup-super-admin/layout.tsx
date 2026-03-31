import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configuration super administrateur",
  robots: { index: false, follow: false },
};

export default function SetupSuperAdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
