import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import ExploreOpportunities from './pages/student/ExploreOpportunities';
import SavedOpportunities from './pages/student/SavedOpportunities';
import MyApplications from './pages/student/MyApplications';
import Recommendations from './pages/student/Recommendations';
import ProjectIdeas from './pages/student/ProjectIdeas';
import CreateProject from './pages/student/CreateProject';
import ProjectDetail from './pages/student/ProjectDetail';
import MyProjects from './pages/student/MyProjects';
import Invitations from './pages/student/Invitations';
import DiscoverStudents from './pages/student/DiscoverStudents';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageOpportunities from './pages/admin/ManageOpportunities';
import StudentsList from './pages/admin/StudentsList';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Pages */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Student Portal Routes (Protected) */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<Navigate to="/student/dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="discover" element={<DiscoverStudents />} />
              <Route path="students" element={<DiscoverStudents />} />
              <Route path="projects" element={<ProjectIdeas />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="create-project" element={<CreateProject />} />
              <Route path="my-projects" element={<MyProjects />} />
              <Route path="invitations" element={<Invitations />} />
              <Route path="opportunities" element={<ExploreOpportunities />} />
              <Route path="saved" element={<SavedOpportunities />} />
              <Route path="applications" element={<MyApplications />} />
              <Route path="recommendations" element={<Recommendations />} />
            </Route>
          </Route>

          {/* Admin Console Routes (Protected) */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="opportunities" element={<ManageOpportunities />} />
              <Route path="students" element={<StudentsList />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
