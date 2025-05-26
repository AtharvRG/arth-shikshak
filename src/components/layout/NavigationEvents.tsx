// src/components/layout/NavigationEvents.tsx
"use client";

import React, { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLoading } from '@/context/LoadingContext';

function PathnameListener() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { stopLoading } = useLoading();

    useEffect(() => {
        // Tell stopLoading this is due to a route change
        console.log("NavigationEvents detected change, calling stopLoading:", pathname);
        stopLoading(true); // Pass true here
    }, [pathname, searchParams, stopLoading]);

    return null;
}

export function NavigationEvents() {
  return (
    <Suspense fallback={null}>
      <PathnameListener />
    </Suspense>
  );
}