import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SidebarProvider } from '../../components/ui/RoleBasedSidebar';
import RoleBasedSidebar from '../../components/ui/RoleBasedSidebar';
import SOSFloatingButton from '../../components/ui/SOSFloatingButton';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import JournalingSection from './components/JournalingSection.jsx';
import BreathingExercises from './components/BreathingExercises';
import GoalSetting from './components/GoalSetting';

const WellnessHub = () => {
  const [activeTab, setActiveTab] = useState('journaling');

  const tabs = [
    {
      id: 'journaling',
      label: 'Guided Journaling',
      icon: 'BookOpen',
      description: 'Express your thoughts and feelings'
    },
    {
      id: 'breathing',
      label: 'Breathing Exercises',
      icon: 'Wind',
      description: 'Guided relaxation techniques'
    },
    {
      id: 'goals',
      label: 'Goal Setting',
      icon: 'Target',
      description: 'Track your wellness objectives'
    }
  ];

  const handleEmergency = () => {
    console.log('Emergency SOS activated - Redirecting to crisis helpline');
  };

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'journaling':
        return <JournalingSection />;
      case 'breathing':
        return <BreathingExercises />;
      case 'goals':
        return <GoalSetting />;
      default:
        return <JournalingSection />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <RoleBasedSidebar userRole="patient" />
        
        <main className="main-content">
          <BreadcrumbTrail />

          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Icon name="Sparkles" size={28} color="#FFFFFF" />
                </div>
                <div>
                  <h1 className="text-3xl font-heading font-bold text-foreground">Wellness Hub</h1>
                  <p className="text-muted-foreground">Your personal space for self-care and growth</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-2 mb-6">
              <div className="flex flex-col sm:flex-row gap-2">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex-1 p-4 rounded-lg transition-all duration-200 text-left ${
                      activeTab === tab?.id
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'bg-transparent hover:bg-muted text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activeTab === tab?.id ? 'bg-white/20' : 'bg-muted'
                      }`}>
                        <Icon
                          name={tab?.icon}
                          size={20}
                          color={activeTab === tab?.id ? '#FFFFFF' : 'currentColor'}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium mb-0.5">{tab?.label}</h3>
                        <p className={`text-xs ${
                          activeTab === tab?.id ? 'text-primary-foreground/80' : 'text-muted-foreground'
                        }`}>
                          {tab?.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderActiveContent()}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 glass-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Icon name="Lightbulb" size={24} color="var(--color-accent)" />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-semibold text-foreground mb-2">Wellness Tips</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={16} color="var(--color-success)" className="mt-0.5 flex-shrink-0" />
                      <span>Practice self-care activities daily, even if just for 5-10 minutes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={16} color="var(--color-success)" className="mt-0.5 flex-shrink-0" />
                      <span>Consistency is more important than perfection - small steps lead to big changes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={16} color="var(--color-success)" className="mt-0.5 flex-shrink-0" />
                      <span>Share your progress with your counsellor to receive personalized guidance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={16} color="var(--color-success)" className="mt-0.5 flex-shrink-0" />
                      <span>Celebrate your achievements, no matter how small they may seem</span>
                    </li>
                  </ul>
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

export default WellnessHub;