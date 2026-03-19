import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Praedium — Credit Risk Intelligence",
  description: "Probability of default prediction for commercial real estate loans",
  openGraph: {
    title: "Praedium — Credit Risk Intelligence",
    description: "Probability of default prediction for commercial real estate loans",
    images: [{ url: "https://praedium.dev/og_image.png" }],
    url: "https://praedium.dev",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0d14] text-slate-200">
        {children}
      </body>
    </html>
  );
}
