import React from 'react';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FilterPanel = ({ filters, onFilterChange, onClearFilters }) => {
  const specialtyOptions = [
    { value: 'all', label: 'All Specialties' },
    { value: 'anxiety', label: 'Anxiety & Stress' },
    { value: 'depression', label: 'Depression' },
    { value: 'trauma', label: 'Trauma & PTSD' },
    { value: 'relationships', label: 'Relationships' },
    { value: 'addiction', label: 'Addiction' },
    { value: 'grief', label: 'Grief & Loss' }
  ];

  const sessionTypeOptions = [
    { value: 'all', label: 'All Session Types' },
    { value: 'individual', label: 'Individual Therapy' },
    { value: 'group', label: 'Group Therapy' },
    { value: 'crisis', label: 'Crisis Intervention' },
    { value: 'couples', label: 'Couples Therapy' }
  ];

  const languageOptions = [
    { value: 'all', label: 'All Languages' },
    { value: 'english', label: 'English' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'mandarin', label: 'Mandarin' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'french', label: 'French' }
  ];

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading font-semibold text-xl text-foreground flex items-center gap-2">
          <Icon name="Filter" size={24} color="var(--color-primary)" />
          Filters
        </h2>
        <Button
          variant="ghost"
          size="sm"
          iconName="X"
          iconPosition="left"
          onClick={onClearFilters}
        >
          Clear All
        </Button>
      </div>
      <div className="space-y-6">
        <div>
          <Select
            label="Specialty Area"
            options={specialtyOptions}
            value={filters?.specialty}
            onChange={(value) => onFilterChange('specialty', value)}
            className="mb-4"
          />
        </div>

        <div>
          <Select
            label="Session Type"
            options={sessionTypeOptions}
            value={filters?.sessionType}
            onChange={(value) => onFilterChange('sessionType', value)}
            className="mb-4"
          />
        </div>

        <div>
          <Select
            label="Language Preference"
            options={languageOptions}
            value={filters?.language}
            onChange={(value) => onFilterChange('language', value)}
            className="mb-4"
          />
        </div>

        <div className="border-t border-border pt-4">
          <h3 className="font-medium text-foreground mb-3">Availability</h3>
          <div className="space-y-2">
            <Checkbox
              label="Available Today"
              checked={filters?.availableToday}
              onChange={(e) => onFilterChange('availableToday', e?.target?.checked)}
            />
            <Checkbox
              label="Available This Week"
              checked={filters?.availableThisWeek}
              onChange={(e) => onFilterChange('availableThisWeek', e?.target?.checked)}
            />
            <Checkbox
              label="Evening Slots"
              checked={filters?.eveningSlots}
              onChange={(e) => onFilterChange('eveningSlots', e?.target?.checked)}
            />
            <Checkbox
              label="Weekend Slots"
              checked={filters?.weekendSlots}
              onChange={(e) => onFilterChange('weekendSlots', e?.target?.checked)}
            />
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <h3 className="font-medium text-foreground mb-3">Session Format</h3>
          <div className="space-y-2">
            <Checkbox
              label="Video Call"
              checked={filters?.videoCall}
              onChange={(e) => onFilterChange('videoCall', e?.target?.checked)}
            />
            <Checkbox
              label="Phone Call"
              checked={filters?.phoneCall}
              onChange={(e) => onFilterChange('phoneCall', e?.target?.checked)}
            />
            <Checkbox
              label="In-Person"
              checked={filters?.inPerson}
              onChange={(e) => onFilterChange('inPerson', e?.target?.checked)}
            />
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <h3 className="font-medium text-foreground mb-3">Insurance</h3>
          <Checkbox
            label="Accepts My Insurance"
            description="Filter counsellors who accept your insurance plan"
            checked={filters?.acceptsInsurance}
            onChange={(e) => onFilterChange('acceptsInsurance', e?.target?.checked)}
          />
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;