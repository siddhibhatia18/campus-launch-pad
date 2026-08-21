# Campus Launch Pad 🚀

Campus Launch Pad is a full-stack student opportunity discovery platform. It enables students to build profiles, showcase their skills and projects, and discover personalized, explainable recommendations for internships, hackathons, jobs, workshops, and competitions.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), JavaScript, Plain CSS, React Router DOM, Axios
- **Backend**: Node.js, Express.js, CORS, dotenv
- **Database**: MongoDB Atlas with Mongoose (Phase 4+)
- **Authentication**: bcryptjs & JSON Web Tokens (JWT) (Phase 5+)
- **Deployment Targets**: Frontend on Vercel, Backend on Render, Database on MongoDB Atlas

---

## 📁 Project Structure

```text
campus-launch-pad/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── assets/             # Static media assets & icons
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # React Context providers (Auth, etc.)
│   │   ├── pages/              # Application views & pages
│   │   ├── services/           # Axios HTTP client & API services
│   │   ├── styles/             # Modular plain CSS stylesheets
│   │   ├── App.jsx             # Root application component
│   │   └── main.jsx            # Entry point
│   ├── .env                    # Frontend environment variables
│   ├── .env.example            # Example frontend environment variables
│   ├── index.html              # HTML shell
│   ├── package.json            # Frontend dependencies & scripts
│   └── vite.config.js          # Vite configuration
├── server/                     # Node.js + Express Backend
│   ├── config/                 # DB connection & environment configurations
│   ├── controllers/            # Request handlers
│   ├── middleware/             # Auth & error handling middlewares
│   ├── models/                 # Mongoose schemas & models
│   ├── routes/                 # Express API routes
│   ├── utils/                  # Helper utilities (scoring engine, etc.)
│   ├── .env                    # Backend environment variables
│   ├── .env.example            # Example backend environment variables
│   ├── package.json            # Backend dependencies & scripts
│   └── server.js               # Express application entry point
├── .gitignore                  # Git ignore rules for dependencies & secrets
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Backend Setup
```bash
# Navigate to the server folder
cd server

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Run the development server
npm run dev
# Server will run on: http://localhost:5000
```

### 2. Frontend Setup
```bash
# In a new terminal, navigate to the client folder
cd client

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Run the development server
npm run dev
# Client will run on: http://localhost:5173
```

---

## 📡 API Health Check

The backend exposes a health check endpoint to verify server status:
- **URL**: `http://localhost:5000/api/health`
- **Method**: `GET`
- **Response**:
```json
{
  "status": "ok",
  "message": "Campus Launch Pad API is running",
  "timestamp": "2026-08-20T17:20:00.000Z",
  "environment": "development"
}
```

---

## 🗺️ Implementation Roadmap
- [x] **Phase 1: Project Setup** (Independent client/server, health API, CORS, environment variables)
- [ ] **Phase 2: Basic Frontend Structure & Routing**
- [ ] **Phase 3: Backend Setup & Extended Health API**
- [ ] **Phase 4: MongoDB Connection & Schemas**
- [ ] **Phase 5: Registration & Login**
- [ ] **Phase 6: JWT Authentication & Protected Routes**
- [ ] **Phase 7: Student Profile Management**
- [ ] **Phase 8: Opportunity CRUD**
- [ ] **Phase 9: Search & Filtering**
- [ ] **Phase 10: Save Opportunities**
- [ ] **Phase 11: Application Tracking**
- [ ] **Phase 12: Recommendation Engine**
- [ ] **Phase 13: Admin Features**
- [ ] **Phase 14: Final Testing**
- [ ] **Phase 15: GitHub Documentation**
- [ ] **Phase 16: Deployment**
