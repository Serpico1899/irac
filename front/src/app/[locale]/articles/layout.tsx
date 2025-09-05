import { ReactNode } from "react";

// Force dynamic rendering to prevent prerender issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ArticlesLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function ArticlesLayout({
  children,
  params,
}: ArticlesLayoutProps) {
  return <>{children}</>;
}
