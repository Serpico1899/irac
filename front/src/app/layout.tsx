import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IRAC | Islamic Architecture Center",
  description: "The online home of the Islamic Architecture Center",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
