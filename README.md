# Campus Launch Pad 🚀

**Live demo:** [campus-launch-pad.vercel.app](https://campus-launch-pad.vercel.app)

Campus Launch Pad is a full-stack platform that helps students discover personalized opportunities (internships, hackathons, jobs, workshops, competitions) and find teammates to build projects with. Students build a profile with their skills and interests, get explainable, scored recommendations instead of a generic list, and can post project ideas, invite other students, and track applications — all in one place.



## ✨ Key Features

- **Authentication** — secure registration/login with hashed passwords (bcrypt) and JWT-protected routes
- **Student profiles** — skills (with proficiency level), interests, domains, college/course/year, profile photo upload
- **Explainable recommendation engine** — a custom weighted scoring algorithm (skills 50%, domain 30%, interests 20%) that shows *why* an opportunity was recommended, not just a match %
- **Opportunity discovery** — search and filter by keyword, type, domain, and mode (remote/in-person)
- **Save & apply** — bookmark opportunities and track application status
- **Project & team formation** — post a project idea, invite students to join, manage incoming/outgoing invitations
- **Admin dashboard** — manage opportunities and view registered students
- **Role-based access control** — student vs. admin permissions enforced on the backend, not just hidden in the UI

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), React Router, Axios, Context API for auth state
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas with Mongoose
- **Auth**: bcryptjs (password hashing) + JSON Web Tokens
- **Deployment**: Frontend on Vercel, backend on Render, database on MongoDB Atlas

---

## 📁 Project Structure

```text
campus-launch-pad/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── assets/             # Static media assets & icons
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # Auth context provider
│   │   ├── pages/               # Application views (student/, admin/)
│   │   ├── services/            # Axios API client
│   │   ├── styles/              # Modular CSS
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── vite.config.js
├── server/                     # Node.js + Express Backend
│   ├── config/                 # DB connection
│   ├── controllers/            # Request handlers (auth, profile, opportunities,
│   │                           #   applications, recommendations, admin, projects, invitations)
│   ├── middleware/              # JWT auth + role checks, file upload
│   ├── models/                  # Mongoose schemas
│   ├── routes/
│   ├── utils/                   # matchingEngine.js — the recommendation scoring logic
│   └── server.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- A MongoDB Atlas connection string

### 1. Backend Setup
```bash
cd server
npm install
cp .env.example .env   # add your MONGO_URI and JWT_SECRET
npm run dev
# Server runs on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd client
npm install
cp .env.example .env
npm run dev
# Client runs on http://localhost:5173
```

---

## 📡 API Health Check

```
GET /api/health
```
Returns server status, database connection state, environment, and uptime.

---

## 🗺️ Project Status

Core product is built and deployed:

- [x] Client/server setup, health checks, CORS, env config
- [x] Frontend routing & page structure
- [x] MongoDB schemas (Users, Profiles, Opportunities, Applications, Projects, Invitations)
- [x] Registration & login
- [x] JWT authentication & protected/role-based routes
- [x] Student profile management (skills, interests, photo upload)
- [x] Opportunity CRUD (admin-managed)
- [x] Search & filtering
- [x] Save opportunities
- [x] Application tracking
- [x] Explainable recommendation engine
- [x] Admin dashboard
- [x] Project posting & team invitations
- [x] Deployment (Vercel + Render + MongoDB Atlas)
- [ ] Automated tests
- [ ] Real-time notifications for new matches/invitations

---

## 🧭 Why I built this
I built Campus Launch Pad after noticing how difficult it can be for students to discover relevant opportunities, showcase their skills, and find the right teammates for hackathons and projects. The goal was to create one platform where students can discover opportunities, connect with like-minded peers, share ideas, and build projects together.


Built by Siddhi Bhatia. Feedback and contributions welcome — feel free to open an issue.
