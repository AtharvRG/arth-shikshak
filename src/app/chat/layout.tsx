// src/app/chat/layout.tsx
import React from 'react';
import Navbar from '@/components/layout/Navbar'; // Import the main Navbar
import ChatHistorySidebar from '@/components/chat/ChatHistorySidebar'; // Import the Sidebar

// Optional: Metadata specific to chat sections
export const metadata = {
  title: 'Chat - Arth Shikshak',
  description: 'Chat with your AI financial assistant.',
};

export default function ChatLayout({
  children, // This will be the content of the specific page (e.g., page.tsx or [chatId]/page.tsx)
}: {
  children: React.ReactNode;
}) {
  return (
    // Main container using Flexbox for sidebar + main content layout
    <div className="flex h-screen w-full bg-neutral-950 text-white overflow-hidden">

      {/* Sidebar Component */}
      {/* This component should handle its own width and styling */}
      <ChatHistorySidebar />

      {/* Main Content Area (Navbar + Page Content) */}
      <div className="flex flex-col flex-1 h-full overflow-hidden"> {/* Use flex-1 to take remaining space */}

         {/* Application Navbar */}
         {/* Positioned sticky at the top of the main content area */}
         <Navbar />

         {/* Page Content */}
         {/* Render the specific page component passed as children */}
         {/* flex-1 and overflow-hidden allow the child page to control its own scrolling */}
         <div className="flex-1 overflow-hidden">
             {children}
         </div>

      </div>
    </div>
  );
}