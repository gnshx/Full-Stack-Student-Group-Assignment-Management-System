import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PrivateRoute } from './routes/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';

import StudentDashboard from './pages/student/Dashboard';
import StudentGroups from './pages/student/Groups';
import StudentAssignments from './pages/student/Assignments';

import AdminDashboard from './pages/admin/Dashboard';
import AdminAssignments from './pages/admin/Assignments';
import AdminGroups from './pages/admin/Groups';
import AdminAnalytics from './pages/admin/Analytics';

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Student Protected Routes */}
          <Route element={<PrivateRoute allowedRole="student" />}>
            <Route element={<Layout />}>
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/student/groups" element={<StudentGroups />} />
              <Route path="/student/assignments" element={<StudentAssignments />} />
            </Route>
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<PrivateRoute allowedRole="admin" />}>
            <Route element={<Layout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/assignments" element={<AdminAssignments />} />
              <Route path="/admin/groups" element={<AdminGroups />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
