import type { Metadata } from "next";

// Todo el panel es privado: ni buscadores ni caché.
export const metadata: Metadata = {
  title: { default: "Panel", template: "%s · Panel CGA" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const dynamic = "force-dynamic";

export default function LayoutPanel({ children }: { children: React.ReactNode }) {
  return children;
}
