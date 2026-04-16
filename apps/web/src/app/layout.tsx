import React from "react";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: {
    default: "SizweOS — National Infrastructure Intelligence Platform",
    template: "%s | SizweOS",
  },
  description:
    "The sovereign national OS for South Africa. AI-driven infrastructure monitoring, multi-agency coordination, and civic intelligence.",
  keywords: ["South Africa", "CivicOS", "SizweOS", "infrastructure", "municipal", "AI", "governance"],
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-[#0F0F13] text-white antialiased">
        <Providers>{children}</Providers>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1E1E28",
              color: "#F2F2F7",
              border: "1px solid #2E2E3E",
              borderRadius: "12px",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#007A4D", secondary: "#fff" } },
            error: { iconTheme: { primary: "#EF4444", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
