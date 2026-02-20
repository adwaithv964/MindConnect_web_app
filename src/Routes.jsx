import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import AppointmentBooking from './pages/appointment-booking';
import WellnessHub from './pages/wellness-hub';
import CounsellorDashboard from './pages/counsellor-dashboard';
import PatientDashboard from './pages/patient-dashboard';
import MoodTracker from './pages/mood-tracker';
import ResourceLibrary from './pages/resource-library';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ScheduleManager from './pages/counsellor-dashboard/ScheduleManager';
import PatientRecords from './pages/counsellor-dashboard/PatientRecords';
import ConsultationRoom from './pages/counsellor-dashboard/ConsultationRoom';
import CounsellorProfile from './pages/counsellor-dashboard/CounsellorProfile';
import SettingsGeneral from './pages/counsellor-dashboard/settings/SettingsGeneral';
import SettingsPreferences from './pages/counsellor-dashboard/settings/SettingsPreferences';
import AppointmentRequests from './pages/counsellor-dashboard/AppointmentRequests';
import LandingPage from './pages/LandingPage';
import CounsellorLayout from './components/layout/CounsellorLayout';
import PatientLayout from './components/layout/PatientLayout';
import PatientProfile from './pages/patient-dashboard/PatientProfile';
import PatientRequests from './pages/patient-dashboard/PatientRequests';
import MyBookings from './pages/my-bookings';

const Routes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <ScrollToTop />
          <RouterRoutes>
            {/* Public routes */}
            <Route path="/" element={<AuthRedirect><LandingPage /></AuthRedirect>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/appointment-booking" element={<AppointmentBooking />} />
            <Route path="/wellness-hub" element={<WellnessHub />} />

            {/* Counsellor Routes — only accessible to counsellors */}
            <Route path="/counsellor-dashboard" element={<ProtectedRoute role="counsellor"><CounsellorLayout><CounsellorDashboard /></CounsellorLayout></ProtectedRoute>} />
            <Route path="/counsellor/schedule" element={<ProtectedRoute role="counsellor"><CounsellorLayout><ScheduleManager /></CounsellorLayout></ProtectedRoute>} />
            <Route path="/counsellor/patients" element={<ProtectedRoute role="counsellor"><CounsellorLayout><PatientRecords /></CounsellorLayout></ProtectedRoute>} />
            <Route path="/counsellor/consultation" element={<ProtectedRoute role="counsellor"><CounsellorLayout><ConsultationRoom /></CounsellorLayout></ProtectedRoute>} />
            <Route path="/counsellor/profile" element={<ProtectedRoute role="counsellor"><CounsellorLayout><CounsellorProfile /></CounsellorLayout></ProtectedRoute>} />
            <Route path="/counsellor/settings/general" element={<ProtectedRoute role="counsellor"><CounsellorLayout><SettingsGeneral /></CounsellorLayout></ProtectedRoute>} />
            <Route path="/counsellor/settings/preferences" element={<ProtectedRoute role="counsellor"><CounsellorLayout><SettingsPreferences /></CounsellorLayout></ProtectedRoute>} />
            <Route path="/counsellor/requests" element={<ProtectedRoute role="counsellor"><CounsellorLayout><AppointmentRequests /></CounsellorLayout></ProtectedRoute>} />

            {/* Patient Routes — only accessible to patients */}
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            <Route path="/mood-tracker" element={<PatientLayout><MoodTracker /></PatientLayout>} />
            <Route path="/resource-library" element={<PatientLayout><ResourceLibrary /></PatientLayout>} />
            <Route path="/patient/profile" element={<ProtectedRoute role="patient"><PatientLayout><PatientProfile /></PatientLayout></ProtectedRoute>} />
            <Route path="/patient/requests" element={<ProtectedRoute role="patient"><PatientLayout><PatientRequests /></PatientLayout></ProtectedRoute>} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/settings/general" element={<PatientLayout><SettingsGeneral /></PatientLayout>} />
            <Route path="/settings/preferences" element={<PatientLayout><SettingsPreferences /></PatientLayout>} />

            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
};

// Redirects unauthenticated users to login; redirects wrong-role users to their own dashboard
const ProtectedRoute = ({ children, role }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) return null; // Wait for auth to resolve

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If role is specified and user has a different role, send them to their correct dashboard
  if (role && userRole && userRole !== role) {
    console.warn(`[ProtectedRoute] User role "${userRole}" tried to access "${role}" route. Redirecting.`);
    if (userRole === 'counsellor') return <Navigate to="/counsellor-dashboard" replace />;
    if (userRole === 'admin') return <Navigate to="/admin-dashboard" replace />;
    return <Navigate to="/patient-dashboard" replace />;
  }

  return children;
};

// Helper component to redirect if already authenticated
const AuthRedirect = ({ children }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (currentUser) {
    if (userRole === 'counsellor') {
      return <Navigate to="/counsellor-dashboard" replace />;
    } else if (userRole === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else {
      return <Navigate to="/patient-dashboard" replace />;
    }
  }

  return children;
};

export default Routes;

