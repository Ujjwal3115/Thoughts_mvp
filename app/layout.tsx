import type { Metadata } from "next";
import { Outfit, Lora } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});

export const metadata: Metadata = {
  title: "Thoughts | Your Cognitive Mirror",
  description: "A personalized AI diary.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${lora.variable} font-sans antialiased`}
      >
        {/* We wrap everything in a max-w-3xl to keep the UI intimate and not stretched out */}
        <main className="max-w-3xl mx-auto min-h-screen px-6 py-12">
          {children}
        </main>
      </body>
    </html>
  );
}