import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Image from '../../../components/AppImage';

const BookingModal = ({
  isOpen,
  onClose,
  counsellor,
  selectedDate,
  selectedSlot,
  onConfirmBooking,
  isSubmitting
}) => {
  const [formData, setFormData] = useState({
    sessionType: 'video',
    age: '',
    phone: '',
    reasonForVisit: '',
    notes: '',
    isFirstSession: false,
    agreeToTerms: false
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const sessionTypeOptions = [
    { value: 'video', label: '🎥 Video Call' },
    { value: 'phone', label: '📞 Phone Call' },
    { value: 'inperson', label: '🏥 In-Person' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData?.reasonForVisit?.trim()) {
      newErrors.reasonForVisit = 'Please provide a reason for your visit';
    }
    if (!formData?.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    if (!selectedDate) {
      newErrors.date = 'Please select a date from the calendar';
    }
    if (!selectedSlot) {
      newErrors.slot = 'Please select a time slot from the calendar';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onConfirmBooking({ ...formData, counsellor, date: selectedDate, slot: selectedSlot });
    }
  };

  const formatDate = date =>
    date?.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-6 flex items-center justify-between">
          <h2 className="font-heading font-semibold text-2xl text-foreground">Confirm Appointment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors duration-150"
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Counsellor Summary */}
          <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <Image
              src={counsellor?.image}
              alt={counsellor?.imageAlt}
              className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-foreground">{counsellor?.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{counsellor?.credentials}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {selectedDate ? (
                  <div className="flex items-center gap-1 text-foreground/80">
                    <Icon name="Calendar" size={14} />
                    <span>{formatDate(selectedDate)}</span>
                  </div>
                ) : (
                  <span className="text-error text-xs flex items-center gap-1">
                    <Icon name="AlertCircle" size={14} /> No date selected
                  </span>
                )}
                {selectedSlot ? (
                  <div className="flex items-center gap-1 text-foreground/80">
                    <Icon name="Clock" size={14} />
                    <span>{selectedSlot.time}</span>
                  </div>
                ) : (
                  <span className="text-error text-xs flex items-center gap-1">
                    <Icon name="AlertCircle" size={14} /> No time selected
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Date/Slot validation errors */}
          {(errors.date || errors.slot) && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-sm text-error">
              {errors.date && <p>⚠ {errors.date}</p>}
              {errors.slot && <p>⚠ {errors.slot}</p>}
              <p className="mt-1 text-xs text-foreground/60">Close this modal and select from the calendar on the right.</p>
            </div>
          )}

          {/* Session Type */}
          <Select
            label="Session Type"
            description="Choose how you'd like to attend this session"
            options={sessionTypeOptions}
            value={formData.sessionType}
            onChange={value => handleInputChange('sessionType', value)}
            required
          />

          {/* Age & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Age"
              type="number"
              placeholder="e.g., 25"
              value={formData.age}
              onChange={e => handleInputChange('age', e.target.value)}
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="e.g., +91 98765 43210"
              value={formData.phone}
              onChange={e => handleInputChange('phone', e.target.value)}
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Reason for Visit <span className="text-error">*</span>
            </label>
            <textarea
              value={formData.reasonForVisit}
              onChange={e => handleInputChange('reasonForVisit', e.target.value)}
              placeholder="Please briefly describe what you'd like to discuss in this session..."
              rows={3}
              className={`
                w-full px-4 py-3 rounded-lg border bg-background text-foreground
                placeholder:text-muted-foreground resize-none
                focus:outline-none focus:ring-2 focus:ring-ring
                ${errors.reasonForVisit ? 'border-error' : 'border-input'}
              `}
            />
            {errors.reasonForVisit && (
              <p className="mt-1 text-sm text-error">{errors.reasonForVisit}</p>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Additional Notes <span className="text-muted-foreground text-xs">(optional)</span>
            </label>
            <textarea
              value={formData.notes}
              onChange={e => handleInputChange('notes', e.target.value)}
              placeholder="Any additional information you'd like to share with the counsellor..."
              rows={2}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <Checkbox
              label="This is my first session with this counsellor"
              checked={formData.isFirstSession}
              onChange={e => handleInputChange('isFirstSession', e.target.checked)}
            />
            <Checkbox
              label="I agree to the terms and conditions, privacy policy, and cancellation policy"
              description="You can cancel or reschedule up to 24 hours before your appointment"
              error={errors.agreeToTerms}
              checked={formData.agreeToTerms}
              onChange={e => handleInputChange('agreeToTerms', e.target.checked)}
              required
            />
          </div>

          {/* Info */}
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={18} color="var(--color-accent)" className="flex-shrink-0 mt-0.5" />
              <div className="text-sm text-foreground/80">
                <p className="font-medium mb-1">Before Your Session:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>You'll receive a confirmation once the counsellor approves</li>
                  <li>Join link will be available 15 minutes before start time</li>
                  <li>Cancel for free up to 24 hours before your session</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card/95 backdrop-blur-sm border-t border-border p-6 flex gap-3">
          <Button variant="outline" fullWidth onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="default"
            fullWidth
            iconName={isSubmitting ? 'Loader' : 'Check'}
            iconPosition="left"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;