import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SidebarProvider } from '../../components/ui/RoleBasedSidebar';
import RoleBasedSidebar from '../../components/ui/RoleBasedSidebar';
import SOSFloatingButton from '../../components/ui/SOSFloatingButton';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import MoodSummaryCard from './components/MoodSummaryCard';
import UpcomingAppointmentCard from './components/UpcomingAppointmentCard';
import MoodTrendChart from './components/MoodTrendChart';
import QuickActionTile from './components/QuickActionTile';
import JournalEntriesCard from './components/JournalEntriesCard';
import BreathingExerciseCard from './components/BreathingExerciseCard';
import GoalProgressCard from './components/GoalProgressCard';
import TrustedCircleCard from './components/TrustedCircleCard';
import ForumActivityCard from './components/ForumActivityCard';
import ResourceRecommendationsCard from './components/ResourceRecommendationsCard';
import WellnessScoreCard from './components/WellnessScoreCard';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);

    const init = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = storedUser?._id || storedUser?.id;
        const name = storedUser?.name || storedUser?.email?.split('@')[0] || 'there';
        setUserName(name.split(' ')[0]); // first name only

        if (!userId) { setLoading(false); return; }

        // Fetch verification status + dashboard data in parallel
        const [dashRes, patientRes] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/api/dashboard/${userId}`),
          axios.get(`${API_BASE_URL}/api/patients/${userId}`)
        ]);

        if (dashRes.status === 'fulfilled') {
          setDashboardData(dashRes.value.data);
        }
        if (patientRes.status === 'fulfilled' && patientRes.value.data?.patient?.isPatientVerified) {
          setIsVerified(true);
        }
      } catch (e) {
        console.error('Dashboard init error:', e);
      } finally {
        setLoading(false);
      }
    };

    init();
    return () => clearInterval(timer);
  }, []);

  const handleEmergency = () => {
    const confirmed = window.confirm(
      "You're about to call the National Suicide Prevention Lifeline (988).\n\nThis is a free, confidential crisis support service available 24/7.\n\nPress OK to proceed with the call."
    );
    if (confirmed) window.location.href = 'tel:988';
  };

  const getGreeting = () => {
    const h = currentTime?.getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Skeleton loading block
  const Skeleton = ({ className = '' }) => (
    <div className={`animate-pulse bg-muted rounded-lg ${className}`} />
  );

  const d = dashboardData;

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <RoleBasedSidebar userRole="patient" />

        <div className="main-content">
          <BreadcrumbTrail />

          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
                {getGreeting()}, {userName || '…'}
              </h1>
              <p className="text-muted-foreground">
                {currentTime?.toLocaleDateString('en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            </div>
            <div className="mb-2">
              {isVerified ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full border border-blue-200 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="font-medium text-sm">Verified Patient</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full border border-gray-200 shadow-sm"
                  title="Your account is verified by a counsellor after an appointment">
                  <span className="w-2 h-2 rounded-full bg-gray-400" />
                  <span className="font-medium text-sm">Unverified</span>
                </div>
              )}
            </div>
          </div>

          {/* Top row: Mood / Appointment / Wellness */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-1">
              {loading ? <Skeleton className="h-64" /> : (
                <MoodSummaryCard
                  todayMood={d?.todayMood}
                  onQuickEntry={() => navigate('/mood-tracker')}
                />
              )}
            </div>
            <div className="lg:col-span-1">
              {loading ? <Skeleton className="h-64" /> : (
                <UpcomingAppointmentCard
                  appointment={d?.upcomingAppointment}
                  onViewDetails={() => navigate('/appointment-booking')}
                  onReschedule={() => navigate('/appointment-booking')}
                />
              )}
            </div>
            <div className="lg:col-span-1">
              {loading ? <Skeleton className="h-64" /> : (
                <WellnessScoreCard
                  score={d?.wellnessScore?.score ?? '--'}
                  trend={d?.wellnessScore?.trend ?? 0}
                  factors={d?.wellnessScore?.factors ?? []}
                />
              )}
            </div>
          </div>

          {/* Mood trend + Quick actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {loading ? <Skeleton className="h-80" /> : (
              <MoodTrendChart data={d?.moodTrend ?? []} stats={d?.moodStats} />
            )}
            <div className="grid grid-cols-2 gap-4">
              <QuickActionTile title="Mood Tracker" description="Log your daily mood"
                iconName="Heart" color="primary" onClick={() => navigate('/mood-tracker')} />
              <QuickActionTile title="Journal" description="Write your thoughts"
                iconName="BookOpen" color="secondary" onClick={() => navigate('/wellness-hub')} />
              <QuickActionTile title="Breathing" description="Guided exercises"
                iconName="Wind" color="accent" onClick={() => navigate('/wellness-hub')} />
              <QuickActionTile title="Resources" description="Browse library"
                iconName="Library" color="success" onClick={() => navigate('/resource-library')} badge="New" />
            </div>
          </div>

          {/* Journal + Breathing */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {loading ? <Skeleton className="h-72" /> : (
              <JournalEntriesCard
                entries={d?.journalEntries ?? []}
                onViewAll={() => navigate('/wellness-hub')}
                onNewEntry={() => navigate('/wellness-hub')}
              />
            )}
            <BreathingExerciseCard
              breathingStats={d?.breathingStats}
              onStartExercise={() => navigate('/wellness-hub')}
            />
          </div>

          {/* Goals + Trusted Circle */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {loading ? <Skeleton className="h-72" /> : (
              <GoalProgressCard
                goals={d?.goals ?? []}
                breathingStreak={d?.breathingStats?.streak ?? 0}
                onManageGoals={() => navigate('/wellness-hub')}
              />
            )}
            <TrustedCircleCard
              members={[]}
              onMessage={(id) => console.log('Message member:', id)}
              onManageCircle={() => console.log('Manage circle')}
            />
          </div>

          {/* Forum + Resources */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ForumActivityCard activities={[]} onViewForums={() => { }} />
            <ResourceRecommendationsCard
              resources={[]}
              onViewLibrary={() => navigate('/resource-library')}
            />
          </div>
        </div>

        <SOSFloatingButton onEmergency={handleEmergency} />
      </div>
    </SidebarProvider>
  );
};

export default PatientDashboard;