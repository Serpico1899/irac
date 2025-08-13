import { redirect } from "next/navigation";
import { defaultLocale } from "@/config/i18n.config";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Since we use localePrefix: "always", redirect root to default locale
  redirect(`/${defaultLocale}`);
}
