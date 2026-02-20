import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const UpcomingAppointmentCard = ({ appointment, onViewDetails, onReschedule }) => {
  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'text-success bg-success/10',
      pending: 'text-warning bg-warning/10',
      cancelled: 'text-error bg-error/10'
    };
    return colors?.[status] || colors?.pending;
  };

  // No upcoming appointment
  if (!appointment) {
    return (
      <div className="glass-card p-6 flex flex-col items-center justify-center min-h-[220px]">
        <Icon name="CalendarX" size={40} className="text-muted-foreground mb-3 opacity-50" />
        <h2 className="text-xl font-heading font-semibold text-foreground mb-1">No Upcoming Session</h2>
        <p className="text-sm text-muted-foreground mb-4 text-center">
          You don't have any confirmed or pending appointments.
        </p>
        <Button variant="default" fullWidth iconName="Calendar" onClick={onViewDetails}>
          Book a Session
        </Button>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-heading font-semibold text-foreground">Upcoming Session</h2>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment?.status)}`}>
          {appointment?.status}
        </span>
      </div>
      <div className="flex items-start gap-4 mb-6">
        {appointment?.counsellorImage ? (
          <Image
            src={appointment.counsellorImage}
            alt={appointment.counsellorName}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon name="User" size={28} className="text-primary" />
          </div>
        )}
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
        <Icon name={appointment?.sessionType === 'inperson' ? 'MapPin' : 'Video'} size={20} className="text-primary" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground capitalize">
            {appointment?.sessionType === 'inperson' ? 'In-Person Session' :
              appointment?.sessionType === 'phone' ? 'Phone Consultation' : 'Video Consultation'}
          </p>
          <p className="text-xs text-muted-foreground">Join link will be available 10 mins before</p>
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" fullWidth iconName="Calendar" onClick={onReschedule}>
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
