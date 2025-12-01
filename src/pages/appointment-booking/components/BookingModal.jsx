import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Image from '../../../components/AppImage';

const BookingModal = ({ isOpen, onClose, counsellor, selectedDate, selectedSlot, onConfirmBooking }) => {
  const [formData, setFormData] = useState({
    sessionType: 'video',
    insuranceProvider: '',
    policyNumber: '',
    reasonForVisit: '',
    isFirstSession: false,
    agreeToTerms: false
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const sessionTypeOptions = [
    { value: 'video', label: 'Video Call' },
    { value: 'phone', label: 'Phone Call' },
    { value: 'inperson', label: 'In-Person' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.reasonForVisit?.trim()) {
      newErrors.reasonForVisit = 'Please provide a reason for your visit';
    }

    if (!formData?.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onConfirmBooking({
        ...formData,
        counsellor,
        date: selectedDate,
        slot: selectedSlot
      });
    }
  };

  const formatDate = (date) => {
    return date?.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-6 flex items-center justify-between">
          <h2 className="font-heading font-semibold text-2xl text-foreground">
            Confirm Appointment
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors duration-150"
            aria-label="Close modal"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <Image
              src={counsellor?.image}
              alt={counsellor?.imageAlt}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-foreground">{counsellor?.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{counsellor?.credentials}</p>
              <div className="flex items-center gap-4 text-sm text-foreground/80">
                <div className="flex items-center gap-1">
                  <Icon name="Calendar" size={16} />
                  <span>{formatDate(selectedDate)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="Clock" size={16} />
                  <span>{selectedSlot?.time}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Select
              label="Session Type"
              description="Choose how you'd like to attend this session"
              options={sessionTypeOptions}
              value={formData?.sessionType}
              onChange={(value) => handleInputChange('sessionType', value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Insurance Provider"
              type="text"
              placeholder="e.g., Blue Cross Blue Shield"
              value={formData?.insuranceProvider}
              onChange={(e) => handleInputChange('insuranceProvider', e?.target?.value)}
            />
            <Input
              label="Policy Number"
              type="text"
              placeholder="Enter policy number"
              value={formData?.policyNumber}
              onChange={(e) => handleInputChange('policyNumber', e?.target?.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Reason for Visit <span className="text-error">*</span>
            </label>
            <textarea
              value={formData?.reasonForVisit}
              onChange={(e) => handleInputChange('reasonForVisit', e?.target?.value)}
              placeholder="Please briefly describe what you'd like to discuss in this session..."
              rows={4}
              className={`
                w-full px-4 py-3 rounded-lg border bg-background text-foreground
                placeholder:text-muted-foreground resize-none
                focus:outline-none focus:ring-2 focus:ring-ring
                ${errors?.reasonForVisit ? 'border-error' : 'border-input'}
              `}
            />
            {errors?.reasonForVisit && (
              <p className="mt-1 text-sm text-error">{errors?.reasonForVisit}</p>
            )}
          </div>

          <div className="space-y-3">
            <Checkbox
              label="This is my first session with this counsellor"
              checked={formData?.isFirstSession}
              onChange={(e) => handleInputChange('isFirstSession', e?.target?.checked)}
            />
            <Checkbox
              label="I agree to the terms and conditions, privacy policy, and cancellation policy"
              description="You can cancel or reschedule up to 24 hours before your appointment"
              error={errors?.agreeToTerms}
              checked={formData?.agreeToTerms}
              onChange={(e) => handleInputChange('agreeToTerms', e?.target?.checked)}
              required
            />
          </div>

          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} color="var(--color-accent)" className="flex-shrink-0 mt-0.5" />
              <div className="text-sm text-foreground/80">
                <p className="font-medium mb-1">Before Your Session:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>You'll receive a confirmation email with session details</li>
                  <li>A pre-session questionnaire will be sent 24 hours before</li>
                  <li>Join link will be available 15 minutes before start time</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-card/95 backdrop-blur-sm border-t border-border p-6 flex gap-3">
          <Button
            variant="outline"
            fullWidth
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            fullWidth
            iconName="Check"
            iconPosition="left"
            onClick={handleSubmit}
          >
            Confirm Booking
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;