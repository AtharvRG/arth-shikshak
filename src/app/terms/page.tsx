// src/app/terms/page.tsx
"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { FiFileText, FiAlertTriangle, FiThumbsUp, FiMail, FiThumbsDown, FiInfo } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Section = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
  <section className="mb-6">
    <h2 className="text-xl font-semibold text-neutral-100 mb-2 flex items-center"><Icon className="w-5 h-5 mr-2 text-blue-400" />{title}</h2>
    <div className="space-y-2 text-neutral-300 text-sm leading-relaxed">{children}</div>
  </section>
);

export default function LightTermsPage() {
  const appName = "Arth Shikshak";
  const contactEmail = "atharv2703123@gmail.com"; // ** REPLACE **
  const lastUpdated = "May 28, 2025"; // ** UPDATE **

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Navbar />
      <main className="flex-1 p-6 md:p-10 lg:p-16">
        <div className="max-w-3xl mx-auto bg-neutral-900/50 border border-neutral-800/70 rounded-xl shadow-2xl p-6 md:p-10">
           <motion.div initial={{ opacity: 0, y:20 }} animate={{ opacity: 1, y:0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2 text-center">
              Our Simple Terms
            </h1>
            <p className="text-center text-xs text-neutral-500 mb-8">Last Updated: {lastUpdated}</p>

            <Section title="Welcome to Arth Shikshak!" icon={FiInfo}>
              <p>These are the basic terms for using {appName}. By using our website and tools, you agree to these terms. If you don&apos;t agree, then please don&apos;t use the site.</p>
              <p>This is a project designed to be a helpful financial companion. Please use it responsibly!</p>
            </Section>

            <Section title="What We Offer (and What We Don't)" icon={FiInfo}>
              <p>{appName} provides financial calculators, an AI chat assistant for financial topics, and tools to help you manage your financial goals and information. Think of it as an educational and organizational tool.</p>
              <p><strong>Important:</strong> The information and AI suggestions provided are for informational purposes only. <strong>They are NOT professional financial, investment, legal, or tax advice.</strong> You are responsible for your own financial decisions. The AI can make mistakes, and information can become outdated. Always consult with qualified human professionals before making significant financial decisions.</p>
            </Section>

            <Section title="Your Account" icon={FiUser}>
              <p>If you create an account, please provide accurate information and keep your password safe. You&apos;re responsible for what happens under your account.</p>
              <p>You agree to use {appName} for its intended purpose and not for anything illegal or harmful.</p>
            </Section>

            <Section title="Using the AI" icon={FiCpu}>
              <p>Our AI is designed to discuss finance. Please keep your conversations focused on these topics. The AI&apos;s output is not a substitute for professional judgment.</p>
              <p>The data you input (like your financial numbers for calculators or goals) is used by the AI to give you personalized insights <strong>within the app</strong>. We don&apos;t sell this personal financial data.</p>
            </Section>

            <Section title="Things We Ask You Not To Do" icon={FiThumbsDown}>
              <p>Please don&apos;t try to break the site, overload our servers, or use the service for anything sketchy. Let&apos;s keep it a positive space. </p>
            </Section>

            <Section title="Our Service (The Fine Print Lite)" icon={FiAlertTriangle}>
              <p>{appName} is provided &quot;as is.&quot; We do our best to make it useful and accurate, but we can&apos;t guarantee it will always be perfect, error-free, or available. Use it at your own risk.</p>
              <p>To the extent allowed by law, we (the creators of {appName}) won&apos;t be liable for any damages or losses that might arise from your use of the service. Our liability is limited. (If this were a real business, this section would be much more detailed and specific, likely limiting liability to a small amount).</p>
            </Section>

            <Section title="Changes & Stopping Service" icon={FiInfo}>
              <p>We might update these terms or change how {appName} works. If we make big changes to the terms, we&apos;ll try to let you know. We also reserve the right to stop or modify the service at any time.</p>
            </Section>

            <Section title="Questions?" icon={FiMail}>
              <p>If you have questions about these terms, drop us a line at <a href={`mailto:${contactEmail}`} className="text-blue-400 hover:underline">{contactEmail}</a>.</p>
              <p>Thanks for using {appName}!</p>
            </Section>
          </motion.div>
        </div>
      </main>
       <footer className="text-center p-4 text-xs text-neutral-600 border-t border-neutral-800">
           © {new Date().getFullYear()} {appName}.
       </footer>
    </div>
  );
}
// Import motion and other icons if needed
import { FiUser, FiCpu } from 'react-icons/fi';