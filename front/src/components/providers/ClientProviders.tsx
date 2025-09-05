"use client";

import { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WalletProvider } from "@/context/WalletContext";
import { ProductProvider } from "@/context/ProductContext";
import { ScoringProvider } from "@/context/ScoringContext";
import { ReferralProvider } from "@/context/ReferralContext";
import { WorkshopProvider } from "@/context/WorkshopContext";

interface ClientProvidersProps {
  children: ReactNode;
  locale: string;
  messages: any;
}

export function ClientProviders({
  children,
  locale,
  messages,
}: ClientProvidersProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AuthProvider>
        <ScoringProvider>
          <WalletProvider>
            <ProductProvider>
              <WorkshopProvider>
                <ReferralProvider>
                  <CartProvider>{children}</CartProvider>
                </ReferralProvider>
              </WorkshopProvider>
            </ProductProvider>
          </WalletProvider>
        </ScoringProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
