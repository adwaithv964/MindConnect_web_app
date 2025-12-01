import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const TrustedCircleCard = ({ members, onMessage, onManageCircle }) => {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-heading font-semibold text-foreground">Trusted Circle</h2>
        <Icon name="Users" size={20} className="text-primary" />
      </div>
      <div className="space-y-3 mb-4">
        {members?.map((member) => (
          <div 
            key={member?.id} 
            className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
          >
            <div className="relative">
              <Image 
                src={member?.avatar} 
                alt={member?.avatarAlt}
                className="w-12 h-12 rounded-full object-cover"
              />
              {member?.isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-card rounded-full" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-foreground">{member?.name}</h3>
              <p className="text-xs text-muted-foreground">{member?.relationship}</p>
            </div>
            <button
              onClick={() => onMessage(member?.id)}
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
              aria-label={`Message ${member?.name}`}
            >
              <Icon name="MessageCircle" size={20} className="text-primary" />
            </button>
          </div>
        ))}
      </div>
      <Button variant="outline" fullWidth iconName="UserPlus" onClick={onManageCircle}>
        Manage Circle
      </Button>
    </div>
  );
};

export default TrustedCircleCard;