import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppProviders from "@/components/AppProviders";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { STORE } from "@/lib/store";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteDescription =
  "Compra máquinas de coser, fileteadoras, bordadoras y accesorios con envío rápido y garantía en Colombia.";

export const metadata: Metadata = {
  title: `${STORE.name} | Máquinas de coser e insumos textiles`,
  description: siteDescription,
  metadataBase: new URL("https://senalmaq.com"),
  openGraph: {
    title: `${STORE.name} | Máquinas de coser e insumos textiles`,
    description: siteDescription,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)] text-sm`}
      >
        <AppProviders>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
