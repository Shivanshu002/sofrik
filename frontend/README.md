# 🎨 Frontend — React + TypeScript SPA

Built with **React**, **TypeScript**, **Redux Toolkit**, **React Hook Form + Yup**, and **Tailwind CSS**.

---

## 📁 Folder Structure

```
frontend/src/
│
├── services/
│   └── index.ts              # HTTP client — doGet, doPost, doPut, doPatch, doDelete
│                             # Axios instance with JWT interceptor + 401 auto-logout
│
├── utils/
│   └── routes.ts             # Centralized API endpoint constants (Routes.url.*)
│
├── store/
│   ├── index.ts              # configureStore — combines all reducers
│   ├── slices/
│   │   ├── authSlice.ts      # State: user, token, loading, error
│   │   │                     # Actions: loginStart/Success/Failure, registStart/Success/Failure, logout
│   │   ├── projectsSlice.ts  # State: data[], total, page, totalPages, loading, error
│   │   │                     # Actions: fetchProjectsStart/Success/Failure, removeProject
│   │   └── tasksSlice.ts     # State: data[], loading, error
│   │                         # Actions: fetchTasksStart/Success/Failure, removeTask
│   └── actions/
│       ├── authActions.ts    # loginUser(), registerUser() — dispatch thunks
│       ├── projectActions.ts # fetchProjects(), createProject(), updateProject(), deleteProject()
│       ├── taskActions.ts    # fetchTasks(), createTask(), updateTask(), deleteTask()
│       └── aiActions.ts      # getSuggestions(), sendChatMessage() — direct async functions
│
├── components/
│   ├── Layout.tsx            # 3-column layout: Sidebar | Main | AI Panel
│   │                         # Mobile: drawer sidebar + floating AI button
│   ├── Sidebar.tsx           # Left panel: logo, profile, stats, filters, logout
│   ├── AiPanel.tsx           # Right panel: Suggestions tab + Chat tab
│   ├── Navbar.tsx            # Top bar (used on auth pages)
│   ├── PrivateRoute.tsx      # Redirects to /login if no token
│   ├── Modal.tsx             # Reusable centered modal overlay
│   ├── ProjectForm.tsx       # Create/Edit project form (React Hook Form + Yup)
│   └── TaskForm.tsx          # Create/Edit task form (React Hook Form + Yup)
│
├── pages/
│   ├── Login.tsx             # Login form → dispatches loginUser()
│   ├── Register.tsx          # Register form → dispatches registerUser()
│   ├── Dashboard.tsx         # Project grid + search/filter + AI panel integration
│   └── ProjectDetail.tsx     # Task list for a project + AI panel integration
│
├── types/
│   └── index.ts              # TypeScript interfaces: User, Project, Task, PaginatedProjects
│
├── App.tsx                   # BrowserRouter + Routes definition
└── index.tsx                 # ReactDOM.render (StrictMode disabled to prevent double API calls)
```

---

## ⚙️ Setup

```bash
npm install
npm start         # Development server on http://localhost:3000
npm run build     # Production build
```

---

## 🔌 Service Layer Pattern

All HTTP calls go through `services/index.ts`:

```ts
// services/index.ts
export const doGet  = (url, params?) => instance.get(url, { params });
export const doPost = (url, body?)   => instance.post(url, body);
export const doPut  = (url, body?)   => instance.put(url, body);
export const doDelete = (url)        => instance.delete(url);
```

All API endpoint strings live in `utils/routes.ts`:

```ts
export const Routes = {
  url: {
    auth:     { login: 'auth/login', register: 'auth/register' },
    projects: { base: 'projects', byId: (id) => `projects/${id}` },
    tasks:    { base: 'tasks', byProject: (id) => `tasks/project/${id}`, byId: (id) => `tasks/${id}` },
    ai:       { suggest: 'ai/suggest', chat: 'ai/chat' },
  },
};
```

Actions import both and call them:

```ts
// store/actions/projectActions.ts
export const fetchProjects = (params) => async (dispatch) => {
  dispatch(fetchProjectsStart());
  const res = await doGet(Routes.url.projects.base, params);
  dispatch(fetchProjectsSuccess(res.data));
};
```

---

## 🗂️ Redux State Shape

```ts
{
  auth: {
    user: { id, email, name } | null,
    token: string | null,
    loading: boolean,
    error: string | null
  },
  projects: {
    data: Project[],
    total: number,
    page: number,
    totalPages: number,
    loading: boolean,
    error: string | null
  },
  tasks: {
    data: Task[],
    loading: boolean,
    error: string | null
  }
}
```

---

## 📄 Pages & User Flows

### `/login` — Login Page
- Form fields: Email, Password
- On submit → `dispatch(loginUser(email, password, () => navigate('/dashboard')))`
- Validation: email format, required fields (Yup)
- Error shown from Redux `auth.error`
- Link to `/register`

### `/register` — Register Page
- Form fields: Name, Email, Password (min 6 chars)
- On submit → `dispatch(registerUser(payload, () => navigate('/dashboard')))`
- Same validation pattern as login

### `/dashboard` — Dashboard Page
- **Left Sidebar**: profile card, project stats (total/active/completed), search input, status filter dropdown, `+ New Project` button
- **Main area**: responsive grid of project cards (1 col mobile → 2 col tablet → 3 col desktop)
- **Project Card buttons**:
  - `View` → navigates to `/projects/:id`
  - `Edit` → opens Modal with ProjectForm pre-filled
  - `Delete` → confirm dialog → `dispatch(deleteProject(id))`
  - Click card → sets `selectedProject` → triggers AI suggestions on right panel
- **Pagination**: page buttons shown when `totalPages > 1`
- **Right AI Panel**: shows suggestions for selected project
- **Mobile**: hamburger `☰` opens sidebar drawer, floating `🤖 AI Suggestions` button appears when project selected

### `/projects/:id` — Project Detail Page
- Shows project info card (title, description, status)
- **Task filter**: dropdown to filter by `todo | in-progress | done`
- **Task row buttons**:
  - `Edit` → opens Modal with TaskForm pre-filled
  - `Delete` → confirm dialog → `dispatch(deleteTask(id))`
  - Click row → sets `selectedTask` → triggers AI suggestions on right panel
- `+ Add Task` button → opens Modal with empty TaskForm
- **Right AI Panel**: shows suggestions for selected task

---

## 🧩 Components

### `Layout.tsx`
3-column responsive layout wrapper.
- Props: `search`, `setSearch`, `status`, `setStatus`, `onNewProject`, `selectedProject`, `selectedTask`, `sidebarOpen`, `setSidebarOpen`
- Desktop: fixed sidebar (left) + scrollable main + fixed AI panel (right)
- Mobile: drawer sidebar with overlay + floating AI button

### `Sidebar.tsx`
Left navigation panel.
- Shows: logo, user profile (name + email), project stats, search/filter inputs, `+ New Project` button, logout
- Filters only shown on `/dashboard` route
- `onClose` prop closes mobile drawer

### `AiPanel.tsx`
Right AI assistant panel with 2 tabs:
- **💡 Suggestions tab**: auto-fetches when `selectedProject` or `selectedTask` changes. Uses `lastFetchedRef` to prevent duplicate calls. Each suggestion is a clickable button.
- **💬 Chat tab**: free-form chat. Quick-start question buttons shown when empty.
- Click suggestion → switches to Chat tab → sends `"Tell me more about: [suggestion]"` automatically
- AI responses rendered with `FormattedText` component (bold, bullets, numbered lists)

### `ProjectForm.tsx`
- Fields: Title (required), Description, Status (active/completed)
- Uses `dispatch(createProject())` or `dispatch(updateProject())`
- Yup validation schema

### `TaskForm.tsx`
- Fields: Title (required), Description, Status (todo/in-progress/done), Due Date
- Uses `dispatch(createTask())` or `dispatch(updateTask())`
- Yup validation schema

### `Modal.tsx`
- Props: `isOpen`, `title`, `children`, `onClose`
- Fixed overlay with centered white card

### `PrivateRoute.tsx`
- Reads `token` from Redux `auth` state
- Redirects to `/login` if no token

---

## 📱 Mobile Responsiveness

| Screen | Sidebar | AI Panel | Grid |
|--------|---------|----------|------|
| Mobile (`< md`) | Drawer (hamburger) | Floating button | 1 column |
| Tablet (`md`) | Hidden by default | Hidden | 2 columns |
| Desktop (`lg+`) | Fixed left | Fixed right | 3 columns |

---

## 🔐 Auth Flow

```
Login form submit
    ↓
dispatch(loginUser(email, password))
    ↓
authActions.ts → doPost(Routes.url.auth.login, { email, password })
    ↓
Response: { access_token, user }
    ↓
dispatch(loginSuccess({ user, access_token }))
    ↓
authSlice stores in Redux + localStorage
    ↓
navigate('/dashboard')
    ↓
All future requests: Axios interceptor adds Authorization: Bearer <token>
    ↓
401 response → auto logout + redirect to /login
```

---

## 🤖 AI Panel Flow

```
User clicks project card / task row
    ↓
setSelectedProject(project) / setSelectedTask(task)
    ↓
AiPanel useEffect detects _id change
    ↓
Checks lastFetchedRef (prevents duplicate calls)
    ↓
aiActions.getSuggestions({ title, description, type, status })
    ↓
doPost(Routes.url.ai.suggest, data)
    ↓
5 suggestions returned → animate in one by one (200ms stagger)
    ↓
User clicks suggestion
    ↓
Switches to Chat tab → sends "Tell me more about: [suggestion]"
    ↓
aiActions.sendChatMessage({ message, context })
    ↓
AI reply rendered with FormattedText (bold/bullets/numbered)
```
