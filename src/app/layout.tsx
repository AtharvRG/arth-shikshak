// src/app/layout.tsx - VERIFY THIS STRUCTURE
"use client";
import React from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import SessionProvider from './SessionProvider';
import { LoadingProvider } from '@/context/LoadingContext';
// import { ThemeProvider } from '@/context/ThemeContext'; // Make sure this is imported
import LoadingIndicator from '@/components/layout/LoadingIndicator';
import { NavigationEvents } from '@/components/layout/NavigationEvents';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// No metadata export

export default function RootLayout({ children }: { children: React.ReactNode; }) {
  return (

        <html lang="en" className={cn(inter.variable, "dark")} suppressHydrationWarning>
            <body className={cn( "font-sans", "bg-background text-foreground", "min-h-screen antialiased" )}>
                <SessionProvider>
                    <LoadingProvider>
                       <NavigationEvents />
                       {children}
                       <LoadingIndicator />
                    </LoadingProvider>
                </SessionProvider>
            </body>
        </html>
  );
}