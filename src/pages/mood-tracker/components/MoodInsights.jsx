import React from 'react';
import Icon from '../../../components/AppIcon';

const MoodInsights = () => {
  const insights = [
    {
      id: 1,
      type: 'pattern',
      icon: 'TrendingUp',
      iconColor: 'text-success',
      bgColor: 'bg-success/10',
      title: 'Positive Trend Detected',
      description: 'Your mood has improved by 23% over the past two weeks. Keep up the great work with your wellness activities!',
      timestamp: '2 days ago'
    },
    {
      id: 2,
      type: 'trigger',
      icon: 'AlertCircle',
      iconColor: 'text-warning',
      bgColor: 'bg-warning/10',
      title: 'Potential Trigger Identified',
      description: 'Your mood tends to dip on Mondays. Consider scheduling relaxing activities or reaching out to your support network.',
      timestamp: '5 days ago'
    },
    {
      id: 3,
      type: 'achievement',
      icon: 'Award',
      iconColor: 'text-accent',
      bgColor: 'bg-accent/10',
      title: 'Consistency Milestone',
      description: 'You\'ve logged your mood for 30 consecutive days! This consistency helps identify patterns and track progress.',
      timestamp: '1 week ago'
    },
    {
      id: 4,
      type: 'correlation',
      icon: 'Activity',
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
      title: 'Exercise Impact',
      description: 'Days with exercise show 35% higher mood ratings. Your physical activity is positively affecting your mental wellness.',
      timestamp: '1 week ago'
    }
  ];

  const topFactors = [
    { factor: 'Exercise', impact: 85, trend: 'up' },
    { factor: 'Sleep Quality', impact: 78, trend: 'up' },
    { factor: 'Social Life', impact: 72, trend: 'stable' },
    { factor: 'Work/Study', impact: 45, trend: 'down' }
  ];

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-heading font-semibold text-foreground">
            Mood Insights
          </h3>
          <button 
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            aria-label="View all insights"
          >
            View All
          </button>
        </div>

        <div className="space-y-4">
          {insights?.map((insight) => (
            <div
              key={insight?.id}
              className="flex gap-4 p-4 rounded-lg bg-card hover:bg-muted transition-colors duration-200 cursor-pointer"
            >
              <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${insight?.bgColor} flex items-center justify-center`}>
                <Icon name={insight?.icon} size={24} className={insight?.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground mb-1">
                  {insight?.title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {insight?.description}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {insight?.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="glass-card p-6">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-6">
          Top Contributing Factors
        </h3>

        <div className="space-y-4">
          {topFactors?.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {item?.factor}
                  </span>
                  <Icon 
                    name={item?.trend === 'up' ? 'TrendingUp' : item?.trend === 'down' ? 'TrendingDown' : 'Minus'} 
                    size={16} 
                    className={
                      item?.trend === 'up' ? 'text-success' : 
                      item?.trend === 'down'? 'text-error' : 'text-muted-foreground'
                    }
                  />
                </div>
                <span className="text-sm font-semibold text-primary">
                  {item?.impact}%
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                  style={{ width: `${item?.impact}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoodInsights;