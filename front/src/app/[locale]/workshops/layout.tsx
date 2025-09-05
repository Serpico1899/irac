import { ReactNode } from "react";

// Force dynamic rendering to prevent prerender issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface WorkshopsLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function WorkshopsLayout({
  children,
  params,
}: WorkshopsLayoutProps) {
  return <>{children}</>;
}
