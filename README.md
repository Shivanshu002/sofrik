# Project Management Tool

Full-stack project management app built with NestJS, React (TypeScript), MongoDB, Redux Toolkit, and Tailwind CSS.

## Stack

- **Backend**: NestJS, MongoDB (Mongoose), JWT Auth, bcryptjs
- **Frontend**: React + TypeScript, Redux Toolkit, React Hook Form + Yup, Tailwind CSS

## Setup

### Backend

```bash
cd backend
npm install
npm run start:dev
```

Runs on `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
npm start
```

Runs on `http://localhost:3000`

## Seed Database

```bash
cd backend
npm run seed
```

This creates:
- 1 user: `test@example.com` / `Test@123`
- 2 projects linked to that user
- 3 tasks per project (6 total)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/projects | List projects (pagination + search) |
| POST | /api/projects | Create project |
| GET | /api/projects/:id | Get project |
| PUT | /api/projects/:id | Update project |
| DELETE | /api/projects/:id | Delete project |
| GET | /api/tasks/project/:id | Get tasks by project |
| POST | /api/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |

## Features

- JWT-based authentication (register/login)
- Password hashing with bcrypt
- Project CRUD with pagination & search
- Task CRUD with status filter
- Redux Toolkit state management
- Form validation with React Hook Form + Yup
- Responsive UI with Tailwind CSS

## Known Limitations

- No email verification
- No role-based access control
