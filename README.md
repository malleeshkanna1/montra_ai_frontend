
# Montra – AI-Powered Personal Finance Tracker

Montra is an AI-powered personal finance tracking application designed to help users manage their income and expenses, monitor financial activity, and gain insights into their spending habits.

The frontend is built with React and TypeScript, featuring a clean, responsive interface with AI-powered financial advisory capabilities.

## ✨ Features

### 1. Dashboard
- View available balance.
- Monitor income and expenses.
- Get a quick overview of financial activity.

### 2. Income & Expense Management
- Add income and expense transactions.
- Update and delete existing transactions.
- Organize transactions using categories.
- Classify expenses as Essential and Discretionary.
- View recent transactions.

### 3. Transaction History
- Browse all financial transactions.
- Filter transactions by date and period.
- Select custom date ranges.
- View transaction details and summaries.

### 4. AI Financial Advisor
- Ask financial questions using natural language.
- Analyze income and expense patterns.
- Get AI-generated financial insights.
- Identify spending trends and categories.
- Review previous AI conversations.
- Filter financial analysis by predefined or custom date ranges.
- Display AI responses with Markdown formatting.

### 5. Responsive Interface
- Clean and minimal user interface.
- Responsive desktop and mobile layouts.
- Reusable UI components.
- Consistent design using shadcn/ui.

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React | Frontend library |
| TypeScript | Type safety |
| Vite | Development server and build tool |
| Tailwind CSS | Styling |
| shadcn/ui | UI components |
| React Router | Client-side routing |
| React Hook Form | Form management |
| Zod | Form validation |
| Axios | HTTP API communication |
| Moment.js | Date and time formatting |
| date-fns | Date utilities |
| React Markdown | Markdown rendering |
| remark-gfm | GitHub Flavored Markdown |
| Lucide React | Icons |
| Sonner | Toast notifications |

## 📋 Prerequisites

Make sure you have the following installed:

- Node.js (LTS recommended)
- npm
- Git
- Montra backend API

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <YOUR_FRONTEND_REPOSITORY_URL>
```

### 2. Navigate to the project directory

```bash
cd montra-frontend
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:5173
```

## ⚙️ Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the production application |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint, if configured |

## 🔌 API Integration

The frontend communicates with the backend through Axios.

Axios configuration includes:

- Centralized API instance.
- JSON request headers.
- Cookie-based authentication using `withCredentials`.
- Configurable request timeout.
- Centralized error handling.
- Global unauthorized-response handling.

The frontend integrates with backend endpoints for:

- Authentication
- Transaction management
- Category management
- Financial summaries
- AI chat and conversation history

## 🤖 AI Advisory Integration

Montra provides an AI-powered financial advisory interface.

Users can ask questions about their financial transactions and receive contextual insights based on the selected reporting period.

The AI Advisory frontend supports:

- Natural-language questions.
- Predefined reporting periods.
- Custom date-range selection.
- AI-generated Markdown responses.
- Conversation history retrieval.
- Local timezone conversion for chat timestamps.

## 📦 Production Build

Generate an optimized production build:

```bash
npm run build
```

The generated production files will be available in the `dist/` directory.

You can preview the production build locally:

```bash
npm run preview
```

## 🔗 Project Architecture

```text
┌──────────────────────────────┐
│       Montra Frontend        │
│                              │
│       React + TypeScript     │
│                              │
│  Dashboard | Transactions    │
│  AI Advisory | Categories    │
└──────────────┬───────────────┘
               │
               │ HTTP / REST API
               │ Axios
               ▼
┌──────────────────────────────┐
│        Montra Backend        │
│                              │
│       FastAPI Backend        │
│                              │
│ Authentication               │
│ Transaction Management       │
│ Category Management          │
│ AI Advisory                  │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│          Database            │
│                              │
│ Financial Transactions       │
│ Categories                   │
│ AI Conversation History      │
└──────────────────────────────┘
```

## 🎯 Project Goal

The goal of Montra is to make personal financial management simpler through an intuitive interface and AI-powered financial insights.

Instead of only recording transactions, Montra aims to help users understand their financial activity through conversational AI.

---

**Montra – Track Your Money. Understand Your Spending.**

*Frontend application built with React, TypeScript, and modern web technologies.*
