import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '../../components/ui/RoleBasedSidebar';
import RoleBasedSidebar from '../../components/ui/RoleBasedSidebar';
import SOSFloatingButton from '../../components/ui/SOSFloatingButton';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import MoodSelector from './components/MoodSelector';
import MoodEntryForm from './components/MoodEntryForm';
import MoodTrendChart from './components/MoodTrendChart';
import MoodHeatMap from './components/MoodHeatMap.jsx';
import MoodInsights from './components/MoodInsights';
import Icon from '../../components/AppIcon';
import Toast from '../../components/ui/Toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodIntensity, setMoodIntensity] = useState(50);
  const [moodHistory, setMoodHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [toast, setToast] = useState(null);

  const getUserId = () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      return storedUser?._id || storedUser?.id || null;
    } catch { return null; }
  };

  const fetchData = async () => {
    const userId = getUserId();
    if (!userId) { setLoading(false); return; }
    try {
      const [histRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/mood/${userId}`),
        fetch(`${API_BASE_URL}/api/mood/${userId}/stats`)
      ]);
      if (histRes.ok) setMoodHistory(await histRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
      console.error('Failed to fetch mood data', err);
      setToast({ message: 'Failed to load mood history.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleMoodSelect = (mood) => setSelectedMood(mood);
  const handleIntensityChange = (intensity) => setMoodIntensity(intensity);

  const handleMoodSubmit = async (entry) => {
    const userId = getUserId();
    if (!userId) {
      setToast({ message: 'You must be logged in to save mood entries.', type: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/mood`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...entry })
      });
      if (!res.ok) throw new Error('Save failed');

      setShowSuccessMessage(true);
      setSelectedMood(null);
      setMoodIntensity(50);
      // Refresh data
      await fetchData();
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (err) {
      setToast({ message: 'Failed to save mood entry. Please try again.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEntry = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/mood/${id}`, { method: 'DELETE' });
      setMoodHistory(prev => prev.filter(e => e._id !== id));
      setToast({ message: 'Entry deleted.', type: 'success' });
      await fetchData();
    } catch {
      setToast({ message: 'Failed to delete entry.', type: 'error' });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <RoleBasedSidebar userRole="patient" />

        <main className="main-content">
          <BreadcrumbTrail />
          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
                Mood Tracker
              </h1>
              <p className="text-muted-foreground">
                Track your emotional wellness journey and discover patterns that matter
              </p>
            </div>

            {showSuccessMessage && (
              <div className="mb-6 p-4 rounded-lg bg-success/10 border border-success/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                  <Icon name="CheckCircle2" size={20} className="text-success" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-success">Mood Entry Saved Successfully!</p>
                  <p className="text-xs text-success/80 mt-0.5">Your mood has been logged and added to your wellness journey</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <MoodSelector
                  selectedMood={selectedMood}
                  onMoodSelect={handleMoodSelect}
                  moodIntensity={moodIntensity}
                  onIntensityChange={handleIntensityChange}
                />

                <MoodEntryForm
                  selectedMood={selectedMood}
                  moodIntensity={moodIntensity}
                  onSubmit={handleMoodSubmit}
                  submitting={submitting}
                />

                <MoodTrendChart moodHistory={moodHistory} stats={stats} loading={loading} />

                <MoodHeatMap moodHistory={moodHistory} />
              </div>

              <div className="lg:col-span-1">
                <MoodInsights moodHistory={moodHistory} stats={stats} loading={loading} onDelete={handleDeleteEntry} />
              </div>
            </div>

            <div className="mt-8 glass-card p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="Lightbulb" size={24} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-foreground mb-2">Pro Tip: Consistency is Key</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Tracking your mood daily helps identify patterns and triggers. Try to log your mood at the same time each day for the most accurate insights.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <SOSFloatingButton onEmergency={() => { }} />
      </div>
    </SidebarProvider>
  );
};

export default MoodTracker;