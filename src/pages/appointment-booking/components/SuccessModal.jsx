import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SuccessModal = ({ isOpen, onClose, bookingDetails }) => {
  if (!isOpen) return null;

  const formatDate = date => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const sessionTypeLabel = {
    video: '🎥 Video Call',
    phone: '📞 Phone Call',
    inperson: '🏥 In-Person'
  };

  const handleAddToCalendar = () => {
    if (!bookingDetails?.date || !bookingDetails?.slot) {
      alert('Calendar integration not available for this booking.');
      return;
    }

    const dateObj = new Date(bookingDetails.date);
    const [timePart, period] = (bookingDetails.slot?.time || '9:00 AM').split(' ');
    const [hours, minutes] = timePart.split(':').map(Number);
    let h = period === 'PM' && hours !== 12 ? hours + 12 : period === 'AM' && hours === 12 ? 0 : hours;

    const start = new Date(dateObj);
    start.setHours(h, minutes || 0, 0, 0);
    const end = new Date(start);
    end.setHours(end.getHours() + 1);

    const fmt = d =>
      d.toISOString().replace(/[-:]/g, '').replace('.000Z', 'Z');

    const title = encodeURIComponent(
      `Appointment with ${bookingDetails?.counsellor?.name || bookingDetails?.doctor || 'Counsellor'} - MindConnect`
    );
    const details = encodeURIComponent(
      `Session Type: ${sessionTypeLabel[bookingDetails?.sessionType] || bookingDetails?.sessionType}\nReason: ${bookingDetails?.reasonForVisit || ''}`
    );

    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${fmt(start)}/${fmt(end)}&details=${details}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md">
        <div className="p-8 text-center">
          {/* Success Animation */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center animate-[pulse_2s_ease-in-out_1]">
            <Icon name="CheckCircle2" size={48} color="var(--color-success)" />
          </div>

          <h2 className="font-heading font-semibold text-2xl text-foreground mb-2">
            Appointment Requested!
          </h2>
          <p className="text-muted-foreground mb-6">
            Your session request has been submitted. The counsellor will confirm shortly.
          </p>

          {/* Booking Details */}
          <div className="bg-muted/50 rounded-xl p-4 mb-6 text-left space-y-3">
            <div className="flex items-start gap-3">
              <Icon name="User" size={18} color="var(--color-primary)" className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Counsellor</p>
                <p className="font-medium text-foreground text-sm">
                  {bookingDetails?.counsellor?.name || bookingDetails?.doctor || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Icon name="Calendar" size={18} color="var(--color-primary)" className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Date & Time</p>
                <p className="font-medium text-foreground text-sm">
                  {formatDate(bookingDetails?.date)}
                  {bookingDetails?.slot?.time ? ` at ${bookingDetails.slot.time}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Icon name="Video" size={18} color="var(--color-primary)" className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Session Type</p>
                <p className="font-medium text-foreground text-sm">
                  {sessionTypeLabel[bookingDetails?.sessionType] || bookingDetails?.sessionType || 'Video Call'}
                </p>
              </div>
            </div>

            {bookingDetails?.reasonForVisit && (
              <div className="flex items-start gap-3">
                <Icon name="MessageSquare" size={18} color="var(--color-primary)" className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Reason</p>
                  <p className="font-medium text-foreground text-sm line-clamp-2">{bookingDetails.reasonForVisit}</p>
                </div>
              </div>
            )}
          </div>

          {/* Status Indicator */}
          <div className="flex items-center justify-center gap-2 mb-6 p-2 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
            <span className="text-xs text-warning font-medium">Status: Pending Confirmation</span>
          </div>

          <div className="space-y-3">
            <Button
              variant="default"
              fullWidth
              iconName="Calendar"
              iconPosition="left"
              onClick={handleAddToCalendar}
            >
              Add to Google Calendar
            </Button>
            <Button variant="outline" fullWidth onClick={onClose}>
              View My Bookings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;