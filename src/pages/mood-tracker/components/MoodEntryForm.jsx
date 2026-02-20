import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const MoodEntryForm = ({ selectedMood, moodIntensity, onSubmit, submitting }) => {
  const [notes, setNotes] = useState('');
  const [selectedFactors, setSelectedFactors] = useState([]);
  const [shareWithCounsellor, setShareWithCounsellor] = useState(false);

  const contributingFactors = [
    { id: 'work', label: 'Work/Study', icon: 'Briefcase' },
    { id: 'relationships', label: 'Relationships', icon: 'Users' },
    { id: 'health', label: 'Physical Health', icon: 'Activity' },
    { id: 'sleep', label: 'Sleep Quality', icon: 'Moon' },
    { id: 'exercise', label: 'Exercise', icon: 'Dumbbell' },
    { id: 'social', label: 'Social Life', icon: 'MessageCircle' },
    { id: 'weather', label: 'Weather', icon: 'Cloud' },
    { id: 'finances', label: 'Finances', icon: 'DollarSign' }
  ];

  const toggleFactor = (factorId) => {
    setSelectedFactors(prev =>
      prev.includes(factorId) ? prev.filter(id => id !== factorId) : [...prev, factorId]
    );
  };

  const handleSubmit = () => {
    if (!selectedMood || submitting) return;

    const entry = {
      moodId: selectedMood.id,
      moodLabel: selectedMood.label,
      moodEmoji: selectedMood.emoji,
      intensity: moodIntensity,
      notes,
      factors: selectedFactors,
      shareWithCounsellor,
      timestamp: new Date().toISOString()
    };

    onSubmit(entry);
    setNotes('');
    setSelectedFactors([]);
    setShareWithCounsellor(false);
  };

  return (
    <div className="glass-card p-6 space-y-6">
      <div>
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
          Add Context to Your Mood
        </h3>

        <Input
          label="Notes (Optional)"
          type="text"
          placeholder="What's on your mind? Any specific thoughts or events..."
          value={notes}
          onChange={(e) => setNotes(e?.target?.value)}
          description="Share what contributed to your current mood"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Contributing Factors
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {contributingFactors.map((factor) => (
            <button
              key={factor.id}
              onClick={() => toggleFactor(factor.id)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                transition-all duration-200
                ${selectedFactors.includes(factor.id)
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-card text-foreground hover:bg-muted border border-border'
                }
              `}
              aria-pressed={selectedFactors.includes(factor.id)}
            >
              <Icon name={factor.icon} size={16} />
              <span>{factor.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="pt-4 border-t border-border">
        <Checkbox
          label="Share this entry with my counsellor"
          description="Allow your counsellor to view this mood entry for better support"
          checked={shareWithCounsellor}
          onChange={(e) => setShareWithCounsellor(e?.target?.checked)}
        />
      </div>
      <Button
        variant="default"
        fullWidth
        iconName={submitting ? 'Loader2' : 'Save'}
        iconPosition="left"
        onClick={handleSubmit}
        disabled={!selectedMood || submitting}
      >
        {submitting ? 'Saving...' : 'Save Mood Entry'}
      </Button>
    </div>
  );
};

export default MoodEntryForm;