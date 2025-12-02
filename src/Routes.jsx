import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
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
import LandingPage from './pages/LandingPage';
import CounsellorLayout from './components/layout/CounsellorLayout';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Define your route here */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/appointment-booking" element={<AppointmentBooking />} />
          <Route path="/wellness-hub" element={<WellnessHub />} />
          <Route path="/counsellor-dashboard" element={<CounsellorLayout><CounsellorDashboard /></CounsellorLayout>} />
          <Route path="/counsellor/schedule" element={<CounsellorLayout><ScheduleManager /></CounsellorLayout>} />
          <Route path="/counsellor/patients" element={<CounsellorLayout><PatientRecords /></CounsellorLayout>} />
          <Route path="/counsellor/consultation" element={<CounsellorLayout><ConsultationRoom /></CounsellorLayout>} />
          <Route path="/counsellor/profile" element={<CounsellorLayout><ProfileEditor /></CounsellorLayout>} />
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/mood-tracker" element={<MoodTracker />} />
          <Route path="/resource-library" element={<ResourceLibrary />} />
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
