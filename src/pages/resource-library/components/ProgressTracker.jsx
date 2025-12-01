import React from 'react';
import Icon from '../../../components/AppIcon';

const ProgressTracker = ({ completedCount, totalCount, certificates }) => {
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="glass-card p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-success/10">
            <Icon name="TrendingUp" size={20} className="text-success" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-lg text-foreground">Your Progress</h3>
            <p className="text-sm text-muted-foreground">Keep learning and growing</p>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Resources Completed</span>
            <span className="text-sm font-semibold text-primary">{completedCount} / {totalCount}</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {certificates && certificates?.length > 0 && (
          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="Award" size={16} className="text-warning" />
              <span className="text-sm font-medium text-foreground">Certificates Earned</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {certificates?.map((cert, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warning/10 border border-warning/20"
                >
                  <Icon name="Award" size={14} className="text-warning" />
                  <span className="text-xs font-medium text-foreground">{cert}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressTracker;