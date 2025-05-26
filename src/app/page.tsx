// src/app/page.tsx
"use client"; // Mark as client component because we use hooks (useState indirectly via children) and framer-motion

import React from "react";
import { AuroraBackground } from "@/components/ui/aurora-background"; // Background effect
import { motion } from "framer-motion"; // For animations
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"; // Animated text
import { BentoGrid } from "@/components/ui/bento-grid"; // Grid layout (even if items rendered directly)
import { LampComponent } from "@/components/ui/lamp"; // Lamp effect for CTA
import { Button as MovingBorderButton } from "@/components/ui/moving-border"; // Animated button
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient"; // Animated button border
import { CardSpotlight } from "@/components/ui/card-spotlight"; // Card hover effect
import { cn } from "@/lib/utils"; // Utility for class names
import CustomLink from "@/components/ui/CustomLink"; // Custom Link for loading states

// Import necessary icons
import {
  FiCpu, // AI icon
  FiPieChart, // Tracking icon
  FiTarget, // Goals icon
  FiShield, // Security icon
  FiUserPlus, // Onboarding Step 1 icon
  FiCheckCircle, // Onboarding Step 3 icon
  FiLogIn, // Login icon
  FiArrowRight // Button arrow icon
} from "react-icons/fi";


// --- Helper Components Defined within page.tsx ---

// Check Icon Component for feature lists
const CheckIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4 text-blue-500 mt-1 shrink-0" // Styling for the check icon
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      {/* Complex path for the checkmark inside a certified-like shape */}
      <path
        d="M12 2c-.218 0 -.432 .002 -.642 .005l-.616 .017l-.299 .013l-.579 .034l-.553 .046c-4.785 .464 -6.732 2.411 -7.196 7.196l-.046 .553l-.034 .579c-.005 .098 -.01 .198 -.013 .299l-.017 .616l-.004 .318l-.001 .324c0 .218 .002 .432 .005 .642l.017 .616l.013 .299l.034 .579l.046 .553c.464 4.785 2.411 6.732 7.196 7.196l.553 .046l.579 .034c.098 .005 .198 .01 .299 .013l.616 .017l.642 .005l.642 -.005l.616 -.017l.299 -.013l.579 -.034l.553 -.046c4.785 -.464 6.732 -2.411 7.196 -7.196l.046 -.553l.034 -.579c.005 -.098 .01 -.198 .013 -.299l.017 -.616l.005 -.642l-.005 -.642l-.017 -.616l-.013 -.299l-.034 -.579l-.046 -.553c-.464 -4.785 -2.411 -6.732 -7.196 -7.196l-.553 -.046l-.579 -.034a28.058 28.058 0 0 0 -.299 -.013l-.616 -.017l-.318 -.004l-.324 -.001zm2.293 7.293a1 1 0 0 1 1.497 1.32l-.083 .094l-4 4a1 1 0 0 1 -1.32 .083l-.094 -.083l-2 -2a1 1 0 0 1 1.32 -1.497l.094 .083l1.293 1.292l3.293 -3.292z"
        fill="currentColor"
        strokeWidth="0"
      />
    </svg>
  );
};

// Step Component for feature list items
const Step = ({ title }: { title: string }) => {
  return (
    <li className="flex gap-2 items-start py-1"> {/* List item with icon and text */}
      <CheckIcon />
      <p className="text-neutral-300">{title}</p> {/* Step text */}
    </li>
  );
};
// --- End Helper Components ---


// --- Main Landing Page Component ---
export default function LandingPage() {
    // Text content for the page
    const heroSubtitle = `Arth Shikshak delivers personalized financial intelligence. Track, analyze, plan, and achieve your goals with unprecedented ease and confidence.`;
    const howItWorksSubtitle = `A simple, secure process to put you in control.`;
    const finalCTASubtitle = `Join Arth Shikshak today and gain the clarity and confidence to master your financial future.`;

    // Data for the feature cards section
    const features = [
      { cardTitle: "AI-Powered Insights", intro: "Unlock deeper understanding:", steps: ["Personalized spending analysis.", "Future cash flow projections.", "Investment suggestions.", "Custom saving recommendations."], conclusion: "Let AI guide your decisions.", gridClassName: "md:col-span-2", },
      { cardTitle: "Seamless Tracking", intro: "Monitor your money:", steps: ["Connect accounts securely (Soon).", "Manual entry with smart categories.", "Visualize spending habits.", "Track income sources."], conclusion: "Know where your money goes.", gridClassName: "md:col-span-1", },
      { cardTitle: "Goal Management", intro: "Define & reach targets:", steps: ["Set financial goals easily.", "Track progress visually.", "Get AI-driven advice.", "Adjust plans flexibly."], conclusion: "Achieve your dreams.", gridClassName: "md:col-span-1", },
      { cardTitle: "Bank-Level Security", intro: "Your data's safety:", steps: ["AES-256 encryption.", "Secure infrastructure.", "Regular security audits.", "Strict privacy controls."], conclusion: "Manage finances confidently.", gridClassName: "md:col-span-2", },
    ];

    // JSX structure for the landing page
    return (
        <div className="w-full min-h-screen text-white antialiased overflow-x-hidden bg-neutral-950">

            {/* === Hero Section === */}
            <AuroraBackground>
                {/* Animated content container */}
                <motion.div
                    initial={{ opacity: 0.0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
                    className="relative flex flex-col gap-4 items-center justify-center px-4 z-10"
                >
                    {/* Title */}
                    <h1 className="mt-12 relative z-10 text-5xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400 text-center font-sans font-bold mb-6">
                        Arth Shikshak
                    </h1>
                    {/* Animated Subtitle */}
                    <TextGenerateEffect words={heroSubtitle} className="text-neutral-300 text-base md:text-xl max-w-xl mx-auto mb-10 text-center" />

                    {/* Call-to-Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-4">
                        {/* Signup Button/Link */}
                        <CustomLink href="/signup" loadingType="fullPage">
                            <MovingBorderButton
                                borderRadius="1.75rem"
                                containerClassName="h-14 w-52"
                                className="bg-blue-600 hover:bg-blue-700 border-slate-800 text-white text-base font-semibold flex items-center justify-center gap-2 transition-colors duration-300"
                            >
                                <span>Get Started Free</span>
                                <FiArrowRight className="w-5 h-5" />
                            </MovingBorderButton>
                        </CustomLink>
                        {/* Login Button/Link */}
                         <CustomLink href="/login" loadingType="fullPage" className="rounded-full">
                             <HoverBorderGradient
                                containerClassName="rounded-full"
                                as="div" // Render as div, link provides anchor
                                className="dark:bg-black bg-neutral-900 text-neutral-300 flex items-center space-x-2 px-6 py-3 text-base font-medium cursor-pointer"
                            >
                               <FiLogIn className="h-5 w-5" />
                               <span>Login</span>
                            </HoverBorderGradient>
                        </CustomLink>
                    </div>
                </motion.div>
            </AuroraBackground>
            {/* === End Hero Section === */}


            {/* === Features Section === */}
            <section className="py-20 md:py-24 bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Title */}
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-neutral-100 mb-16">
                        Everything You Need to Succeed
                    </h2>
                    {/* Bento Grid Layout for Feature Cards */}
                    <BentoGrid className="max-w-4xl mx-auto md:auto-rows-[auto]">
                        {/* Map through features data to render cards */}
                        {features.map((item, i) => (
                            <CardSpotlight
                                key={`feature-${i}`}
                                className={cn(item.gridClassName, "h-full")} // Apply grid span, ensure full height
                                color="rgba(255, 255, 255, 0.05)" // Subtle spotlight color
                             >
                                {/* Content inside the CardSpotlight */}
                               <p className="text-xl font-bold relative z-20 mt-2 text-white">{item.cardTitle}</p>
                               <div className="text-neutral-200 text-sm mt-4 relative z-20">{item.intro}</div>
                               <ul className="list-none mt-2 space-y-1 relative z-20">
                                 {item.steps.map((step, stepIndex) => (<Step key={stepIndex} title={step} />))}
                               </ul>
                               <p className="text-neutral-300 mt-4 relative z-20 text-sm">{item.conclusion}</p>
                            </CardSpotlight>
                        ))}
                    </BentoGrid>
                </div>
            </section>
            {/* === End Features Section === */}


            {/* === "How it Works" Section === */}
            <section className="py-20 md:py-32 bg-neutral-950 relative z-10">
                <div className="container mx-auto px-4 text-center max-w-4xl">
                    {/* Section Title */}
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Unlock Financial Clarity in <span className="text-blue-400">Minutes</span>
                    </h2>
                    {/* Section Subtitle */}
                    <p className="text-lg text-neutral-300/80 mb-16 max-w-xl mx-auto">
                        {howItWorksSubtitle}
                    </p>
                    {/* Grid Layout for Steps */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 relative">
                         {/* Decorative Connector Line */}
                         <div className="hidden sm:block absolute left-0 w-full h-0.5 border-t-2 border-dashed border-neutral-700/50 -z-10" style={{ transform: 'translateY(calc(2rem + 2px))' }}></div>
                         {/* Step 1 */}
                        <div className="flex flex-col items-center relative z-10">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-900 to-neutral-800 text-blue-300 flex items-center justify-center text-2xl font-bold mb-5 ring-4 ring-neutral-700/30 shadow-lg">1</div>
                            <FiUserPlus size={36} className="mb-4 text-blue-400"/>
                            <h3 className="text-xl font-semibold text-neutral-100 mb-2">Secure Onboarding</h3>
                            <p className="text-neutral-400 text-sm">Provide your financial basics – encrypted and confidential.</p>
                        </div>
                        {/* Step 2 */}
                         <div className="flex flex-col items-center relative z-10">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-900 to-neutral-800 text-purple-300 flex items-center justify-center text-2xl font-bold mb-5 ring-4 ring-neutral-700/30 shadow-lg">2</div>
                            <FiCpu size={36} className="mb-4 text-purple-400"/>
                            <h3 className="text-xl font-semibold text-neutral-100 mb-2">AI Analysis & Chat</h3>
                            <p className="text-neutral-400 text-sm">Interact with your AI advisor, ask questions, get insights.</p>
                        </div>
                        {/* Step 3 */}
                         <div className="flex flex-col items-center relative z-10">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-900 to-neutral-800 text-emerald-300 flex items-center justify-center text-2xl font-bold mb-5 ring-4 ring-neutral-700/30 shadow-lg">3</div>
                            <FiCheckCircle size={36} className="mb-4 text-emerald-400"/>
                            <h3 className="text-xl font-semibold text-neutral-100 mb-2">Plan & Achieve</h3>
                            <p className="text-neutral-400 text-sm">Utilize dashboards, track goals, and watch your wealth grow.</p>
                        </div>
                    </div>
                </div>
            </section>
            {/* === END "How it Works" Section === */}


            {/* === Final Call to Action Section === */}
            <LampComponent>
                {/* Section Title */}
                <h2 className="relative z-10 bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl pt-10">
                    Ready to <span className="text-blue-400">Illuminate</span> Your Finances?
                </h2>
                {/* Section Subtitle */}
                <p className="text-neutral-300 max-w-lg text-center mx-auto my-4 relative z-10">
                    {finalCTASubtitle}
                </p>
                {/* Signup Button/Link */}
                <div className="mt-8 flex justify-center">
                     <CustomLink href="/signup" loadingType="fullPage">
                        <MovingBorderButton
                            borderRadius="1.75rem"
                            containerClassName="h-14 w-auto px-8" // Auto width based on padding
                            className="bg-blue-600 hover:bg-blue-700 border-slate-800 text-white text-base font-semibold flex items-center justify-center gap-2 transition-colors duration-300"
                        >
                            <span>⠀⠀Sign Up - It&apos;s Free⠀⠀</span>
                        </MovingBorderButton>
                     </CustomLink>
                </div>
            </LampComponent>
            {/* === End Final Call to Action Section === */}


            {/* === Footer Section === */}
            <footer className="py-8 bg-neutral-950 text-neutral-500 text-center text-sm relative z-10">
                <div className="container mx-auto px-4">
                    © {new Date().getFullYear()} Arth Shikshak. All Rights Reserved. |
                    {/* Footer Links */}
                    <CustomLink href="/privacy" className="link link-hover mx-2 hover:text-neutral-300 transition-colors" loadingType="fullPage">
                        Privacy Policy
                    </CustomLink> |
                    <CustomLink href="/terms" className="link link-hover mx-2 hover:text-neutral-300 transition-colors" loadingType="fullPage">
                        Terms of Service
                    </CustomLink>
                </div>
            </footer>
            {/* === End Footer Section === */}

        </div> // End Main Wrapper div
    );
}