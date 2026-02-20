import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const GoalProgressCard = ({ goals, onManageGoals, breathingStreak = 0 }) => {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-heading font-semibold text-foreground">Active Goals</h2>
        <Icon name="Target" size={20} className="text-primary" />
      </div>

      {goals?.length > 0 ? (
        <div className="space-y-4 mb-4">
          {goals.map((goal) => (
            <div key={goal?.id || goal?._id} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">{goal?.title}</h3>
                <span className="text-sm font-semibold text-primary">{goal?.progress}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                  style={{ width: `${goal?.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{goal?.completed} of {goal?.total} milestones completed</span>
                {goal?.daysLeft !== null && goal?.daysLeft !== undefined && (
                  <span>{goal?.daysLeft} days left</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center text-muted-foreground mb-4">
          <Icon name="Target" size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No active goals yet. Create your first goal!</p>
        </div>
      )}

      {breathingStreak > 0 && (
        <div className="p-3 bg-success/10 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <Icon name="Trophy" size={20} className="text-success" />
            <div>
              <p className="text-sm font-medium text-success">{breathingStreak}-Day Breathing Streak! 🔥</p>
              <p className="text-xs text-muted-foreground">Keep up the great work</p>
            </div>
          </div>
        </div>
      )}

      <Button variant="default" fullWidth iconName="Plus" onClick={onManageGoals}>
        Manage Goals
      </Button>
    </div>
  );
};

export default GoalProgressCard;
