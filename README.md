# 📋 ProjectMgr — Full Stack Project Management Tool

A full-stack project management application with AI-powered suggestions built with **NestJS**, **React (TypeScript)**, **MongoDB**, **Redux Toolkit**, and **Tailwind CSS**.

---

Live Project Link `https://darling-crisp-9dbb06.netlify.app/dashboard`

## 🏗️ Architecture Overview

```
sofrik/
├── backend/                  # NestJS REST API
│   ├── src/
│   │   ├── auth/             # JWT Authentication
│   │   ├── projects/         # Projects CRUD
│   │   ├── tasks/            # Tasks CRUD
│   │   ├── ai/               # Gemini AI integration
│   │   ├── schemas/          # Mongoose schemas
│   │   └── seed/             # Database seeder
│   └── .env                  # Environment variables
│
├── frontend/                 # React + TypeScript SPA
│   └── src/
│       ├── services/         # HTTP client (doGet/doPost/doPut/doDelete)
│       ├── utils/            # Centralized API route constants
│       ├── store/
│       │   ├── slices/       # Redux state slices
│       │   └── actions/      # Async thunks (API calls)
│       ├── components/       # Reusable UI components
│       ├── pages/            # Route-level page components
│       └── types/            # TypeScript interfaces
│
└── README.md                 # This file
```

---

## 🔄 Data Flow

```
User Action
    ↓
Page Component (Dashboard / ProjectDetail)
    ↓
Redux Action (store/actions/*.ts)
    ↓
Service Layer (services/index.ts → doPost/doGet)
    ↓
API Route (utils/routes.ts)
    ↓
NestJS Backend (Controller → Service → MongoDB)
    ↓
Redux Slice (store/slices/*.ts) updates state
    ↓
UI re-renders
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & Setup Backend
```bash
cd backend
npm install
# Add your credentials to .env (see backend/README.md)
npm run start:dev
```
Backend runs on → `http://localhost:3001`

### 2. Setup Frontend
```bash
cd frontend
npm install
npm start
```
Frontend runs on → `http://localhost:3000`

### 3. Seed Database
```bash
cd backend
npm run seed
```
Creates: `test@example.com` / `Test@123` with 2 projects and 6 tasks.

---

## 🌿 Git Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `dev` | Integration branch, cut from main |
| `feature/implement-ai-lib` | AI feature development, cut from dev |

---

## ✨ Features

- JWT-based authentication (register / login)
- Project CRUD with pagination & search
- Task CRUD with status filter
- AI suggestions on project/task click (Gemini)
- AI chat assistant with formatted responses
- Click suggestion → auto-sends as chat question
- Responsive UI (mobile sidebar + floating AI panel)
- Redux Toolkit state management
- Form validation with React Hook Form + Yup

---

## 🔑 Environment Variables

### Backend `.env`
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
PORT=3001
GEMINI_API_KEY=your_gemini_api_key
```

> Get a free Gemini API key at: https://aistudio.google.com/app/apikey
