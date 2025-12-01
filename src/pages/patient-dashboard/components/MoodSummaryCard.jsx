import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MoodSummaryCard = ({ todayMood, onQuickEntry }) => {
  const moodEmojis = {
    excellent: { emoji: '😊', color: 'text-success', bg: 'bg-success/10' },
    good: { emoji: '🙂', color: 'text-primary', bg: 'bg-primary/10' },
    okay: { emoji: '😐', color: 'text-warning', bg: 'bg-warning/10' },
    low: { emoji: '😔', color: 'text-accent', bg: 'bg-accent/10' },
    poor: { emoji: '😢', color: 'text-error', bg: 'bg-error/10' }
  };

  const currentMood = moodEmojis?.[todayMood?.mood] || moodEmojis?.okay;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-heading font-semibold text-foreground">Today's Mood</h2>
        <Icon name="TrendingUp" size={20} className="text-primary" />
      </div>
      <div className="flex items-center gap-6 mb-6">
        <div className={`flex items-center justify-center w-20 h-20 rounded-full ${currentMood?.bg}`}>
          <span className="text-4xl">{currentMood?.emoji}</span>
        </div>
        <div className="flex-1">
          <p className={`text-2xl font-semibold ${currentMood?.color} capitalize mb-1`}>
            {todayMood?.mood || 'Not tracked yet'}
          </p>
          <p className="text-sm text-muted-foreground">
            {todayMood?.timestamp || 'Track your mood to see insights'}
          </p>
        </div>
      </div>
      {todayMood?.note && (
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <p className="text-sm text-foreground italic">"{todayMood?.note}"</p>
        </div>
      )}
      <Button 
        variant="default" 
        fullWidth 
        iconName="Plus" 
        iconPosition="left"
        onClick={onQuickEntry}
      >
        Quick Mood Entry
      </Button>
    </div>
  );
};

export default MoodSummaryCard;