import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const UpcomingAppointmentCard = ({ appointment, onViewDetails }) => {
  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'text-success bg-success/10',
      pending: 'text-warning bg-warning/10',
      cancelled: 'text-error bg-error/10'
    };
    return colors?.[status] || colors?.pending;
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-heading font-semibold text-foreground">Upcoming Session</h2>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment?.status)}`}>
          {appointment?.status}
        </span>
      </div>
      <div className="flex items-start gap-4 mb-6">
        <Image 
          src={appointment?.counsellorImage} 
          alt={appointment?.counsellorImageAlt}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">{appointment?.counsellorName}</h3>
          <p className="text-sm text-muted-foreground mb-2">{appointment?.specialization}</p>
          <div className="flex items-center gap-4 text-sm text-foreground">
            <div className="flex items-center gap-1">
              <Icon name="Calendar" size={16} className="text-primary" />
              <span>{appointment?.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="Clock" size={16} className="text-primary" />
              <span>{appointment?.time}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 mb-4 p-3 bg-primary/5 rounded-lg">
        <Icon name="Video" size={20} className="text-primary" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Video Consultation</p>
          <p className="text-xs text-muted-foreground">Join link will be available 10 mins before</p>
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" fullWidth iconName="Calendar">
          Reschedule
        </Button>
        <Button variant="default" fullWidth iconName="Video" onClick={onViewDetails}>
          View Details
        </Button>
      </div>
    </div>
  );
};

export default UpcomingAppointmentCard;