import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const UpcomingAppointments = ({ appointments, onJoinSession, onReschedule }) => {
  const getSessionTypeIcon = (type) => {
    const icons = {
      video: 'Video',
      audio: 'Phone',
      chat: 'MessageCircle',
      inPerson: 'Users'
    };
    return icons?.[type] || 'Calendar';
  };

  const getSessionTypeColor = (type) => {
    const colors = {
      video: 'text-primary',
      audio: 'text-secondary',
      chat: 'text-accent',
      inPerson: 'text-foreground'
    };
    return colors?.[type] || 'text-muted-foreground';
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow?.setDate(tomorrow?.getDate() + 1);

    if (date?.toDateString() === today?.toDateString()) return 'Today';
    if (date?.toDateString() === tomorrow?.toDateString()) return 'Tomorrow';
    return date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTimeUntilSession = (dateString) => {
    const sessionTime = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((sessionTime - now) / (1000 * 60));
    
    if (diffMinutes < 0) return 'In progress';
    if (diffMinutes < 60) return `In ${diffMinutes} min`;
    const hours = Math.floor(diffMinutes / 60);
    return `In ${hours}h ${diffMinutes % 60}m`;
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name="Calendar" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-lg text-foreground">Upcoming Sessions</h3>
            <p className="text-sm text-muted-foreground">{appointments?.length} scheduled</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" iconName="Plus">
          Add Session
        </Button>
      </div>
      <div className="space-y-4">
        {appointments?.map((appointment) => (
          <div 
            key={appointment?.id}
            className="p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/50 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <Image
                  src={appointment?.patientAvatar}
                  alt={appointment?.patientAvatarAlt}
                  className="w-12 h-12 rounded-full object-cover border-2 border-border"
                />
                <div>
                  <h4 className="font-medium text-foreground">{appointment?.patientName}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Icon 
                      name={getSessionTypeIcon(appointment?.sessionType)} 
                      size={14} 
                      className={getSessionTypeColor(appointment?.sessionType)}
                    />
                    <span className="text-xs text-muted-foreground capitalize">
                      {appointment?.sessionType?.replace(/([A-Z])/g, ' $1')?.trim()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{formatDate(appointment?.dateTime)}</p>
                <p className="text-xs text-muted-foreground">{formatTime(appointment?.dateTime)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Icon name="Clock" size={14} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{appointment?.duration} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="AlertCircle" size={14} className="text-warning" />
                  <span className="text-xs text-warning font-medium">{getTimeUntilSession(appointment?.dateTime)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Calendar"
                  onClick={() => onReschedule(appointment?.id)}
                >
                  Reschedule
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  iconName={getSessionTypeIcon(appointment?.sessionType)}
                  onClick={() => onJoinSession(appointment?.id)}
                >
                  Join
                </Button>
              </div>
            </div>

            {appointment?.notes && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Session Focus:</span> {appointment?.notes}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingAppointments;