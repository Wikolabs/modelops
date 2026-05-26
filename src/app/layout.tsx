import type { Metadata } from "next";
import { Josefin_Sans, Hind } from "next/font/google";
import "./globals.css";

const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  variable: "--font-display",
});

const hind = Hind({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "ModelOps — Entraînez, versionnez, déployez. En 48h.",
  description:
    "Fine-tuning de LLMs, versioning de modèles et MLOps clé en main pour équipes sans data scientist dédié.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${josefinSans.variable} ${hind.variable}`}>
      <body
        style={{
          backgroundColor: "#f0fdf4",
          fontFamily: "var(--font-body)",
          margin: 0,
        }}
      >
        {children}
      </body>
    </html>
  );
}
