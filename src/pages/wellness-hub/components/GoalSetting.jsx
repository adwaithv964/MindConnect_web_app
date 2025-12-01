import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const GoalSetting = () => {
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: "Practice mindfulness meditation daily",
      description: "Complete 10 minutes of guided meditation each morning",
      category: "Mindfulness",
      targetDate: "2025-12-31",
      progress: 65,
      milestones: [
        { id: 1, title: "Complete 7 consecutive days", completed: true },
        { id: 2, title: "Reach 30-day streak", completed: false },
        { id: 3, title: "Try 3 different meditation styles", completed: true }
      ],
      streak: 12,
      isActive: true
    },
    {
      id: 2,
      title: "Improve sleep quality",
      description: "Maintain consistent sleep schedule and achieve 7-8 hours nightly",
      category: "Sleep",
      targetDate: "2025-12-15",
      progress: 45,
      milestones: [
        { id: 1, title: "Track sleep for 14 days", completed: true },
        { id: 2, title: "Establish bedtime routine", completed: false },
        { id: 3, title: "Reduce screen time before bed", completed: false }
      ],
      streak: 5,
      isActive: true
    },
    {
      id: 3,
      title: "Build social connections",
      description: "Reach out to friends or family at least twice per week",
      category: "Social",
      targetDate: "2026-01-31",
      progress: 30,
      milestones: [
        { id: 1, title: "Schedule weekly check-ins", completed: true },
        { id: 2, title: "Join a support group", completed: false },
        { id: 3, title: "Attend 3 social events", completed: false }
      ],
      streak: 3,
      isActive: true
    }
  ]);

  const [showNewGoalForm, setShowNewGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: '',
    targetDate: ''
  });
  const [selectedGoal, setSelectedGoal] = useState(null);

  const categoryOptions = [
    { value: 'Mindfulness', label: 'Mindfulness' },
    { value: 'Exercise', label: 'Exercise' },
    { value: 'Sleep', label: 'Sleep' },
    { value: 'Nutrition', label: 'Nutrition' },
    { value: 'Social', label: 'Social Connections' },
    { value: 'Therapy', label: 'Therapy & Treatment' },
    { value: 'Hobbies', label: 'Hobbies & Interests' }
  ];

  const handleCreateGoal = () => {
    if (!newGoal?.title || !newGoal?.category || !newGoal?.targetDate) {
      return;
    }

    const goal = {
      id: Date.now(),
      ...newGoal,
      progress: 0,
      milestones: [],
      streak: 0,
      isActive: true
    };

    setGoals([goal, ...goals]);
    setNewGoal({ title: '', description: '', category: '', targetDate: '' });
    setShowNewGoalForm(false);
  };

  const handleUpdateProgress = (goalId, increment) => {
    setGoals(goals?.map(goal => {
      if (goal?.id === goalId) {
        const newProgress = Math.max(0, Math.min(100, goal?.progress + increment));
        return { ...goal, progress: newProgress };
      }
      return goal;
    }));
  };

  const handleToggleMilestone = (goalId, milestoneId) => {
    setGoals(goals?.map(goal => {
      if (goal?.id === goalId) {
        return {
          ...goal,
          milestones: goal?.milestones?.map(milestone =>
            milestone?.id === milestoneId
              ? { ...milestone, completed: !milestone?.completed }
              : milestone
          )
        };
      }
      return goal;
    }));
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      'Mindfulness': 'Brain',
      'Exercise': 'Activity',
      'Sleep': 'Moon',
      'Nutrition': 'Apple',
      'Social': 'Users',
      'Therapy': 'Heart',
      'Hobbies': 'Palette'
    };
    return iconMap?.[category] || 'Target';
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      'Mindfulness': 'var(--color-primary)',
      'Exercise': 'var(--color-secondary)',
      'Sleep': 'var(--color-accent)',
      'Nutrition': '#68D391',
      'Social': '#F6AD55',
      'Therapy': '#FC8181',
      'Hobbies': '#9F7AEA'
    };
    return colorMap?.[category] || 'var(--color-primary)';
  };

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
          <Button
            variant="default"
            onClick={() => setShowNewGoalForm(!showNewGoalForm)}
            iconName={showNewGoalForm ? 'X' : 'Plus'}
            iconPosition="left"
          >
            {showNewGoalForm ? 'Cancel' : 'New Goal'}
          </Button>
        </div>

        <AnimatePresence>
          {showNewGoalForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-6 rounded-lg bg-muted/50 border border-border"
            >
              <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Create New Goal</h3>
              <div className="space-y-4">
                <Input
                  label="Goal Title"
                  type="text"
                  placeholder="What do you want to achieve?"
                  value={newGoal?.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e?.target?.value })}
                  required
                />
                <Input
                  label="Description"
                  type="text"
                  placeholder="Describe your goal in detail"
                  value={newGoal?.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e?.target?.value })}
                />
                <Select
                  label="Category"
                  placeholder="Select a category"
                  options={categoryOptions}
                  value={newGoal?.category}
                  onChange={(value) => setNewGoal({ ...newGoal, category: value })}
                  required
                />
                <Input
                  label="Target Date"
                  type="date"
                  value={newGoal?.targetDate}
                  onChange={(e) => setNewGoal({ ...newGoal, targetDate: e?.target?.value })}
                  required
                />
                <Button
                  variant="default"
                  onClick={handleCreateGoal}
                  disabled={!newGoal?.title || !newGoal?.category || !newGoal?.targetDate}
                  iconName="Check"
                  iconPosition="left"
                  fullWidth
                >
                  Create Goal
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {goals?.map((goal) => (
            <motion.div
              key={goal?.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-lg border border-border bg-card"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${getCategoryColor(goal?.category)}20` }}
                  >
                    <Icon name={getCategoryIcon(goal?.category)} size={24} color={getCategoryColor(goal?.category)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-heading font-semibold text-foreground mb-1">{goal?.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{goal?.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icon name="Calendar" size={14} />
                        Target: {new Date(goal.targetDate)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Flame" size={14} color="var(--color-accent)" />
                        {goal?.streak} day streak
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedGoal(selectedGoal === goal?.id ? null : goal?.id)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <Icon name={selectedGoal === goal?.id ? 'ChevronUp' : 'ChevronDown'} size={20} />
                </button>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Progress</span>
                  <span className="text-sm font-semibold text-primary">{goal?.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: getCategoryColor(goal?.category) }}
                    initial={{ width: 0 }}
                    animate={{ width: `${goal?.progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateProgress(goal?.id, -5)}
                  iconName="Minus"
                  disabled={goal?.progress === 0}
                >
                  -5%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateProgress(goal?.id, 5)}
                  iconName="Plus"
                  disabled={goal?.progress === 100}
                >
                  +5%
                </Button>
              </div>

              <AnimatePresence>
                {selectedGoal === goal?.id && goal?.milestones?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-border"
                  >
                    <h4 className="text-sm font-medium text-foreground mb-3">Milestones</h4>
                    <div className="space-y-2">
                      {goal?.milestones?.map((milestone) => (
                        <label
                          key={milestone?.id}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={milestone?.completed}
                            onChange={() => handleToggleMilestone(goal?.id, milestone?.id)}
                            className="w-5 h-5 rounded border-border text-primary focus:ring-primary/50"
                          />
                          <span className={`text-sm flex-1 ${milestone?.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                            {milestone?.title}
                          </span>
                          {milestone?.completed && (
                            <Icon name="CheckCircle" size={16} color="var(--color-success)" />
                          )}
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="glass-card p-6">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Achievement Badges</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: 'Award', label: 'First Goal', color: 'var(--color-primary)', earned: true },
            { icon: 'Flame', label: '7-Day Streak', color: 'var(--color-accent)', earned: true },
            { icon: 'Star', label: '50% Progress', color: 'var(--color-secondary)', earned: true },
            { icon: 'Trophy', label: 'Goal Master', color: '#9F7AEA', earned: false }
          ]?.map((badge, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border text-center ${
                badge?.earned
                  ? 'border-primary/20 bg-primary/5' :'border-border bg-muted/30 opacity-50'
              }`}
            >
              <div
                className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                style={{ backgroundColor: badge?.earned ? `${badge?.color}20` : 'var(--color-muted)' }}
              >
                <Icon name={badge?.icon} size={24} color={badge?.earned ? badge?.color : 'var(--color-muted-foreground)'} />
              </div>
              <p className="text-xs font-medium text-foreground">{badge?.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GoalSetting;