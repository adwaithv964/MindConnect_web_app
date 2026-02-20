import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BreathingExerciseCard = ({ onStartExercise, breathingStats }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handlePreview = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 4000);
  };

  const totalSessions = breathingStats?.totalSessions ?? 0;
  const streak = breathingStats?.streak ?? 0;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-heading font-semibold text-foreground">Breathing Exercise</h2>
        <Icon name="Wind" size={20} className="text-primary" />
      </div>

      <div className="flex items-center justify-center mb-6 h-40">
        <div className="relative w-32 h-32">
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-br from-primary to-secondary opacity-20 ${isAnimating ? 'breathing-animation' : ''
              }`}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon name="Wind" size={48} className="text-primary" />
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <Icon name="Timer" size={20} className="text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">4-7-8 Technique</p>
            <p className="text-xs text-muted-foreground">Inhale 4s, Hold 7s, Exhale 8s</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <Icon name="Heart" size={20} className="text-success" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Your Progress</p>
            <p className="text-xs text-muted-foreground">
              {totalSessions} session{totalSessions !== 1 ? 's' : ''} completed
              {streak > 0 ? ` · ${streak}-day streak 🔥` : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" fullWidth onClick={handlePreview}>
          Preview
        </Button>
        <Button variant="default" fullWidth iconName="Play" onClick={onStartExercise}>
          Start Session
        </Button>
      </div>
    </div>
  );
};

export default BreathingExerciseCard;
