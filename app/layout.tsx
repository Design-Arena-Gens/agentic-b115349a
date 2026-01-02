import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prothom Alo Letter Planner",
  description:
    "Craft thoughtful letters and opinion pieces tailored for Prothom Alo's editorial standards."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}
