import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PointageSN 🇸🇳 • Gestion des Absences & Alertes WhatsApp",
  description:
    "Application de pointage en temps réel et notification instantanée WhatsApp pour les écoles et lycées sénégalais.",
  keywords: [
    "PointageSN",
    "Sénégal",
    "Gestion scolaire",
    "Absences",
    "Retards",
    "WhatsApp",
    "Vie scolaire",
  ],
  authors: [{ name: "PointageSN Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#020617",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen selection:bg-emerald-500 selection:text-white flex flex-col">
        {children}
      </body>
    </html>
  );
}
