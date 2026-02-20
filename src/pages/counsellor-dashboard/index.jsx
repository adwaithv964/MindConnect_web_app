import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import PatientOverviewCard from './components/PatientOverviewCard';
import MoodTrendChart from './components/MoodTrendChart';
import UpcomingAppointments from './components/UpcomingAppointments';
import RiskAssessmentPanel from './components/RiskAssessmentPanel';
import PatientEngagementMetrics from './components/PatientEngagementMetrics';
import QuickActionsPanel from './components/QuickActionsPanel';
import PatientDetailModal from './components/PatientDetailModal';
import AddPatientModal from './components/AddPatientModal';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const CounsellorDashboard = () => {
  const navigate = useNavigate();
  const [counsellorId, setCounsellorId] = useState(null);

  // Data states
  const [patients, setPatients] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [riskPatients, setRiskPatients] = useState([]);
  const [stats, setStats] = useState({ totalPatients: 0, highRisk: 0, todaysSessions: 0, avgProgress: 0 });
  const [moodTrendData, setMoodTrendData] = useState([]);
  const [recentActions, setRecentActions] = useState([]);
  const [engagementData] = useState([
    { name: 'Mood Tracking', value: 245 },
    { name: 'Journaling', value: 189 },
    { name: 'Breathing Exercises', value: 156 },
    { name: 'Goal Activities', value: 134 }
  ]);
  const [complianceData] = useState([
    { category: 'Medication', rate: 85 },
    { category: 'Therapy Sessions', rate: 92 },
    { category: 'Homework', rate: 68 },
    { category: 'Self-Care', rate: 75 }
  ]);

  // UI states
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [detailPatient, setDetailPatient] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterRisk, setFilterRisk] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [loadingMood, setLoadingMood] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load all dashboard data
  const fetchDashboardData = useCallback(async (id) => {
    if (!id) return;
    try {
      const [patientsRes, upcomingRes, riskRes, statsRes] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/api/counsellor/${id}/patients`),
        axios.get(`${API_BASE_URL}/api/counsellor/${id}/upcoming`),
        axios.get(`${API_BASE_URL}/api/counsellor/${id}/risk-patients`),
        axios.get(`${API_BASE_URL}/api/counsellor/${id}/dashboard-stats`)
      ]);

      if (patientsRes.status === 'fulfilled') {
        const pts = patientsRes.value.data || [];
        setPatients(pts);
        // Derive recent actions from recently confirmed/added patients
        const actions = pts
          .slice()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(p => ({ label: `Patient card created for ${p.name}`, createdAt: p.createdAt }));
        setRecentActions(actions);
      }
      if (upcomingRes.status === 'fulfilled') setUpcomingAppointments(upcomingRes.value.data || []);
      if (riskRes.status === 'fulfilled') setRiskPatients(riskRes.value.data || []);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data || {});
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Counsellor Dashboard - Mind Connect';
    const stored = JSON.parse(localStorage.getItem('user') || '{}');
    const uid = stored?._id || stored?.id;
    setCounsellorId(uid);
    if (uid) fetchDashboardData(uid);
    else setLoading(false);
  }, [fetchDashboardData]);

  // Fetch mood trends when a patient is selected
  useEffect(() => {
    if (!selectedPatient?.patientId || !counsellorId) {
      setMoodTrendData([]);
      return;
    }
    const fetchMoodTrends = async () => {
      setLoadingMood(true);
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/counsellor/${counsellorId}/mood-trends/${selectedPatient.patientId}`
        );
        setMoodTrendData(res.data || []);
      } catch (err) {
        console.error('Mood trend fetch error:', err);
        setMoodTrendData([]);
      } finally {
        setLoadingMood(false);
      }
    };
    fetchMoodTrends();
  }, [selectedPatient?.patientId, counsellorId]);

  const riskFilterOptions = [
    { value: 'all', label: 'All Patients' },
    { value: 'critical', label: 'Critical Risk' },
    { value: 'high', label: 'High Risk' },
    { value: 'medium', label: 'Medium Risk' },
    { value: 'low', label: 'Low Risk' }
  ];

  const filteredPatients = patients.filter((patient) => {
    const matchesRisk = filterRisk === 'all' || patient?.riskLevel === filterRisk;
    const matchesSearch = patient?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      patient?.id?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      patient?.email?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  // --- Action Handlers ---
  const handleViewDetails = (patientId) => {
    const patient = patients.find((p) => p?.id === patientId || p?.patientId?.toString() === patientId);
    if (patient) {
      setDetailPatient(patient);
      setSelectedPatient(patient);
    }
  };

  const handleStartChat = (patientId) => {
    navigate('/counsellor/consultation', { state: { patientId } });
  };

  const handleJoinSession = (appointmentId) => {
    navigate('/counsellor/consultation', { state: { appointmentId } });
  };

  const handleReschedule = async (appointmentId) => {
    const newDate = window.prompt('Enter new date (YYYY-MM-DD):');
    const newTime = window.prompt('Enter new time slot (e.g. 10:00 AM):');
    if (!newDate || !newTime) return;
    try {
      await axios.put(`${API_BASE_URL}/api/appointments/${appointmentId}`, {
        date: newDate, timeSlot: newTime
      });
      showToast('Appointment rescheduled!');
      fetchDashboardData(counsellorId);
    } catch (err) {
      showToast('Failed to reschedule.', 'error');
    }
  };

  const handleViewPatient = (patientId) => {
    const patient = patients.find((p) => p?.id === patientId || p?.patientId?.toString() === patientId);
    if (patient) setDetailPatient(patient);
  };

  const handleContactPatient = (patientId) => {
    navigate('/counsellor/consultation', { state: { patientId } });
  };

  const handleQuickAction = (actionId) => {
    const routes = {
      'new-session': '/counsellor/requests',
      'patient-notes': null,
      'treatment-plan': '/counsellor/patients',
      'prescriptions': '/counsellor/patients',
      'reports': null,
      'referrals': '/counsellor/patients'
    };
    if (actionId === 'reports') {
      handleExportReport();
      return;
    }
    if (actionId === 'patient-notes' && detailPatient) {
      // Already handled via detail modal
      return;
    }
    const route = routes[actionId];
    if (route) navigate(route);
  };

  const handleExportReport = () => {
    if (patients.length === 0) {
      showToast('No patients to export.', 'error');
      return;
    }
    const headers = ['Name', 'Email', 'ID', 'Risk Level', 'Progress (%)', 'Sessions', 'Goals Completed', 'Total Goals', 'Current Mood', 'Recent Notes'];
    const rows = patients.map(p => [
      p.name, p.email, p.id, p.riskLevel, p.progressScore,
      p.totalSessions, p.goalsCompleted, p.totalGoals, p.currentMood,
      `"${(p.recentNotes || '').replace(/"/g, "'")}"` // Escape quotes
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Report exported successfully!');
  };

  const handlePatientAdded = (newPatient) => {
    setPatients(prev => [newPatient, ...prev]);
    setStats(prev => ({ ...prev, totalPatients: prev.totalPatients + 1 }));
    showToast(`${newPatient.name} added to your patient list!`);
  };

  const handlePatientUpdated = (updatedPatient) => {
    setPatients(prev => prev.map(p =>
      p._id === updatedPatient._id ? { ...p, ...updatedPatient } : p
    ));
    // Refresh risk patients
    if (counsellorId) {
      axios.get(`${API_BASE_URL}/api/counsellor/${counsellorId}/risk-patients`)
        .then(res => setRiskPatients(res.data || []))
        .catch(() => { });
    }
    showToast('Patient record updated!');
  };

  const handleRemovePatient = (recordId) => {
    setPatients(prev => prev.filter(p => p._id !== recordId));
    setStats(prev => ({
      ...prev,
      totalPatients: Math.max(0, prev.totalPatients - 1)
    }));
    showToast('Patient removed from your list.');
  };

  const displayStats = {
    totalPatients: stats.totalPatients ?? patients.length,
    highRisk: stats.highRisk ?? patients.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical').length,
    todaysSessions: stats.todaysSessions ?? 0,
    avgProgress: stats.avgProgress ?? (patients.length > 0
      ? Math.round(patients.reduce((sum, p) => sum + (p.progressScore || 0), 0) / patients.length) : 0)
  };

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all
          ${toast.type === 'error' ? 'bg-error text-white' : 'bg-success text-white'}`}>
          {toast.message}
        </div>
      )}

      {/* Modals */}
      {showAddModal && counsellorId && (
        <AddPatientModal
          counsellorId={counsellorId}
          onClose={() => setShowAddModal(false)}
          onPatientAdded={handlePatientAdded}
        />
      )}
      {detailPatient && counsellorId && (
        <PatientDetailModal
          patient={detailPatient}
          counsellorId={counsellorId}
          onClose={() => setDetailPatient(null)}
          onPatientUpdated={handlePatientUpdated}
          onRemovePatient={handleRemovePatient}
        />
      )}

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
            <Button variant="outline" iconName="Download" onClick={handleExportReport}>
              Export Report
            </Button>
            <Button variant="default" iconName="UserPlus" onClick={() => setShowAddModal(true)}>
              Add Patient
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Patients</p>
                <p className="text-2xl font-bold text-foreground">
                  {loading ? <span className="animate-pulse">—</span> : displayStats.totalPatients}
                </p>
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
                  {loading ? <span className="animate-pulse">—</span> : displayStats.highRisk}
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
                  {loading ? <span className="animate-pulse">—</span> : displayStats.todaysSessions}
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
                  {loading ? <span className="animate-pulse">—</span> : `${displayStats.avgProgress}%`}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <Icon name="TrendingUp" size={24} className="text-success" />
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search patients by name, ID, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
            />
          </div>
          <div className="lg:w-64">
            <Select
              options={riskFilterOptions}
              value={filterRisk}
              onChange={setFilterRisk}
              placeholder="Filter by risk level"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              iconName="Grid3x3"
              onClick={() => setViewMode('grid')}
            />
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              iconName="List"
              onClick={() => setViewMode('list')}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h2 className="font-heading font-semibold text-xl text-foreground mb-4">
              Patient Overview
            </h2>

            {loading ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="glass-card p-6 animate-pulse">
                    <div className="flex gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-2/3" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded" />
                      <div className="h-3 bg-muted rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="glass-card p-16 text-center">
                <Icon name="Users" size={48} className="mx-auto mb-4 text-muted-foreground opacity-40" />
                <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                  {patients.length === 0 ? 'No Patients Yet' : 'No Patients Found'}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {patients.length === 0
                    ? 'Patients appear automatically when you confirm their appointment requests, or add them manually below.'
                    : 'Try adjusting your search or filter criteria.'}
                </p>
                {patients.length === 0 && (
                  <div className="flex items-center gap-3 justify-center">
                    <Button variant="outline" iconName="Calendar" onClick={() => navigate('/counsellor/requests')}>
                      View Appointment Requests
                    </Button>
                    <Button variant="default" iconName="UserPlus" onClick={() => setShowAddModal(true)}>
                      Add Patient Manually
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'} gap-4`}>
                {filteredPatients.map((patient) => (
                  <PatientOverviewCard
                    key={patient?._id || patient?.id}
                    patient={patient}
                    onViewDetails={handleViewDetails}
                    onStartChat={handleStartChat}
                  />
                ))}
              </div>
            )}
          </div>

          {selectedPatient && (
            <div className="mb-6">
              {loadingMood ? (
                <div className="glass-card p-6 animate-pulse">
                  <div className="h-48 bg-muted rounded" />
                </div>
              ) : moodTrendData.length > 0 ? (
                <MoodTrendChart
                  data={moodTrendData}
                  patientName={selectedPatient?.name}
                  chartType="line"
                />
              ) : (
                <div className="glass-card p-6 text-center text-muted-foreground">
                  <Icon name="LineChart" size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No mood data available for {selectedPatient?.name} yet.</p>
                </div>
              )}
            </div>
          )}

          <PatientEngagementMetrics
            engagementData={engagementData}
            complianceData={complianceData}
          />
        </div>

        <div className="space-y-6">
          <RiskAssessmentPanel
            riskPatients={riskPatients}
            onViewPatient={handleViewPatient}
            onContactPatient={handleContactPatient}
          />

          <UpcomingAppointments
            appointments={upcomingAppointments}
            onJoinSession={handleJoinSession}
            onReschedule={handleReschedule}
          />

          <QuickActionsPanel onAction={handleQuickAction} recentActions={recentActions} />
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
    </>
  );
};

export default CounsellorDashboard;