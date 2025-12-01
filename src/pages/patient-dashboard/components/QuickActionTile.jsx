import React from 'react';
import Icon from '../../../components/AppIcon';

const QuickActionTile = ({ title, description, iconName, color, onClick, badge }) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success'
  };

  return (
    <div 
      onClick={onClick}
      className="glass-card p-6 cursor-pointer transition-all duration-150 hover:scale-105 hover:shadow-lg relative"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e?.key === 'Enter' || e?.key === ' ') {
          onClick();
        }
      }}
    >
      {badge && (
        <span className="absolute top-3 right-3 px-2 py-1 bg-error text-error-foreground text-xs font-medium rounded-full">
          {badge}
        </span>
      )}
      <div className={`w-12 h-12 rounded-lg ${colorClasses?.[color]} flex items-center justify-center mb-4`}>
        <Icon name={iconName} size={24} />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default QuickActionTile;