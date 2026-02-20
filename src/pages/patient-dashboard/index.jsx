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

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isVerified, setIsVerified] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);

    // Fetch user verification status
    const fetchStatus = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const userId = storedUser?._id || storedUser?.id;
        if (userId) {
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
          try {
            const response = await axios.get(`${API_BASE_URL}/api/patients/${userId}`);
            // API returns { patient: ... }
            if (response.data?.patient?.isPatientVerified) {
              setIsVerified(true);
            }
          } catch (err) {
            console.error("Failed to fetch verification status", err);
          }
        }
      } catch (e) { console.error(e); }
    };
    fetchStatus();

    return () => clearInterval(timer);
  }, []);



  const todayMood = {
    mood: "good",
    timestamp: "Today, 9:30 AM",
    note: "Feeling optimistic about the day ahead. Morning meditation helped set a positive tone."
  };

  const upcomingAppointment = {
    counsellorName: "Dr. Sarah Mitchell",
    counsellorImage: "https://img.rocket.new/generatedImages/rocket_gen_img_1b89b78ce-1763295575405.png",
    counsellorImageAlt: "Professional female counsellor with warm smile wearing white coat in modern office setting",
    specialization: "Clinical Psychologist",
    date: "Dec 3, 2025",
    time: "2:00 PM - 3:00 PM",
    status: "confirmed"
  };

  const moodTrendData = [
    { date: "Nov 25", mood: "okay" },
    { date: "Nov 26", mood: "good" },
    { date: "Nov 27", mood: "low" },
    { date: "Nov 28", mood: "good" },
    { date: "Nov 29", mood: "excellent" },
    { date: "Nov 30", mood: "good" },
    { date: "Dec 1", mood: "good" }];


  const journalEntries = [
    {
      id: 1,
      title: "Morning Reflections",
      date: "Dec 1, 2025",
      preview: "Started the day with gratitude practice. Noticed feeling more centered and present. The breathing exercises from yesterday\'s session really helped...",
      mood: "positive"
    },
    {
      id: 2,
      title: "Work Stress Management",
      date: "Nov 30, 2025",
      preview: "Challenging day at work but used the coping strategies discussed in therapy. Taking breaks helped maintain perspective...",
      mood: "neutral"
    },
    {
      id: 3,
      title: "Weekend Plans",
      date: "Nov 29, 2025",
      preview: "Looking forward to spending time with family this weekend. Planning activities that bring joy and connection...",
      mood: "positive"
    }];


  const activeGoals = [
    {
      id: 1,
      title: "Daily Meditation Practice",
      progress: 85,
      completed: 17,
      total: 20,
      daysLeft: 3
    },
    {
      id: 2,
      title: "Exercise 3x per Week",
      progress: 66,
      completed: 8,
      total: 12,
      daysLeft: 7
    },
    {
      id: 3,
      title: "Reduce Screen Time",
      progress: 45,
      completed: 9,
      total: 20,
      daysLeft: 11
    }];


  const trustedCircle = [
    {
      id: 1,
      name: "Emily Johnson",
      avatar: "https://images.unsplash.com/photo-1583892709436-4379c0927e16",
      avatarAlt: "Young woman with brown hair smiling warmly wearing casual blue sweater outdoors",
      relationship: "Best Friend",
      isOnline: true
    },
    {
      id: 2,
      name: "Michael Chen",
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1418365a1-1763293544915.png",
      avatarAlt: "Professional Asian man with glasses wearing business casual attire in office environment",
      relationship: "Brother",
      isOnline: false
    },
    {
      id: 3,
      name: "Lisa Anderson",
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_162996754-1763293994014.png",
      avatarAlt: "Confident woman with long dark hair in professional setting wearing elegant black outfit",
      relationship: "Mother",
      isOnline: true
    }];


  const forumActivities = [
    {
      id: 1,
      type: "trending",
      title: "Coping with Social Anxiety",
      preview: "Sharing strategies that have helped me manage social situations...",
      replies: 24,
      likes: 45,
      time: "2h ago"
    },
    {
      id: 2,
      type: "new_post",
      title: "Morning Routine Success",
      preview: "Finally established a consistent morning routine that works...",
      replies: 12,
      likes: 28,
      time: "5h ago"
    },
    {
      id: 3,
      type: "reply",
      title: "Sleep Improvement Tips",
      preview: "These techniques really helped improve my sleep quality...",
      replies: 18,
      likes: 33,
      time: "1d ago"
    }];


  const recommendedResources = [
    {
      id: 1,
      type: "video",
      title: "Understanding Anxiety Triggers",
      description: "Learn to identify and manage your anxiety triggers",
      thumbnail: "https://images.unsplash.com/photo-1585125870798-2be228292dee",
      thumbnailAlt: "Peaceful meditation scene with person sitting cross-legged in serene natural environment",
      category: "Anxiety",
      duration: "12 min"
    },
    {
      id: 2,
      type: "article",
      title: "Building Healthy Habits",
      description: "Evidence-based strategies for lasting change",
      thumbnail: "https://images.unsplash.com/photo-1583237834814-1082632a0df2",
      thumbnailAlt: "Open journal with pen on wooden desk next to coffee cup in warm morning light",
      category: "Wellness",
      duration: "8 min read"
    },
    {
      id: 3,
      type: "audio",
      title: "Guided Sleep Meditation",
      description: "Relaxation techniques for better sleep",
      thumbnail: "https://images.unsplash.com/photo-1673727667979-d3c7f37cee77",
      thumbnailAlt: "Peaceful bedroom scene with soft lighting and comfortable bedding promoting restful sleep",
      category: "Sleep",
      duration: "20 min"
    }];


  const wellnessScore = {
    score: 78,
    trend: 8,
    factors: [
      { name: "Mood Stability", value: 82, icon: "Heart" },
      { name: "Sleep Quality", value: 75, icon: "Moon" },
      { name: "Activity Level", value: 68, icon: "Activity" },
      { name: "Social Connection", value: 85, icon: "Users" }]

  };

  const handleEmergency = () => {
    const confirmed = window.confirm(
      "You're about to call the National Suicide Prevention Lifeline (988).\n\nThis is a free, confidential crisis support service available 24/7.\n\nPress OK to proceed with the call."
    );
    if (confirmed) {
      window.location.href = 'tel:988';
    }
  };

  const getGreeting = () => {
    const hour = currentTime?.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <RoleBasedSidebar userRole="patient" />

        <div className="main-content">
          <BreadcrumbTrail />

          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
                {getGreeting()}, Alex
              </h1>
              <p className="text-muted-foreground">
                {currentTime?.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            {/* Verification Status Badge */}
            <div className="mb-2">
              {isVerified ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full border border-blue-200 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span className="font-medium text-sm">Verified Patient</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full border border-gray-200 shadow-sm" title="Your account verified by a counsellor after an appointment">
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                  <span className="font-medium text-sm">Unverified</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-1">
              <MoodSummaryCard
                todayMood={todayMood}
                onQuickEntry={() => navigate('/mood-tracker')} />

            </div>
            <div className="lg:col-span-1">
              <UpcomingAppointmentCard
                appointment={upcomingAppointment}
                onViewDetails={() => navigate('/appointment-booking')} />

            </div>
            <div className="lg:col-span-1">
              <WellnessScoreCard
                score={wellnessScore?.score}
                trend={wellnessScore?.trend}
                factors={wellnessScore?.factors} />

            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <MoodTrendChart data={moodTrendData} />
            <div className="grid grid-cols-2 gap-4">
              <QuickActionTile
                title="Mood Tracker"
                description="Log your daily mood"
                iconName="Heart"
                color="primary"
                onClick={() => navigate('/mood-tracker')} />

              <QuickActionTile
                title="Journal"
                description="Write your thoughts"
                iconName="BookOpen"
                color="secondary"
                onClick={() => navigate('/wellness-hub')} />

              <QuickActionTile
                title="Breathing"
                description="Guided exercises"
                iconName="Wind"
                color="accent"
                onClick={() => navigate('/wellness-hub')} />

              <QuickActionTile
                title="Resources"
                description="Browse library"
                iconName="Library"
                color="success"
                onClick={() => navigate('/resource-library')}
                badge="3 New" />

            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <JournalEntriesCard
              entries={journalEntries}
              onViewAll={() => navigate('/wellness-hub')}
              onNewEntry={() => navigate('/wellness-hub')} />

            <BreathingExerciseCard
              onStartExercise={() => navigate('/wellness-hub')} />

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <GoalProgressCard
              goals={activeGoals}
              onManageGoals={() => navigate('/wellness-hub')} />

            <TrustedCircleCard
              members={trustedCircle}
              onMessage={(id) => console.log('Message member:', id)}
              onManageCircle={() => console.log('Manage circle')} />

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ForumActivityCard
              activities={forumActivities}
              onViewForums={() => console.log('View forums')} />

            <ResourceRecommendationsCard
              resources={recommendedResources}
              onViewLibrary={() => navigate('/resource-library')} />

          </div>
        </div>

        <SOSFloatingButton onEmergency={handleEmergency} />
      </div>
    </SidebarProvider>);

};

export default PatientDashboard;