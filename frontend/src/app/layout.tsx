import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Image Editor",
  description: "Upload, edit, and download images",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
