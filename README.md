# Arth Shikshak 💰

<div align="center">

**Your Personalized Financial Intelligence Platform**

[![Next.js](https://img.shields.io/badge/Next.js-13.4.19-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[🚀 Live Demo](#) • [📖 Documentation](#documentation) • [🐛 Report Bug](#contributing) • [💡 Request Feature](#contributing)

</div>

---

## 🌟 About Arth Shikshak

Arth Shikshak is a comprehensive financial intelligence platform that empowers users to take control of their financial future. Built with modern web technologies, it combines AI-powered insights, interactive calculators, and personalized goal tracking to deliver an unparalleled financial planning experience.

### 🎯 Mission
To democratize financial literacy and make sophisticated financial planning tools accessible to everyone, regardless of their financial background or expertise.

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Installation](#️-installation)
- [🔧 Configuration](#-configuration)
- [📱 Usage](#-usage)
- [🏗️ Project Structure](#️-project-structure)
- [🔌 API Reference](#-api-reference)
- [🎨 UI Components](#-ui-components)
- [🧪 Testing](#-testing)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🙏 Acknowledgments](#-acknowledgments)

## ✨ Features

### 🤖 AI-Powered Financial Assistant
- **Intelligent Chat Interface**: Get personalized financial advice powered by Google's Gemini AI
- **Context-Aware Responses**: AI understands your financial profile and provides tailored recommendations
- **Chat History**: Access previous conversations and track your financial journey

### 📊 Comprehensive Financial Calculators
- **EMI Calculator**: Calculate loan EMIs with detailed amortization schedules
- **SIP Calculator**: Plan systematic investment plans with projected returns
- **Lump Sum Calculator**: Analyze one-time investment growth potential
- **Compound Interest Calculator**: Understand the power of compounding
- **Savings Goal Calculator**: Plan and track your savings objectives
- **Fixed Deposit Calculator**: Calculate FD returns and maturity amounts

### 🎯 Goal Management System
- **Smart Goal Setting**: Create and categorize financial goals
- **Progress Tracking**: Visual progress indicators and milestone celebrations
- **AI Suggestions**: Get personalized strategies to achieve your goals faster
- **Timeline Management**: Set realistic deadlines and track progress

### 📈 Personal Dashboard
- **Financial Overview**: Comprehensive view of your financial health
- **Interactive Charts**: Visualize your income, expenses, and investments
- **Net Worth Tracking**: Monitor your wealth accumulation over time
- **Expense Analytics**: Categorized spending analysis and insights

### 🔐 Security & Authentication
- **NextAuth.js Integration**: Secure authentication with multiple providers
- **Data Encryption**: All sensitive financial data is encrypted
- **Privacy First**: Your financial information stays private and secure
- **Session Management**: Secure session handling and automatic logout

### 📱 Modern User Experience
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile
- **Dark Mode**: Eye-friendly interface for extended usage
- **Smooth Animations**: Framer Motion powered interactions
- **Accessibility**: WCAG compliant design for inclusive access

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 13.4.19](https://nextjs.org/) with App Router
- **Language**: [TypeScript 5.1.6](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 3.3.3](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) + Custom Components
- **Animations**: [Framer Motion 10.12.0](https://www.framer.com/motion/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/) + [Lucide React](https://lucide.dev/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **API Routes**: Next.js API Routes
- **Database**: [MongoDB](https://www.mongodb.com/) with native driver
- **Authentication**: [NextAuth.js 4.24.5](https://next-auth.js.org/)
- **AI Integration**: [Google Generative AI](https://ai.google.dev/)

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint with Next.js config
- **Code Formatting**: Prettier (implied)
- **Type Checking**: TypeScript strict mode

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0 or later
- npm or yarn package manager
- MongoDB database (local or cloud)
- Google Generative AI API key

### 1. Clone the Repository
```bash
git clone https://github.com/AtharvRG/arth-shikshak.git
cd arth-shikshak
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables
```bash
cp .env.example .env.local
```

### 4. Start Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## ⚙️ Installation

### Detailed Setup Instructions

1. **Clone and Navigate**
   ```bash
   git clone https://github.com/AtharvRG/arth-shikshak.git
   cd arth-shikshak
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   - Create a MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
   - Note your connection string

4. **API Keys Setup**
   - Get a [Google Generative AI API key](https://ai.google.dev/)
   - Generate a secure NextAuth secret

5. **Environment Configuration**
   Create `.env.local` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/arth-shikshak
   # or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/arth-shikshak

   # Authentication
   AUTH_SECRET=your-super-secure-secret-key-here
   NEXTAUTH_URL=http://localhost:3000

   # AI Integration
   GEMINI_API_KEY=your-google-generative-ai-api-key
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | ✅ | `mongodb://localhost:27017/arth-shikshak` |
| `AUTH_SECRET` | NextAuth.js secret key | ✅ | `your-super-secure-secret` |
| `NEXTAUTH_URL` | Application URL | ✅ | `http://localhost:3000` |
| `GEMINI_API_KEY` | Google Generative AI API key | ✅ | `your-gemini-api-key` |

### Database Schema

The application uses the following MongoDB collections:

#### Users Collection
```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  password: string, // hashed
  onboardingComplete: boolean,
  dob: Date,
  occupation: string,
  annualSalary: number,
  expenses: Array<{category: string, amount: number}>,
  debts: Array<{type: string, amount: number, emi: number}>,
  investments: Array<{type: string, amount: number}>,
  createdAt: Date,
  updatedAt: Date
}
```

#### Goals Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  title: string,
  description: string,
  targetAmount: number,
  targetDate: Date,
  currentAmount: number,
  aiSuggestions: string,
  createdAt: Date,
  updatedAt: Date
}
```

#### Chats Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  title: string,
  messages: Array<{role: string, content: string, timestamp: Date}>,
  createdAt: Date,
  updatedAt: Date
}
```

## 📱 Usage

### Getting Started with Arth Shikshak

1. **Sign Up/Login**
   - Create an account or login with existing credentials
   - Complete the onboarding process to personalize your experience

2. **Complete Your Financial Profile**
   - Add your income, expenses, debts, and investments
   - This helps the AI provide more accurate recommendations

3. **Set Financial Goals**
   - Navigate to the Goals section
   - Create specific, measurable financial objectives
   - Get AI-powered suggestions for achieving them

4. **Use Financial Calculators**
   - Access various calculators from the Calculators page
   - Plan investments, loans, and savings strategies

5. **Chat with AI Assistant**
   - Ask questions about your finances
   - Get personalized advice and insights
   - Access chat history for reference

### Key User Flows

#### Setting Up Your First Goal
```
Dashboard → Goals → Add New Goal → Fill Details → Get AI Suggestions → Track Progress
```

#### Using Calculators
```
Navigation → Calculators → Select Calculator Type → Input Values → View Results → Save/Export
```

#### AI Chat Session
```
Navigation → Chat → Start New Chat → Ask Financial Questions → Get Personalized Advice
```

## 🏗️ Project Structure

```
arth-shikshak/
├── public/                     # Static assets
│   ├── next.svg
│   ├── noise.webp
│   └── vercel.svg
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── chat/          # Chat API endpoints
│   │   │   ├── goals/         # Goals CRUD operations
│   │   │   └── user/          # User management
│   │   ├── calculators/       # Financial calculators page
│   │   ├── chat/              # AI chat interface
│   │   ├── dashboard/         # User dashboard
│   │   ├── goals/             # Goals management
│   │   ├── login/             # Authentication pages
│   │   ├── onboarding/        # User onboarding flow
│   │   ├── profile/           # User profile management
│   │   ├── signup/            # User registration
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # Reusable components
│   │   ├── calculators/       # Calculator components
│   │   ├── layout/            # Layout components
│   │   └── ui/                # UI components
│   ├── context/               # React contexts
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   │   ├── gemini.ts          # AI integration
│   │   ├── mongodb.ts         # Database connection
│   │   └── utils.ts           # Helper functions
│   └── models/                # TypeScript interfaces
│       ├── Chat.ts
│       ├── Goal.ts
│       └── User.ts
├── .gitignore
├── next.config.js             # Next.js configuration
├── package.json               # Dependencies and scripts
├── postcss.config.js          # PostCSS configuration
├── tailwind.config.ts         # Tailwind CSS configuration
└── tsconfig.json              # TypeScript configuration
```

## 🔌 API Reference

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully"
}
```

### Goals API

#### GET `/api/goals`
Retrieve user's financial goals.

**Headers:**
```
Authorization: Bearer <session-token>
```

**Response:**
```json
{
  "goals": [
    {
      "_id": "goal_id",
      "title": "Emergency Fund",
      "targetAmount": 50000,
      "currentAmount": 15000,
      "targetDate": "2024-12-31",
      "progress": 30
    }
  ]
}
```

#### POST `/api/goals`
Create a new financial goal.

**Request Body:**
```json
{
  "title": "Emergency Fund",
  "description": "6 months of expenses",
  "targetAmount": 50000,
  "targetDate": "2024-12-31"
}
```

### Chat API

#### POST `/api/chat/new`
Start a new chat session.

**Request Body:**
```json
{
  "message": "How can I save for retirement?"
}
```

**Response:**
```json
{
  "chatId": "chat_id",
  "response": "AI generated response about retirement planning..."
}
```

## 🎨 UI Components

### Custom Components

The application features a rich set of custom UI components built on top of Radix UI:

- **AuroraBackground**: Animated gradient background
- **BentoGrid**: Masonry-style grid layout
- **CardSpotlight**: Interactive card with spotlight effect
- **HoverBorderGradient**: Animated border effects
- **LampComponent**: 3D lamp animation
- **MovingBorder**: Animated button borders
- **TextGenerateEffect**: Typewriter text animation
- **WobbleCard**: Physics-based card animations

### Component Usage Example

```tsx
import { CardSpotlight } from '@/components/ui/card-spotlight';
import { Button } from '@/components/ui/moving-border';

export function FeatureCard() {
  return (
    <CardSpotlight className="h-96 w-96">
      <h3 className="text-xl font-bold">AI-Powered Insights</h3>
      <p className="text-neutral-300">
        Get personalized financial advice tailored to your goals.
      </p>
      <Button>Learn More</Button>
    </CardSpotlight>
  );
}
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

```
tests/
├── __mocks__/              # Mock files
├── components/             # Component tests
├── pages/                  # Page tests
├── api/                    # API endpoint tests
└── utils/                  # Utility function tests
```

### Writing Tests

Example component test:
```typescript
import { render, screen } from '@testing-library/react';
import { EMICalculator } from '@/components/calculators/EMICalculator';

describe('EMICalculator', () => {
  it('calculates EMI correctly', () => {
    render(<EMICalculator />);
    // Test implementation
  });
});
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**
   - Fork this repository
   - Connect your GitHub account to Vercel
   - Import the project

2. **Configure Environment Variables**
   ```bash
   MONGODB_URI=your-mongodb-connection-string
   AUTH_SECRET=your-nextauth-secret
   NEXTAUTH_URL=https://your-domain.vercel.app
   GEMINI_API_KEY=your-gemini-api-key
   ```

3. **Deploy**
   - Vercel will automatically deploy on every push to main
   - Access your live application at the provided URL

### Manual Deployment

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Start Production Server**
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Setup Checklist

- [ ] MongoDB database created and accessible
- [ ] Google Generative AI API key obtained
- [ ] Environment variables configured
- [ ] NextAuth secret generated
- [ ] Domain configured for production

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Getting Started

1. **Fork the Repository**
   ```bash
   git fork https://github.com/AtharvRG/arth-shikshak.git
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Your Changes**
   - Follow the existing code style
   - Add tests for new features
   - Update documentation as needed

4. **Commit Your Changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/amazing-feature
   ```

### Development Guidelines

- **Code Style**: Follow TypeScript and React best practices
- **Commits**: Use conventional commit messages
- **Testing**: Add tests for new features
- **Documentation**: Update README and inline docs

### Areas for Contribution

- 🧮 Additional financial calculators
- 🎨 UI/UX improvements
- 🔒 Security enhancements
- 📱 Mobile app development
- 🌐 Internationalization
- ♿ Accessibility improvements

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Vercel** for hosting and deployment platform
- **MongoDB** for the database solution
- **Google** for Generative AI capabilities
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for the utility-first CSS framework
- **Framer Motion** for smooth animations

---

<div align="center">

**Built with ❤️ by the Arth Shikshak Team**

[⭐ Star this repo](https://github.com/AtharvRG/arth-shikshak) • [🐛 Report Issues](https://github.com/AtharvRG/arth-shikshak/issues) • [💬 Join Discussions](https://github.com/AtharvRG/arth-shikshak/discussions)

</div>
