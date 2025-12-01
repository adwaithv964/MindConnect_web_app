import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '../../components/ui/RoleBasedSidebar';
import RoleBasedSidebar from '../../components/ui/RoleBasedSidebar';
import SOSFloatingButton from '../../components/ui/SOSFloatingButton';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import PatientOverviewCard from './components/PatientOverviewCard';
import MoodTrendChart from './components/MoodTrendChart';
import UpcomingAppointments from './components/UpcomingAppointments';
import RiskAssessmentPanel from './components/RiskAssessmentPanel';
import PatientEngagementMetrics from './components/PatientEngagementMetrics';
import QuickActionsPanel from './components/QuickActionsPanel';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';

const CounsellorDashboard = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [filterRisk, setFilterRisk] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const patients = [
  {
    id: "PT-2024-001",
    name: "Sarah Johnson",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1985c262f-1763294244026.png",
    avatarAlt: "Professional headshot of young woman with blonde hair wearing blue blazer smiling warmly",
    isOnline: true,
    currentMood: "anxious",
    riskLevel: "medium",
    progressScore: 68,
    totalSessions: 12,
    goalsCompleted: 4,
    totalGoals: 6,
    lastSession: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    recentNotes: "Patient showing improvement in anxiety management. Continue CBT techniques and breathing exercises."
  },
  {
    id: "PT-2024-002",
    name: "Michael Chen",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1bd15b436-1763300581767.png",
    avatarAlt: "Professional headshot of Asian man with short black hair wearing gray suit and glasses",
    isOnline: false,
    currentMood: "stressed",
    riskLevel: "high",
    progressScore: 45,
    totalSessions: 8,
    goalsCompleted: 2,
    totalGoals: 5,
    lastSession: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    recentNotes: "Increased stress levels due to work pressure. Recommended stress management workshop and mindfulness practice."
  },
  {
    id: "PT-2024-003",
    name: "Emily Rodriguez",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_107555573-1763296653935.png",
    avatarAlt: "Professional headshot of Hispanic woman with long brown hair wearing white blouse smiling confidently",
    isOnline: true,
    currentMood: "happy",
    riskLevel: "low",
    progressScore: 85,
    totalSessions: 15,
    goalsCompleted: 7,
    totalGoals: 8,
    lastSession: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    recentNotes: "Excellent progress in managing depression symptoms. Patient reports improved sleep and social engagement."
  },
  {
    id: "PT-2024-004",
    name: "David Thompson",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1219eacec-1763294869102.png",
    avatarAlt: "Professional headshot of young man with brown hair wearing navy blue shirt with friendly expression",
    isOnline: false,
    currentMood: "sad",
    riskLevel: "critical",
    progressScore: 32,
    totalSessions: 6,
    goalsCompleted: 1,
    totalGoals: 4,
    lastSession: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    recentNotes: "Patient missed last two sessions. Expressing suicidal ideation. Immediate follow-up required."
  },
  {
    id: "PT-2024-005",
    name: "Lisa Anderson",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1b032f6ab-1763294605043.png",
    avatarAlt: "Professional headshot of middle-aged woman with short red hair wearing green cardigan with warm smile",
    isOnline: true,
    currentMood: "neutral",
    riskLevel: "low",
    progressScore: 72,
    totalSessions: 10,
    goalsCompleted: 5,
    totalGoals: 7,
    lastSession: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    recentNotes: "Steady progress with PTSD treatment. Patient responding well to EMDR therapy sessions."
  },
  {
    id: "PT-2024-006",
    name: "James Wilson",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1f23d9c3d-1763295425663.png",
    avatarAlt: "Professional headshot of African American man with short hair wearing black polo shirt with confident expression",
    isOnline: false,
    currentMood: "anxious",
    riskLevel: "medium",
    progressScore: 58,
    totalSessions: 9,
    goalsCompleted: 3,
    totalGoals: 6,
    lastSession: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    recentNotes: "Patient struggling with social anxiety. Recommended gradual exposure therapy and support group participation."
  }];


  const moodTrendData = [
  { date: "Nov 1", moodScore: 6.5, anxietyLevel: 5.2, stressLevel: 6.8 },
  { date: "Nov 5", moodScore: 7.2, anxietyLevel: 4.8, stressLevel: 5.5 },
  { date: "Nov 10", moodScore: 6.8, anxietyLevel: 5.5, stressLevel: 6.2 },
  { date: "Nov 15", moodScore: 7.5, anxietyLevel: 4.2, stressLevel: 4.8 },
  { date: "Nov 20", moodScore: 8.0, anxietyLevel: 3.8, stressLevel: 4.2 },
  { date: "Nov 25", moodScore: 7.8, anxietyLevel: 4.0, stressLevel: 4.5 },
  { date: "Nov 30", moodScore: 8.2, anxietyLevel: 3.5, stressLevel: 3.8 }];


  const upcomingAppointments = [
  {
    id: "APT-001",
    patientName: "Sarah Johnson",
    patientAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1985c262f-1763294244026.png",
    patientAvatarAlt: "Professional headshot of young woman with blonde hair wearing blue blazer smiling warmly",
    dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    duration: 60,
    sessionType: "video",
    notes: "Follow-up on anxiety management techniques and goal progress review"
  },
  {
    id: "APT-002",
    patientName: "Michael Chen",
    patientAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1bd15b436-1763300581767.png",
    patientAvatarAlt: "Professional headshot of Asian man with short black hair wearing gray suit and glasses",
    dateTime: new Date(Date.now() + 5 * 60 * 60 * 1000),
    duration: 45,
    sessionType: "audio",
    notes: "Stress management strategies and work-life balance discussion"
  },
  {
    id: "APT-003",
    patientName: "Emily Rodriguez",
    patientAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_107555573-1763296653935.png",
    patientAvatarAlt: "Professional headshot of Hispanic woman with long brown hair wearing white blouse smiling confidently",
    dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    duration: 60,
    sessionType: "video",
    notes: "Depression progress assessment and medication review"
  }];


  const riskPatients = [
  {
    id: "PT-2024-004",
    name: "David Thompson",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1219eacec-1763294869102.png",
    avatarAlt: "Professional headshot of young man with brown hair wearing navy blue shirt with friendly expression",
    riskLevel: "critical",
    riskFactors: [
    "Expressed suicidal ideation in last session",
    "Missed two consecutive appointments",
    "Declining mood scores over past 2 weeks",
    "Limited social support system"],

    lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    flaggedBy: "Dr. Martinez"
  },
  {
    id: "PT-2024-002",
    name: "Michael Chen",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1bd15b436-1763300581767.png",
    avatarAlt: "Professional headshot of Asian man with short black hair wearing gray suit and glasses",
    riskLevel: "high",
    riskFactors: [
    "Elevated stress levels affecting daily functioning",
    "Reports of sleep disturbances and appetite changes",
    "Work-related burnout symptoms"],

    lastContact: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    flaggedBy: "System Alert"
  },
  {
    id: "PT-2024-006",
    name: "James Wilson",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1f23d9c3d-1763295425663.png",
    avatarAlt: "Professional headshot of African American man with short hair wearing black polo shirt with confident expression",
    riskLevel: "medium",
    riskFactors: [
    "Increasing social isolation patterns",
    "Anxiety symptoms interfering with work performance",
    "Reluctance to engage in exposure therapy"],

    lastContact: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    flaggedBy: null
  }];


  const engagementData = [
  { name: "Mood Tracking", value: 245 },
  { name: "Journaling", value: 189 },
  { name: "Breathing Exercises", value: 156 },
  { name: "Goal Activities", value: 134 }];


  const complianceData = [
  { category: "Medication", rate: 85 },
  { category: "Therapy Sessions", rate: 92 },
  { category: "Homework", rate: 68 },
  { category: "Self-Care", rate: 75 }];


  const riskFilterOptions = [
  { value: 'all', label: 'All Patients' },
  { value: 'critical', label: 'Critical Risk' },
  { value: 'high', label: 'High Risk' },
  { value: 'medium', label: 'Medium Risk' },
  { value: 'low', label: 'Low Risk' }];


  const filteredPatients = patients?.filter((patient) => {
    const matchesRisk = filterRisk === 'all' || patient?.riskLevel === filterRisk;
    const matchesSearch = patient?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    patient?.id?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  const handleViewDetails = (patientId) => {
    const patient = patients?.find((p) => p?.id === patientId);
    setSelectedPatient(patient);
    console.log('Viewing details for patient:', patientId);
  };

  const handleStartChat = (patientId) => {
    console.log('Starting chat with patient:', patientId);
  };

  const handleJoinSession = (appointmentId) => {
    console.log('Joining session:', appointmentId);
  };

  const handleReschedule = (appointmentId) => {
    console.log('Rescheduling appointment:', appointmentId);
  };

  const handleViewPatient = (patientId) => {
    const patient = patients?.find((p) => p?.id === patientId);
    setSelectedPatient(patient);
    console.log('Viewing risk patient:', patientId);
  };

  const handleContactPatient = (patientId) => {
    console.log('Contacting patient:', patientId);
  };

  const handleQuickAction = (actionId) => {
    console.log('Quick action triggered:', actionId);
  };

  const handleEmergency = () => {
    console.log('Emergency SOS triggered');
  };

  useEffect(() => {
    document.title = 'Counsellor Dashboard - Mind Connect';
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <RoleBasedSidebar userRole="counsellor" />
        
        <main className="main-content">
          <BreadcrumbTrail />

          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="font-heading font-bold text-3xl lg:text-4xl text-foreground mb-2">
                  Counsellor Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Monitor patient progress and coordinate comprehensive care
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" iconName="Download">
                  Export Report
                </Button>
                <Button variant="default" iconName="UserPlus">
                  Add Patient
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
              <div className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Patients</p>
                    <p className="text-2xl font-bold text-foreground">{patients?.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon name="Users" size={24} className="text-primary" />
                  </div>
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">High Risk</p>
                    <p className="text-2xl font-bold text-error">
                      {patients?.filter((p) => p?.riskLevel === 'high' || p?.riskLevel === 'critical')?.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-error/10 flex items-center justify-center">
                    <Icon name="AlertTriangle" size={24} className="text-error" />
                  </div>
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Today's Sessions</p>
                    <p className="text-2xl font-bold text-foreground">
                      {upcomingAppointments?.filter((apt) => {
                        const aptDate = new Date(apt.dateTime);
                        const today = new Date();
                        return aptDate?.toDateString() === today?.toDateString();
                      })?.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Icon name="Calendar" size={24} className="text-secondary" />
                  </div>
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Avg Progress</p>
                    <p className="text-2xl font-bold text-foreground">
                      {Math.round(patients?.reduce((sum, p) => sum + p?.progressScore, 0) / patients?.length)}%
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                    <Icon name="TrendingUp" size={24} className="text-success" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  type="search"
                  placeholder="Search patients by name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)} />

              </div>
              <div className="lg:w-64">
                <Select
                  options={riskFilterOptions}
                  value={filterRisk}
                  onChange={setFilterRisk}
                  placeholder="Filter by risk level" />

              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  iconName="Grid3x3"
                  onClick={() => setViewMode('grid')} />

                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  iconName="List"
                  onClick={() => setViewMode('list')} />

              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="font-heading font-semibold text-xl text-foreground mb-4">
                  Patient Overview
                </h2>
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'} gap-4`}>
                  {filteredPatients?.map((patient) =>
                  <PatientOverviewCard
                    key={patient?.id}
                    patient={patient}
                    onViewDetails={handleViewDetails}
                    onStartChat={handleStartChat} />

                  )}
                </div>
              </div>

              {selectedPatient &&
              <div className="mb-6">
                  <MoodTrendChart
                  data={moodTrendData}
                  patientName={selectedPatient?.name}
                  chartType="line" />

                </div>
              }

              <PatientEngagementMetrics
                engagementData={engagementData}
                complianceData={complianceData} />

            </div>

            <div className="space-y-6">
              <RiskAssessmentPanel
                riskPatients={riskPatients}
                onViewPatient={handleViewPatient}
                onContactPatient={handleContactPatient} />


              <UpcomingAppointments
                appointments={upcomingAppointments}
                onJoinSession={handleJoinSession}
                onReschedule={handleReschedule} />


              <QuickActionsPanel onAction={handleQuickAction} />
            </div>
          </div>

          <div className="glass-card p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Info" size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                  Professional Guidelines
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  All patient data is protected under HIPAA regulations. Ensure proper documentation of all clinical interactions and maintain confidentiality standards. For crisis situations, follow the established emergency protocol and contact the crisis intervention team immediately.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" iconName="FileText">
                    View Guidelines
                  </Button>
                  <Button variant="outline" size="sm" iconName="Shield">
                    Privacy Policy
                  </Button>
                  <Button variant="outline" size="sm" iconName="Phone">
                    Crisis Hotline
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <SOSFloatingButton onEmergency={handleEmergency} />
      </div>
    </SidebarProvider>);

};

export default CounsellorDashboard;