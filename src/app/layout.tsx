import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Redis GUI",
  description: "A modern Redis GUI client for macOS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}