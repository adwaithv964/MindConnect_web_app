import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const getUserId = () => {
  try {
    const u = JSON.parse(localStorage.getItem('user'));
    return u?._id || u?.id || null;
  } catch { return null; }
};

const breathingTechniques = [
  {
    id: 1, name: '4-7-8 Technique', description: 'Inhale 4s · Hold 7s · Exhale 8s',
    icon: 'Wind', benefits: 'Reduces anxiety and promotes sleep', color: 'var(--color-primary)',
    phases: [
      { name: 'Inhale', duration: 4, instruction: 'Breathe in slowly through your nose' },
      { name: 'Hold', duration: 7, instruction: 'Hold your breath gently' },
      { name: 'Exhale', duration: 8, instruction: 'Breathe out slowly through your mouth' }
    ]
  },
  {
    id: 2, name: 'Box Breathing', description: 'Inhale · Hold · Exhale · Hold — 4s each',
    icon: 'Square', benefits: 'Improves focus and reduces stress', color: 'var(--color-secondary)',
    phases: [
      { name: 'Inhale', duration: 4, instruction: 'Breathe in through your nose' },
      { name: 'Hold', duration: 4, instruction: 'Hold your breath' },
      { name: 'Exhale', duration: 4, instruction: 'Breathe out through your mouth' },
      { name: 'Hold', duration: 4, instruction: 'Hold your breath' }
    ]
  },
  {
    id: 3, name: 'Calm Breathing', description: 'Simple 5-5 breathing pattern',
    icon: 'Heart', benefits: 'Quick relaxation and stress relief', color: 'var(--color-accent)',
    phases: [
      { name: 'Inhale', duration: 5, instruction: 'Breathe in deeply and slowly' },
      { name: 'Exhale', duration: 5, instruction: 'Breathe out completely and slowly' }
    ]
  }
];

const BreathingExercises = () => {
  const [selectedTechnique, setSelectedTechnique] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(5);
  const [totalBreaths, setTotalBreaths] = useState(0);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const intervalRef = useRef(null);
  const sessionRef = useRef(null);
  const breathRef = useRef(0);
  const activeRef = useRef(false);

  const fetchStats = async () => {
    const userId = getUserId();
    if (!userId) { setStatsLoading(false); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/api/wellness/breathing/${userId}/stats`);
      if (res.ok) setStats(await res.json());
    } catch { /* silent */ }
    finally { setStatsLoading(false); }
  };

  useEffect(() => {
    fetchStats();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (sessionRef.current) clearTimeout(sessionRef.current);
    };
  }, []);

  const logSession = async (breaths) => {
    const userId = getUserId();
    if (!userId || !selectedTechnique) return;
    try {
      await fetch(`${API_BASE_URL}/api/wellness/breathing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, technique: selectedTechnique.name, durationMinutes: sessionDuration, totalBreaths: breaths })
      });
      await fetchStats();
    } catch { /* silent */ }
  };

  const startExercise = () => {
    if (!selectedTechnique) return;
    setIsActive(true);
    activeRef.current = true;
    breathRef.current = 0;
    setTotalBreaths(0);

    let phaseIndex = 0;
    const runPhase = () => {
      if (!activeRef.current) return;
      const phase = selectedTechnique.phases[phaseIndex];
      setCurrentPhase(phase.name);
      setCountdown(phase.duration);
      let timeLeft = phase.duration;

      intervalRef.current = setInterval(() => {
        timeLeft--;
        setCountdown(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(intervalRef.current);
          phaseIndex = (phaseIndex + 1) % selectedTechnique.phases.length;
          if (phaseIndex === 0) {
            breathRef.current++;
            setTotalBreaths(breathRef.current);
          }
          if (activeRef.current) runPhase();
        }
      }, 1000);
    };

    runPhase();

    sessionRef.current = setTimeout(async () => {
      stopExercise(true);
    }, sessionDuration * 60 * 1000);
  };

  const stopExercise = async (completed = false) => {
    activeRef.current = false;
    setIsActive(false);
    setCurrentPhase('');
    setCountdown(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (sessionRef.current) clearTimeout(sessionRef.current);
    if (completed || breathRef.current > 0) {
      await logSession(breathRef.current);
    }
  };

  const getCircleScale = () => {
    if (!isActive) return 1;
    if (currentPhase === 'Inhale') return 1.5;
    if (currentPhase === 'Exhale') return 0.8;
    return 1.2;
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
            <Icon name="Wind" size={24} color="var(--color-secondary)" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-semibold text-foreground">Breathing Exercises</h2>
            <p className="text-sm text-muted-foreground">Guided techniques for relaxation</p>
          </div>
        </div>

        {/* Technique selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {breathingTechniques.map(technique => (
            <motion.button
              key={technique.id}
              onClick={() => { if (!isActive) setSelectedTechnique(technique); }}
              disabled={isActive}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${selectedTechnique?.id === technique.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 bg-card'} ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
              whileHover={!isActive ? { scale: 1.02 } : {}}
              whileTap={!isActive ? { scale: 0.98 } : {}}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedTechnique?.id === technique.id ? 'bg-primary/20' : 'bg-muted'}`}>
                  <Icon name={technique.icon} size={20} color={selectedTechnique?.id === technique.id ? 'var(--color-primary)' : 'currentColor'} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-foreground mb-1">{technique.name}</h3>
                  <p className="text-xs text-muted-foreground">{technique.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon name="Info" size={14} />
                <span>{technique.benefits}</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Session duration slider */}
        {selectedTechnique && !isActive && (
          <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border">
            <label className="block text-sm font-medium text-foreground mb-2">Session Duration</label>
            <div className="flex items-center gap-4">
              <input
                type="range" min="1" max="15" value={sessionDuration}
                onChange={e => setSessionDuration(Number(e.target.value))}
                className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${(sessionDuration / 15) * 100}%, var(--color-muted) ${(sessionDuration / 15) * 100}%, var(--color-muted) 100%)` }}
              />
              <span className="text-sm font-medium text-foreground min-w-[60px]">{sessionDuration} min</span>
            </div>
          </div>
        )}

        {/* Animated circle */}
        {selectedTechnique && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative w-64 h-64 flex items-center justify-center mb-8">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: `radial-gradient(circle, ${selectedTechnique.color}20 0%, transparent 70%)`, border: `2px solid ${selectedTechnique.color}40` }}
                animate={{ scale: getCircleScale(), opacity: isActive ? [0.3, 0.6, 0.3] : 0.3 }}
                transition={{ duration: isActive ? (selectedTechnique.phases.find(p => p.name === currentPhase)?.duration || 4) : 0.5, ease: 'easeInOut' }}
              />
              <div className="relative z-10 text-center">
                {isActive ? (
                  <>
                    <motion.div key={currentPhase} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
                      <p className="text-2xl font-heading font-semibold text-foreground mb-2">{currentPhase}</p>
                      <p className="text-sm text-muted-foreground">{selectedTechnique.phases.find(p => p.name === currentPhase)?.instruction}</p>
                    </motion.div>
                    <div className="text-5xl font-heading font-bold text-primary">{countdown}</div>
                  </>
                ) : (
                  <div className="text-center">
                    <Icon name={selectedTechnique.icon} size={48} color={selectedTechnique.color} />
                    <p className="text-lg font-medium text-foreground mt-4">Ready to begin</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!isActive ? (
                <Button variant="default" onClick={startExercise} iconName="Play" iconPosition="left" size="lg">Start Exercise</Button>
              ) : (
                <Button variant="destructive" onClick={() => stopExercise(false)} iconName="Square" iconPosition="left" size="lg">Stop Exercise</Button>
              )}
            </div>

            {isActive && (
              <div className="mt-6 flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Icon name="Activity" size={16} /><span>{totalBreaths} breaths</span></div>
                <div className="flex items-center gap-2"><Icon name="Clock" size={16} /><span>{sessionDuration} min session</span></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats panel */}
      {!statsLoading && stats && (stats.totalSessions > 0 || stats.todaySessions > 0) && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Your Progress</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
              <p className="text-2xl font-bold text-primary">{stats.todaySessions}</p>
              <p className="text-xs text-muted-foreground mt-1">Today's Sessions</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20 text-center">
              <p className="text-2xl font-bold text-secondary">{stats.streak}</p>
              <p className="text-xs text-muted-foreground mt-1">Day Streak 🔥</p>
            </div>
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 text-center">
              <p className="text-2xl font-bold text-accent">{stats.totalSessions}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Sessions</p>
            </div>
            <div className="p-4 rounded-lg bg-muted text-center">
              <p className="text-2xl font-bold text-foreground">{stats.totalBreaths}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Breaths</p>
            </div>
          </div>
          {stats.recentSessions?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-foreground mb-3">Recent Sessions</h4>
              <div className="space-y-2">
                {stats.recentSessions.map(s => (
                  <div key={s.id} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-center gap-2">
                      <Icon name="Wind" size={14} className="text-muted-foreground" />
                      <span className="text-foreground">{s.technique}</span>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground text-xs">
                      <span>{s.durationMinutes} min</span>
                      <span>{s.totalBreaths} breaths</span>
                      <span>{new Date(s.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BreathingExercises;