// src/app/SessionProvider.tsx
"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import React from "react";

// Re-export SessionProvider to allow usage in Server Components if needed later
// Or simply use this directly in layout.tsx
export default function SessionProvider({
  children,
  session // Optional: Pass initial session data if using SSR/getInitialProps
}: {
  children: React.ReactNode;
  session?: any; // Use appropriate Session type from next-auth if needed
}) {
  return (
      <NextAuthSessionProvider session={session}>
          {children}
      </NextAuthSessionProvider>
  );
}