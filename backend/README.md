# 🖥️ Backend — NestJS REST API

Built with **NestJS**, **MongoDB (Mongoose)**, **JWT Auth**, **bcryptjs**, and **Google Gemini AI**.

---

## 📁 Folder Structure

```
backend/src/
├── auth/
│   ├── auth.controller.ts     # POST /auth/register, POST /auth/login
│   ├── auth.service.ts        # register(), login(), signToken()
│   ├── auth.module.ts         # Imports MongooseModule, JwtModule, PassportModule
│   ├── auth.dto.ts            # RegisterDto, LoginDto (class-validator)
│   ├── jwt.strategy.ts        # Validates Bearer token, attaches user to request
│   └── jwt-auth.guard.ts      # Guard applied to protected routes
│
├── projects/
│   ├── projects.controller.ts # GET/POST/PUT/DELETE /projects
│   ├── projects.service.ts    # findAll(), findOne(), create(), update(), remove()
│   ├── projects.module.ts
│   └── projects.dto.ts        # CreateProjectDto, UpdateProjectDto
│
├── tasks/
│   ├── tasks.controller.ts    # GET/POST/PUT/DELETE /tasks
│   ├── tasks.service.ts       # findByProject(), create(), update(), remove()
│   ├── tasks.module.ts
│   └── tasks.dto.ts           # CreateTaskDto, UpdateTaskDto
│
├── ai/
│   ├── ai.controller.ts       # POST /ai/suggest, POST /ai/chat
│   ├── ai.service.ts          # getSuggestion(), chat() via Gemini
│   ├── ai.module.ts
│   └── ai.dto.ts              # AiSuggestDto, AiChatDto
│
├── schemas/
│   ├── user.schema.ts         # User: email, password, name
│   ├── project.schema.ts      # Project: title, description, status, owner
│   └── task.schema.ts         # Task: title, description, status, dueDate, project, owner
│
├── seed/
│   └── seed.ts                # Standalone seeder script
│
├── app.module.ts              # Root module — registers all modules
└── main.ts                    # Bootstrap, CORS, ValidationPipe, global prefix /api
```

---

## ⚙️ Setup

```bash
npm install
npm run start:dev     # Development with hot reload
npm run build         # Production build
npm run start:prod    # Run production build
npm run seed          # Seed database with dummy data
```

---

## 🌱 Environment Variables

Create `backend/.env`:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/projectmgmt
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
PORT=3001
GEMINI_API_KEY=your_gemini_api_key
```

---

## 📡 API Endpoints

All routes are prefixed with `/api`

### Auth
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | `{ name, email, password }` | Register new user |
| POST | `/api/auth/login` | `{ email, password }` | Login, returns JWT |

**Response:**
```json
{
  "access_token": "eyJhbGci...",
  "user": { "id": "...", "email": "...", "name": "..." }
}
```

---

### Projects *(JWT required)*
| Method | Endpoint | Query/Body | Description |
|--------|----------|------------|-------------|
| GET | `/api/projects` | `?page=1&limit=9&search=&status=` | List projects (paginated) |
| POST | `/api/projects` | `{ title, description?, status? }` | Create project |
| GET | `/api/projects/:id` | — | Get single project |
| PUT | `/api/projects/:id` | `{ title?, description?, status? }` | Update project |
| DELETE | `/api/projects/:id` | — | Delete project |

**Paginated Response:**
```json
{
  "data": [...],
  "total": 10,
  "page": 1,
  "totalPages": 2
}
```

---

### Tasks *(JWT required)*
| Method | Endpoint | Query/Body | Description |
|--------|----------|------------|-------------|
| GET | `/api/tasks/project/:projectId` | `?status=todo\|in-progress\|done` | Get tasks by project |
| POST | `/api/tasks` | `{ title, description?, status?, dueDate?, project }` | Create task |
| PUT | `/api/tasks/:id` | `{ title?, description?, status?, dueDate? }` | Update task |
| DELETE | `/api/tasks/:id` | — | Delete task |

---

### AI *(JWT required)*
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/ai/suggest` | `{ title, description?, type, status?, dueDate? }` | Get 5 AI suggestions |
| POST | `/api/ai/chat` | `{ message, context? }` | Chat with AI assistant |

**Suggest Response:**
```json
{ "suggestions": ["tip1", "tip2", "tip3", "tip4", "tip5"] }
```

**Chat Response:**
```json
{ "reply": "Here are some steps to help you..." }
```

---

## 🗄️ Database Schemas

### User
```
email     String  unique, lowercase
password  String  bcrypt hashed
name      String
```

### Project
```
title       String   required
description String
status      Enum     "active" | "completed"  default: "active"
owner       ObjectId ref: User
```

### Task
```
title       String   required
description String
status      Enum     "todo" | "in-progress" | "done"  default: "todo"
dueDate     Date
project     ObjectId ref: Project
owner       ObjectId ref: User
```

---

## 🌱 Seed Script

```bash
npm run seed
```

Creates:
- **1 user**: `test@example.com` / `Test@123`
- **2 projects**: "Website Redesign" (active), "Mobile App MVP" (active)
- **6 tasks**: 3 per project with mixed statuses (todo, in-progress, done)

---

## 🔐 Authentication Flow

```
POST /api/auth/login
    ↓
AuthService.login() → verify email + bcrypt.compare(password)
    ↓
JwtService.sign({ sub: userId, email })
    ↓
Returns { access_token, user }
    ↓
Client stores token in localStorage
    ↓
All protected requests → Authorization: Bearer <token>
    ↓
JwtStrategy.validate() → attaches user to req.user
```

---

## 🤖 AI Integration (Gemini)

- Model: `gemini-2.0-flash`
- `POST /api/ai/suggest` — sends project/task context, returns 5 actionable suggestions as JSON array
- `POST /api/ai/chat` — free-form chat with optional context string
- Errors thrown as HTTP 503 with real error message (no silent swallowing)
