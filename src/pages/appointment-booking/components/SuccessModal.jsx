import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SuccessModal = ({ isOpen, onClose, bookingDetails }) => {
  if (!isOpen) return null;

  const formatDate = (date) => {
    return date?.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleAddToCalendar = () => {
    alert('Calendar integration would be implemented here');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md">
        <div className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
            <Icon name="CheckCircle2" size={48} color="var(--color-success)" />
          </div>

          <h2 className="font-heading font-semibold text-2xl text-foreground mb-2">
            Appointment Confirmed!
          </h2>
          <p className="text-muted-foreground mb-6">
            Your session has been successfully scheduled
          </p>

          <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left space-y-3">
            <div className="flex items-start gap-3">
              <Icon name="User" size={20} color="var(--color-primary)" className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Counsellor</p>
                <p className="font-medium text-foreground">{bookingDetails?.counsellor?.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Icon name="Calendar" size={20} color="var(--color-primary)" className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-medium text-foreground">
                  {formatDate(bookingDetails?.date)} at {bookingDetails?.slot?.time}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Icon name="Video" size={20} color="var(--color-primary)" className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Session Type</p>
                <p className="font-medium text-foreground capitalize">{bookingDetails?.sessionType}</p>
              </div>
            </div>
          </div>

          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3 text-left">
              <Icon name="Mail" size={20} color="var(--color-accent)" className="flex-shrink-0 mt-0.5" />
              <div className="text-sm text-foreground/80">
                <p className="font-medium mb-1">What's Next?</p>
                <p>A confirmation email has been sent with your appointment details and a pre-session questionnaire.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              variant="default"
              fullWidth
              iconName="Calendar"
              iconPosition="left"
              onClick={handleAddToCalendar}
            >
              Add to Calendar
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={onClose}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;