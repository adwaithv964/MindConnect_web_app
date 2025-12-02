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

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Define your route here */}
          <Route path="/" element={<PatientDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/appointment-booking" element={<AppointmentBooking />} />
          <Route path="/wellness-hub" element={<WellnessHub />} />
          <Route path="/counsellor-dashboard" element={<CounsellorDashboard />} />
          <Route path="/counsellor/schedule" element={<ScheduleManager />} />
          <Route path="/counsellor/patients" element={<PatientRecords />} />
          <Route path="/counsellor/consultation" element={<ConsultationRoom />} />
          <Route path="/counsellor/profile" element={<ProfileEditor />} />
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
