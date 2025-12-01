import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ForumActivityCard = ({ activities, onViewForums }) => {
  const getActivityIcon = (type) => {
    const icons = {
      new_post: 'MessageSquare',
      reply: 'MessageCircle',
      like: 'Heart',
      trending: 'TrendingUp'
    };
    return icons?.[type] || 'MessageSquare';
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-heading font-semibold text-foreground">Forum Activity</h2>
        <Icon name="MessageSquare" size={20} className="text-primary" />
      </div>
      <div className="space-y-3 mb-4">
        {activities?.map((activity) => (
          <div 
            key={activity?.id} 
            className="p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon name={getActivityIcon(activity?.type)} size={16} className="text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-foreground mb-1">{activity?.title}</h3>
                <p className="text-xs text-muted-foreground mb-2">{activity?.preview}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Icon name="MessageCircle" size={12} />
                    {activity?.replies}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="Heart" size={12} />
                    {activity?.likes}
                  </span>
                  <span>{activity?.time}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Button variant="default" fullWidth iconName="MessageSquare" onClick={onViewForums}>
        View All Forums
      </Button>
    </div>
  );
};

export default ForumActivityCard;