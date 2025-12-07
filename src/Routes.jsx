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
import ProfileEditor from './pages/counsellor-dashboard/ProfileEditor';
import SettingsGeneral from './pages/counsellor-dashboard/settings/SettingsGeneral';
import SettingsPreferences from './pages/counsellor-dashboard/settings/SettingsPreferences';
import LandingPage from './pages/LandingPage';
import CounsellorLayout from './components/layout/CounsellorLayout';
import PatientLayout from './components/layout/PatientLayout';

const Routes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <ScrollToTop />
          <RouterRoutes>
            {/* Define your route here */}
            <Route path="/" element={<AuthRedirect><LandingPage /></AuthRedirect>} />
            <Route path="/login" element={<AuthRedirect><Login /></AuthRedirect>} />
            <Route path="/register" element={<AuthRedirect><Register /></AuthRedirect>} />

            <Route path="/appointment-booking" element={<AppointmentBooking />} />
            <Route path="/wellness-hub" element={<WellnessHub />} />

            {/* Counsellor Routes */}
            <Route path="/counsellor-dashboard" element={<CounsellorLayout><CounsellorDashboard /></CounsellorLayout>} />
            <Route path="/counsellor/schedule" element={<CounsellorLayout><ScheduleManager /></CounsellorLayout>} />
            <Route path="/counsellor/patients" element={<CounsellorLayout><PatientRecords /></CounsellorLayout>} />
            <Route path="/counsellor/consultation" element={<CounsellorLayout><ConsultationRoom /></CounsellorLayout>} />
            <Route path="/counsellor/profile" element={<CounsellorLayout><ProfileEditor /></CounsellorLayout>} />
            <Route path="/counsellor/settings/general" element={<CounsellorLayout><SettingsGeneral /></CounsellorLayout>} />
            <Route path="/counsellor/settings/preferences" element={<CounsellorLayout><SettingsPreferences /></CounsellorLayout>} />

            {/* Patient Routes */}
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            <Route path="/mood-tracker" element={<PatientLayout><MoodTracker /></PatientLayout>} />
            <Route path="/resource-library" element={<PatientLayout><ResourceLibrary /></PatientLayout>} />
            <Route path="/settings/profile" element={<PatientLayout><ProfileEditor /></PatientLayout>} />
            <Route path="/settings/general" element={<PatientLayout><SettingsGeneral /></PatientLayout>} />
            <Route path="/settings/preferences" element={<PatientLayout><SettingsPreferences /></PatientLayout>} />

            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
};

// Helper component to redirect if already authenticated
const AuthRedirect = ({ children }) => {
  const { currentUser, userRole, loading } = useAuth();

  // While loading auth state, we might want to show nothing or a spinner
  // But since the AuthProvider has a "loading" state that blocks children rendering, we might be fine.

  if (currentUser) {
    if (userRole === 'counsellor') {
      return <Navigate to="/counsellor-dashboard" replace />;
    } else if (userRole === 'admin') {
      // Assuming admin route exists or handled, if not strictly defined in routes above, default to patient or specific
      return <Navigate to="/admin-dashboard" replace />;
    } else {
      return <Navigate to="/patient-dashboard" replace />;
    }
  }

  return children;
};

export default Routes;
