import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PointageSN • Gestion Scolaire & Alertes WhatsApp",
  description:
    "Plateforme SaaS de gestion instantanée des présences scolaires et notification automatique WhatsApp pour les établissements d'enseignement.",
  keywords: [
    "PointageSN",
    "Sénégal",
    "Gestion scolaire",
    "Absences",
    "Retards",
    "WhatsApp",
    "Vie scolaire",
  ],
  authors: [{ name: "PointageSN" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="light">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
