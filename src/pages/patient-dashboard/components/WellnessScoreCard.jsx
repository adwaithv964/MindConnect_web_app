import React from 'react';
import Icon from '../../../components/AppIcon';

const WellnessScoreCard = ({ score, trend, factors }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-primary';
    if (score >= 40) return 'text-warning';
    return 'text-error';
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return 'TrendingUp';
    if (trend < 0) return 'TrendingDown';
    return 'Minus';
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-heading font-semibold text-foreground">Wellness Score</h2>
        <Icon name="Activity" size={20} className="text-primary" />
      </div>
      <div className="text-center mb-6">
        <div className={`text-6xl font-bold ${getScoreColor(score)} mb-2`}>
          {score}
        </div>
        <div className="flex items-center justify-center gap-2">
          <Icon 
            name={getTrendIcon(trend)} 
            size={16} 
            className={trend > 0 ? 'text-success' : trend < 0 ? 'text-error' : 'text-muted-foreground'}
          />
          <span className={`text-sm font-medium ${
            trend > 0 ? 'text-success' : trend < 0 ? 'text-error' : 'text-muted-foreground'
          }`}>
            {Math.abs(trend)}% from last week
          </span>
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground mb-2">Contributing Factors:</p>
        {factors?.map((factor, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Icon name={factor?.icon} size={16} className="text-primary" />
              <span className="text-sm text-foreground">{factor?.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-background rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    factor?.value >= 80 ? 'bg-success' :
                    factor?.value >= 60 ? 'bg-primary' :
                    factor?.value >= 40 ? 'bg-warning' : 'bg-error'
                  }`}
                  style={{ width: `${factor?.value}%` }}
                />
              </div>
              <span className="text-sm font-medium text-foreground w-8 text-right">
                {factor?.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WellnessScoreCard;