import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const getUserId = () => {
  try {
    const u = JSON.parse(localStorage.getItem('user'));
    return u?._id || u?.id || null;
  } catch { return null; }
};

const categoryOptions = [
  { value: 'Mindfulness', label: 'Mindfulness' },
  { value: 'Exercise', label: 'Exercise' },
  { value: 'Sleep', label: 'Sleep' },
  { value: 'Nutrition', label: 'Nutrition' },
  { value: 'Social', label: 'Social Connections' },
  { value: 'Therapy', label: 'Therapy & Treatment' },
  { value: 'Hobbies', label: 'Hobbies & Interests' }
];

const getCategoryIcon = c => ({ Mindfulness: 'Brain', Exercise: 'Activity', Sleep: 'Moon', Nutrition: 'Apple', Social: 'Users', Therapy: 'Heart', Hobbies: 'Palette' })[c] || 'Target';
const getCategoryColor = c => ({ Mindfulness: 'var(--color-primary)', Exercise: 'var(--color-secondary)', Sleep: 'var(--color-accent)', Nutrition: '#68D391', Social: '#F6AD55', Therapy: '#FC8181', Hobbies: '#9F7AEA' })[c] || 'var(--color-primary)';

const GoalSetting = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewGoalForm, setShowNewGoalForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [newMilestoneText, setNewMilestoneText] = useState('');
  const [adding, setAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', category: '', targetDate: '' });

  const fetchGoals = useCallback(async () => {
    const userId = getUserId();
    if (!userId) { setLoading(false); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/api/wellness/goals/${userId}`);
      if (res.ok) setGoals(await res.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  /* ---- Create ---- */
  const handleCreateGoal = async () => {
    if (!newGoal.title || !newGoal.category || !newGoal.targetDate || adding) return;
    const userId = getUserId();
    setAdding(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/wellness/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...newGoal })
      });
      if (res.ok) {
        const goal = await res.json();
        setGoals(prev => [goal, ...prev]);
        setNewGoal({ title: '', description: '', category: '', targetDate: '' });
        setShowNewGoalForm(false);
      }
    } catch { /* silent */ }
    finally { setAdding(false); }
  };

  /* ---- Update progress ---- */
  const handleUpdateProgress = async (goalId, increment) => {
    const goal = goals.find(g => g._id === goalId);
    if (!goal) return;
    const newProgress = Math.max(0, Math.min(100, goal.progress + increment));
    setGoals(prev => prev.map(g => g._id === goalId ? { ...g, progress: newProgress } : g));
    try {
      await fetch(`${API_BASE_URL}/api/wellness/goals/${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: newProgress })
      });
    } catch { /* silent */ }
  };

  /* ---- Toggle milestone ---- */
  const handleToggleMilestone = async (goalId, milestoneIndex) => {
    const goal = goals.find(g => g._id === goalId);
    if (!goal) return;
    const updatedMilestones = goal.milestones.map((m, i) =>
      i === milestoneIndex ? { ...m, completed: !m.completed, completedAt: !m.completed ? new Date() : null } : m
    );
    // Auto-calculate progress from milestones
    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const newProgress = updatedMilestones.length > 0
      ? Math.round((completedCount / updatedMilestones.length) * 100)
      : goal.progress;

    setGoals(prev => prev.map(g => g._id === goalId ? { ...g, milestones: updatedMilestones, progress: newProgress } : g));
    try {
      await fetch(`${API_BASE_URL}/api/wellness/goals/${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestones: updatedMilestones, progress: newProgress })
      });
    } catch { /* silent */ }
  };

  /* ---- Add milestone ---- */
  const handleAddMilestone = async (goalId) => {
    if (!newMilestoneText.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/wellness/goals/${goalId}/milestone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newMilestoneText.trim() })
      });
      if (res.ok) {
        const updatedGoal = await res.json();
        setGoals(prev => prev.map(g => g._id === goalId ? updatedGoal : g));
        setNewMilestoneText('');
      }
    } catch { /* silent */ }
  };

  /* ---- Delete goal ---- */
  const handleDeleteGoal = async (goalId) => {
    setGoals(prev => prev.filter(g => g._id !== goalId));
    try {
      await fetch(`${API_BASE_URL}/api/wellness/goals/${goalId}`, { method: 'DELETE' });
    } catch { /* silent */ }
  };

  /* ---- Badges from real data ---- */
  const badges = [
    { icon: 'Award', label: 'First Goal', color: 'var(--color-primary)', earned: goals.length >= 1 },
    { icon: 'Flame', label: '7-Day Streak', color: 'var(--color-accent)', earned: goals.some(g => g.streak >= 7) },
    { icon: 'Star', label: '50% Progress', color: 'var(--color-secondary)', earned: goals.some(g => g.progress >= 50) },
    { icon: 'Trophy', label: 'Goal Master', color: '#9F7AEA', earned: goals.some(g => g.progress === 100) }
  ];

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Icon name="Target" size={24} color="var(--color-accent)" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-semibold text-foreground">Goal Setting</h2>
              <p className="text-sm text-muted-foreground">Track your wellness objectives</p>
            </div>
          </div>
          <Button variant="default" onClick={() => setShowNewGoalForm(!showNewGoalForm)} iconName={showNewGoalForm ? 'X' : 'Plus'} iconPosition="left">
            {showNewGoalForm ? 'Cancel' : 'New Goal'}
          </Button>
        </div>

        {/* New goal form */}
        <AnimatePresence>
          {showNewGoalForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 p-6 rounded-lg bg-muted/50 border border-border overflow-hidden">
              <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Create New Goal</h3>
              <div className="space-y-4">
                <Input label="Goal Title" type="text" placeholder="What do you want to achieve?" value={newGoal.title} onChange={e => setNewGoal({ ...newGoal, title: e.target.value })} required />
                <Input label="Description" type="text" placeholder="Describe your goal in detail" value={newGoal.description} onChange={e => setNewGoal({ ...newGoal, description: e.target.value })} />
                <Select label="Category" placeholder="Select a category" options={categoryOptions} value={newGoal.category} onChange={value => setNewGoal({ ...newGoal, category: value })} required />
                <Input label="Target Date" type="date" value={newGoal.targetDate} onChange={e => setNewGoal({ ...newGoal, targetDate: e.target.value })} required />
                <Button variant="default" onClick={handleCreateGoal} disabled={!newGoal.title || !newGoal.category || !newGoal.targetDate || adding} iconName={adding ? 'Loader2' : 'Check'} iconPosition="left" fullWidth>
                  {adding ? 'Creating...' : 'Create Goal'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goals list */}
        {loading ? (
          <div className="flex justify-center py-10"><Icon name="Loader2" size={28} className="animate-spin text-muted-foreground" /></div>
        ) : goals.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Icon name="Target" size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No goals yet. Create your first wellness goal!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map(goal => (
              <motion.div key={goal._id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-lg border border-border bg-card group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${getCategoryColor(goal.category)}20` }}>
                      <Icon name={getCategoryIcon(goal.category)} size={24} color={getCategoryColor(goal.category)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-heading font-semibold text-foreground mb-1">{goal.title}</h3>
                      {goal.description && <p className="text-sm text-muted-foreground mb-2">{goal.description}</p>}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {goal.targetDate && (
                          <span className="flex items-center gap-1"><Icon name="Calendar" size={14} />
                            {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                        {goal.streak > 0 && (
                          <span className="flex items-center gap-1"><Icon name="Flame" size={14} color="var(--color-accent)" />{goal.streak} day streak</span>
                        )}
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{goal.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setSelectedGoal(selectedGoal === goal._id ? null : goal._id)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <Icon name={selectedGoal === goal._id ? 'ChevronUp' : 'ChevronDown'} size={20} />
                    </button>
                    <button onClick={() => handleDeleteGoal(goal._id)} className="p-2 rounded-lg hover:bg-error/10 text-muted-foreground hover:text-error transition-colors opacity-0 group-hover:opacity-100">
                      <Icon name="Trash2" size={16} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Progress</span>
                    <span className="text-sm font-semibold" style={{ color: getCategoryColor(goal.category) }}>{goal.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ backgroundColor: getCategoryColor(goal.category) }} initial={{ width: 0 }} animate={{ width: `${goal.progress}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} />
                  </div>
                </div>

                {/* Progress controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  {goal.milestones?.length > 0 ? (
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Icon name="Info" size={13} />
                      Auto-tracked from milestones ({goal.milestones.filter(m => m.completed).length}/{goal.milestones.length} done)
                    </span>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleUpdateProgress(goal._id, -5)} iconName="Minus" disabled={goal.progress === 0}>-5%</Button>
                      <Button variant="outline" size="sm" onClick={() => handleUpdateProgress(goal._id, 5)} iconName="Plus" disabled={goal.progress === 100}>+5%</Button>
                    </>
                  )}
                  {goal.progress === 100 && (
                    <span className="text-xs text-success flex items-center gap-1 ml-2"><Icon name="CheckCircle" size={14} />Goal Completed! 🎉</span>
                  )}
                </div>

                {/* Expanded: milestones + add milestone */}
                <AnimatePresence>
                  {selectedGoal === goal._id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-border overflow-hidden">
                      <h4 className="text-sm font-medium text-foreground mb-3">Milestones ({goal.milestones?.filter(m => m.completed).length}/{goal.milestones?.length})</h4>

                      <div className="space-y-2 mb-4">
                        {goal.milestones?.length === 0 && (
                          <p className="text-xs text-muted-foreground py-2">No milestones yet. Add one below.</p>
                        )}
                        {goal.milestones?.map((milestone, index) => (
                          <label key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                            <input type="checkbox" checked={milestone.completed} onChange={() => handleToggleMilestone(goal._id, index)} className="w-5 h-5 rounded border-border text-primary focus:ring-primary/50" />
                            <span className={`text-sm flex-1 ${milestone.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{milestone.title}</span>
                            {milestone.completed && <Icon name="CheckCircle" size={16} color="var(--color-success)" />}
                          </label>
                        ))}
                      </div>

                      {/* Add milestone form */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newMilestoneText}
                          onChange={e => setNewMilestoneText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAddMilestone(goal._id)}
                          placeholder="Add a milestone…"
                          className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <Button variant="outline" size="sm" onClick={() => handleAddMilestone(goal._id)} iconName="Plus" disabled={!newMilestoneText.trim()}>Add</Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Achievement Badges */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Achievement Badges</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {badges.map((badge, i) => (
            <motion.div key={i} whileHover={badge.earned ? { scale: 1.05 } : {}} className={`p-4 rounded-lg border text-center transition-all ${badge.earned ? 'border-primary/20 bg-primary/5 shadow-sm' : 'border-border bg-muted/30 opacity-40'}`}>
              <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: badge.earned ? `${badge.color}20` : 'var(--color-muted)' }}>
                <Icon name={badge.icon} size={24} color={badge.earned ? badge.color : 'var(--color-muted-foreground)'} />
              </div>
              <p className="text-xs font-medium text-foreground">{badge.label}</p>
              {badge.earned && <p className="text-xs text-success mt-1">Earned ✓</p>}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GoalSetting;