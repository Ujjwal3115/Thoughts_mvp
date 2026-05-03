import type { Metadata } from "next";
import { Outfit, Lora, Special_Elite } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});

const specialElite = Special_Elite({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-sketch",
});

export const metadata: Metadata = {
  title: "Thoughts | Your path to emotional balance.",
  description: "A personalized AI diary that understands your emotions. Write, speak, and visualize your mental wellness journey.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${lora.variable} ${specialElite.variable} antialiased`}
        style={{ fontFamily: "'Courier New', 'Courier', monospace" }}
      >
        {children}
      </body>
    </html>
  );
}