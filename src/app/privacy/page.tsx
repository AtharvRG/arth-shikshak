// src/app/privacy/page.tsx
"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { FiShield, FiInfo, FiMail } from 'react-icons/fi';

const Section = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
  <section className="mb-6">
    <h2 className="text-xl font-semibold text-neutral-100 mb-2 flex items-center"><Icon className="w-5 h-5 mr-2 text-blue-400" />{title}</h2>
    <div className="space-y-2 text-neutral-300 text-sm leading-relaxed">{children}</div>
  </section>
);

export default function LightPrivacyPolicyPage() {
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
              Our Approach to Your Privacy
            </h1>
            <p className="text-center text-xs text-neutral-500 mb-8">Last Updated: {lastUpdated}</p>

            <Section title="Our Commitment" icon={FiShield}>
              <p>Welcome to {appName}! We value your privacy and want to be clear about how we handle information when you use our financial guidance and calculator tools.</p>
              <p>This is a personal project aimed at helping users understand their finances better. We try to collect as little personal information as possible.</p>
            </Section>

            <Section title="What Information We Handle" icon={FiInfo}>
              <p><strong>Information You Provide:</strong> When you sign up and use our onboarding features, you provide details like your name, email, and financial information (salary, expenses, debts, goals). This information is used to personalize your experience and power the AI assistant and calculators.</p>
              <p><strong>Chat Data:</strong> Your conversations with the AI financial assistant are processed to give you responses. We store these chats to provide you with your history. We aim to make our AI helpful and focused on finance.</p>
              <p><strong>Automatically Collected Information (Optional - Be Honest If You Use Analytics):</strong> If we use basic analytics (like Vercel Analytics or a simple counter), we might see general usage data like page views. This helps us understand how the site is being used. We do not use this for detailed tracking of individuals. (Remove or adapt if you don&apos;t use any analytics).</p>
            </Section>

            <Section title="How We Use Your Information" icon={FiInfo}>
              <p>The information you provide is primarily used:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>To operate and provide the features of {appName} (calculators, AI chat, goal tracking).</li>
                <li>To personalize your financial insights.</li>
                <li>To maintain your chat history.</li>
                <li>To improve the tools and features of {appName} (generally based on aggregated or anonymized insights if possible).</li>
              </ul>
              <p>We will <strong>not</strong> sell your personal financial data to third parties.</p>
            </Section>

            <Section title="Data Security" icon={FiShield}>
              <p>We take reasonable steps to protect the information you provide. For example, passwords are hashed, and we use secure connections (HTTPS). However, please remember that no online service can be 100% secure. Use a strong, unique password for your account.</p>
            </Section>

            <Section title="AI Interaction (Gemini)" icon={FiCpu}>
              <p>Our AI features are powered by Google&apos;s Gemini models. When you chat, your messages (and relevant history for context) are sent to Google&apos;s API to generate responses. We&apos;ve instructed the AI to focus only on financial topics and to decline off-topic queries. Please review Google&apos;s own privacy policies if you have concerns about their data handling for API services.</p>
            </Section>

            <Section title="Your Choices" icon={FiUser}>
              <p>You can review and update your profile information. You can also delete your financial goals. If you wish to delete your account and associated data, please contact us at {contactEmail}, and we will process your request as soon as reasonably possible. (Only offer this if you can actually implement it).</p>
            </Section>

            <Section title="Changes to This Notice" icon={FiInfo}>
              <p>We might update this privacy approach from time to time if we add new features. If we make significant changes, we&apos;ll do our best to let you know. The &quot;Last Updated&quot; date at the top will always be current.</p>
            </Section>

            <Section title="Questions?" icon={FiMail}>
              <p>If you have any questions about how we handle your information on {appName}, feel free to reach out to us at: <a href={`mailto:${contactEmail}`} className="text-blue-400 hover:underline">{contactEmail}</a>.</p>
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
import { motion } from 'framer-motion';
import { FiUser, FiCpu } from 'react-icons/fi';