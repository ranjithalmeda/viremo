"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

import { MobileFontInitializer } from "@/src/components/mobile-font-initializer";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <MobileFontInitializer />
      {children}
    </SessionProvider>
  );
}
