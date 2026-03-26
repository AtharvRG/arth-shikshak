# Arth Shikshak

Welcome to Arth Shikshak, your personalized financial intelligence platform! We help you track, analyze, plan, and achieve your financial goals with unprecedented ease and confidence.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Table of Contents

- [Getting Started](#getting-started)
- [Features](#features)
- [Recent Updates](#recent-updates)
- [Learn More](#learn-more)
- [Deploy on Vercel](#deploy-on-vercel)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying [`src/app/page.tsx`](src/app/page.tsx). The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Features

- **AI-Powered Financial Chat**: Get personalized financial advice and insights powered by Groq (Llama 3.3).
- **Goal Tracking**: Set and monitor your financial objectives.
- **Financial Calculators**: Access various tools for financial planning.
- **Dashboard Analytics**: Visualize your financial progress.
- **Secure Authentication**: Protected user accounts with NextAuth.js (supports Credentials and Google OAuth).
- **Responsive Design**: Works seamlessly across all devices.

## Recent Updates

- **AI Engine Swap**: Replaced Google's Gemini API with **Groq SDK** utilizing the blazingly fast `llama-3.3-70b-versatile` model for financial insights.
- **Enhanced Authentication**: Integrated **Google OAuth** into both the `/login` and `/signup` pages using NextAuth, seamlessly creating accounts and storing instances in MongoDB.
- **UI & Performance Tuning**: 
  - Overhauled and optimized `FullPageLoader` and `LoadingIndicator` to bypass heavy canvas animations (removed `<Boxes />`), resulting in a sleek, hardware-friendly glassmorphic blur loader.
  - Rectified infinite loader stalls originating from same-page clicks within the top navigation bar.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy Arth Shikshak is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Before deploying, make sure to:
1. Set up your environment variables for MongoDB and NextAuth.js (`MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`).
2. Configure your Google OAuth authentication provider keys (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).
3. Set up your Groq API key (`GROQ_API_KEY`).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
