# Task Management App — Next.js + NestJS + MongoDB

A simple full-stack task manager built for the trainee assignment.

## Requirements covered

- JWT registration/login
- Private tasks per logged-in user
- NestJS REST API
- MongoDB with Mongoose
- DTO validation
- JWT guard for protected routes
- Centralized error handling
- Task CRUD
- Pagination
- Filtering by status, priority and due-date range
- Multiple file attachments through Cloudinary
- Task-created email through Nodemailer
- Task-done email through Nodemailer
- Current weather through OpenWeatherMap
- Next.js login/register pages
- Protected dashboard
- Create/edit/delete tasks
- Filters and pagination
- Loading/error/empty states
- Basic validation
- Global auth state through React Context
- `.env` in backend and `.env.example` files
- Deployment-ready frontend/backend structure

The assignment asks for these requirements explicitly. fileciteturn0file0L2-L24

## Folder structure

```text
task-management-app/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── common/
│   │   ├── mail/
│   │   ├── tasks/
│   │   ├── upload/
│   │   ├── weather/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── register/
│   │   ├── providers/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── lib/
│   ├── .env.example
│   └── package.json
└── README.md
```

## 1. MongoDB

Create a MongoDB Atlas cluster.

Create a database user and allow your development IP in Atlas Network Access.

Copy your MongoDB connection string.

Example:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/task_manager
```

## 2. Backend setup

```bash
cd backend
npm install
```

Copy:

```text
.env.example -> .env
```

Fill in:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_long_secret
FRONTEND_URL=http://localhost:3000
```

### Email

This project uses Nodemailer.

For Gmail, use an App Password instead of your normal Gmail password.

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
MAIL_FROM=your_email@gmail.com
```

If SMTP variables are missing, the backend logs that email was skipped instead of crashing.

### Cloudinary

Create a Cloudinary account and add:

```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Uploaded files are stored in the `task-manager` Cloudinary folder.

### OpenWeatherMap

Create an API key and add:

```env
OPENWEATHER_API_KEY=...
```

Run:

```bash
npm run start:dev
```

Backend:

```text
http://localhost:5000
```

## 3. Frontend setup

Open another terminal:

```bash
cd frontend
npm install
```

Copy:

```text
.env.example -> .env.local
```

Set:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Run:

```bash
npm run dev
```

Frontend:

```text
http://localhost:3000
```

## 4. API endpoints

### Authentication

```text
POST /auth/register
POST /auth/login
```

### Tasks

All task endpoints require:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

```text
POST   /tasks
GET    /tasks
GET    /tasks/:id
PATCH  /tasks/:id
DELETE /tasks/:id
```

GET `/tasks` supports:

```text
?page=1
&limit=10
&status=todo
&priority=high
&fromDate=2026-08-01
&toDate=2026-08-31
```

### Weather

```text
GET /weather?location=Lucknow
```

Requires JWT.

## 5. File upload

Task create/update uses `multipart/form-data`.

The frontend sends files using the field:

```text
files
```

Maximum 5 files per request.

Cloudinary returns secure URLs and those URLs are stored in MongoDB.

## 6. Security notes

- Passwords are hashed with bcrypt.
- JWT is required for task/weather routes.
- Every task query includes the authenticated user's ID.
- A user cannot access another user's task by changing the task ID.
- `.env` is ignored by Git.
- `.env.example` contains only placeholder values.
- DTO validation rejects unexpected request fields.

## 7. Deployment

### Backend — Render

Create a Web Service from the GitHub repository.

Set Root Directory:

```text
backend
```

Build Command:

```bash
npm install && npm run build
```

Start Command:

```bash
npm start
```

Add all backend `.env` variables in Render Environment Variables.

Set:

```env
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Frontend — Vercel

Import the same GitHub repository.

Set Root Directory:

```text
frontend
```

Build command:

```bash
npm run build
```

Environment variable:

```env
NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.com
```

Deploy.

The assignment specifically requests Vercel for the frontend and a reachable Render/Railway/Fly.io backend. fileciteturn0file0L25-L33

## 8. Trade-offs

This implementation intentionally keeps the architecture simple.

Trade-offs:

1. Auth state is stored in localStorage. For a production application, httpOnly secure cookies would provide stronger protection against token theft through XSS.
2. Weather is fetched when the user clicks "Get weather", avoiding unnecessary OpenWeather requests for every task.
3. Cloudinary is used directly from the backend through an upload stream rather than adding a larger file-storage abstraction.
4. Email is handled by a small Nodemailer service rather than introducing a queue.
5. Filtering is implemented directly in the MongoDB query for simplicity.
6. The UI uses plain CSS rather than a UI library.

## 9. Improvements with more time

- httpOnly cookie authentication
- Refresh tokens
- Role-based permissions
- Better task detail page
- Search
- Sort controls
- Background job queue for email
- Weather caching
- File type and size validation
- Automated tests
- Swagger/OpenAPI documentation
- Rate limiting
- Better responsive UI
- CI/CD pipeline