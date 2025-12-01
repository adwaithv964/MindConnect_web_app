import React, { useState } from 'react';
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

const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodIntensity, setMoodIntensity] = useState(50);
  const [moodHistory, setMoodHistory] = useState([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
  };

  const handleIntensityChange = (intensity) => {
    setMoodIntensity(intensity);
  };

  const handleMoodSubmit = (entry) => {
    setMoodHistory([entry, ...moodHistory]);
    setShowSuccessMessage(true);

    setTimeout(() => {
      setShowSuccessMessage(false);
      setSelectedMood(null);
      setMoodIntensity(50);
    }, 3000);
  };

  const handleEmergency = () => {
    console.log('Emergency SOS activated');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <RoleBasedSidebar userRole="patient" />

        <main className="main-content">
          <BreadcrumbTrail />

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
                  <p className="text-sm font-semibold text-success">
                    Mood Entry Saved Successfully!
                  </p>
                  <p className="text-xs text-success/80 mt-0.5">
                    Your mood has been logged and added to your wellness journey
                  </p>
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
                />

                <MoodTrendChart moodHistory={moodHistory} />

                <MoodHeatMap />
              </div>

              <div className="lg:col-span-1">
                <MoodInsights />
              </div>
            </div>

            <div className="mt-8 glass-card p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="Lightbulb" size={24} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    Pro Tip: Consistency is Key
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Tracking your mood daily helps identify patterns and triggers. Try to log your mood at the same time each day for the most accurate insights. Remember, there are no right or wrong moods – this is about understanding yourself better.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <SOSFloatingButton onEmergency={handleEmergency} />
      </div>
    </SidebarProvider>
  );
};

export default MoodTracker;