// src/components/layout/Navbar.tsx
"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { FiLogOut, FiUser, FiGrid, FiTarget, FiMessageSquare, FiPieChart } from 'react-icons/fi';
import { cn } from '@/lib/utils';
import CustomLink from '@/components/ui/CustomLink';

export default function Navbar() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const handleSignOut = () => { signOut({ callbackUrl: '/' }); };
    const isLoading = status === "loading";
    const isAuthenticated = status === "authenticated";

    const navLinks = [
        { href: "/chat", label: "Chats", icon: FiMessageSquare },
        { href: "/calculators", label: "Calculators", icon: FiPieChart },
        { href: "/snapshot", label: "Snapshot", icon: FiGrid },
        { href: "/goals", label: "Goals", icon: FiTarget },
        { href: "/profile", label: "Profile", icon: FiUser },
    ];

    return (
        // *** Added higher z-index (e.g., z-50) ***
        <nav className="bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-700/50 px-4 py-3 sticky top-0 z-30 w-full">
            <div className="container mx-auto flex justify-between items-center">
                {/* Brand Link */}
                <CustomLink href="/dashboard" loadingType="fullPage" className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 flex-shrink-0">
                    Arth Shikshak
                </CustomLink>

                {/* Centered Navigation Links */}
                <div className="hidden md:flex flex-1 justify-center items-center space-x-5 md:space-x-8 text-sm font-medium">
                    {navLinks.map(link => (
                         <CustomLink
                            key={link.href} href={link.href} loadingType="fullPage"
                            className={cn( "flex items-center gap-1.5 transition-colors", pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/") ? "text-white font-semibold" : "text-neutral-400 hover:text-white" )} >
                            <link.icon className="w-4 h-4" /> {link.label}
                        </CustomLink>
                    ))}
                </div>

                <div className="flex-shrink-0">
                    {isLoading ? (
                        <span className="text-neutral-500 text-sm">...</span>
                    ) : isAuthenticated ? (
                         <button
                            onClick={handleSignOut}
                            className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/30 px-2 py-1 rounded transition-colors"
                         >
                            <FiLogOut className="w-4 h-4" /> Logout
                        </button>
                    ) : (
                        // Use CustomLink for Login if unauthenticated
                        <CustomLink href="/login" loadingType="fullPage" className="text-sm text-blue-400 hover:text-blue-300">
                             Login
                        </CustomLink>
                    )}
                 </div>
            </div>
             {/* Mobile Nav Links (Optional - Example) */}
             {/* <div className="md:hidden flex justify-around items-center pt-2 border-t border-neutral-800"> ... </div> */}
        </nav>
    );
}