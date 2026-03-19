import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./(public)/globals.css";
import "react-day-picker/dist/style.css";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ECE651 Trips",
  description: "Trip planner workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          precedence="default"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0,0"
        />
      </head>
      {/* suppressHydrationWarning: browser extensions (e.g. Grammarly) mutate <body> attrs */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-y-scroll`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
