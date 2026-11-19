# Student Placement Notifier

Full-stack app that matches students with placement drives and notifies them by email.

- **Frontend:** React 18 + Vite, Tailwind CSS, React Router, React Hook Form + Yup, Axios
- **Backend:** Node.js + Express, JWT auth, Joi validation, Nodemailer, Helmet, rate limiting
- **Databases:** MongoDB (drives, admins) and MySQL (students)

## Prerequisites
Node.js 18+, MongoDB 6+/7, MySQL 8+.

## Quick start (manual)

```bash
# 1. Backend
cd backend
npm install
# edit .env  ->  set MYSQL_PASSWORD (and JWT_SECRET)
npm run dev          # http://localhost:5000

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev          # http://localhost:5173
```

On first start the backend automatically:
- creates the MySQL database `student_placement` (if missing) and all tables
- creates the default admin account

So no separate seed step is needed (`npm run seed` still works if you want it).

**Default admin:** `admin@placement.com` / `Admin@123`  (change in `backend/.env` before first start, or change in production!)

## Quick start (Docker)

```bash
docker compose up --build
```
Frontend: http://localhost:5173 · API: http://localhost:5000/health

## Using the app
1. Register a student at `/student/register`.
2. Log in at `/admin/login`, create a drive (tick "Notify eligible students" to email them).
3. Log in as the student: see drives with Eligible / Not eligible + reasons, save and apply.

If `EMAIL_USER` / `EMAIL_PASSWORD` are empty, emails are printed in the backend console instead of being sent.
For Gmail use an App Password (Google Account → Security → 2-Step Verification → App passwords).

## Eligibility rules
A student is eligible when all set criteria pass: min 10th / 12th / diploma / semester 6 percentage,
max backlogs, and all required skills (case-insensitive). Missing marks count as "not provided".

## API
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login`, `/api/auth/admin/login` | public |
| GET | `/api/auth/check-prn?prn=`, `/api/auth/check-email?email=` | public |
| GET/PUT | `/api/students/me` | student |
| GET | `/api/students/matches`, `/saved`, `/applied` | student |
| POST/DELETE | `/api/students/drives/:id/save` | student |
| POST | `/api/students/drives/:id/apply` | student |
| GET | `/api/admin/dashboard`, `/api/admin/students?search=` | admin |
| GET/POST | `/api/admin/drives` | admin |
| GET/PUT/DELETE | `/api/admin/drives/:id` | admin |
| POST | `/api/admin/drives/:id/notify` | admin |
| GET | `/api/admin/drives/:id/eligible-students` | admin |
| POST | `/api/chatbot` | public (rule-based stub) |

## Validation (frontend Yup + backend Joi, same rules)
- Name 2–100 letters/spaces · PRN 6–20 alphanumeric, unique · Email valid, unique
- Password ≥ 8 chars with upper, lower and a digit · Phone exactly 10 digits
- Percentages 0–100 (10th required, others optional) · Backlogs integer ≥ 0
- At least one skill · Address 5–500 chars
- Drive: company 2–150, ≥ 1 job post (title + vacancies ≥ 1), description ≥ 10 chars,
  date today or later (when creating), valid http(s) apply link

Error responses: `{ "status": "error", "message": "...", "errors": [{ "field", "message" }] }`

## Troubleshooting
| Problem | Fix |
|---|---|
| `MongoDB connection` error | Start MongoDB (`mongosh` should connect) / check `MONGODB_URI` |
| `Access denied for user 'root'` | Put your real MySQL password in `backend/.env` → `MYSQL_PASSWORD` |
| `JWT_SECRET is missing` | Copy `backend/.env.example` to `backend/.env` |
| Port in use | Change `PORT` in `backend/.env` (and the proxy target in `frontend/vite.config.js`) |
| "Cannot reach the server" in browser | Backend isn't running on port 5000 |
| CORS error | Set `FRONTEND_URL` in `backend/.env` to your frontend origin |

## Production notes
Set a long random `JWT_SECRET`, change the admin password, set `NODE_ENV=production`,
`AUTH_RATE_LIMIT=10`, use HTTPS, and run `npm run build` in `frontend` to serve the static `dist/` folder.
