import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const FilterPanel = ({ onFilterChange, isMobile = false }) => {
  const [isExpanded, setIsExpanded] = useState(!isMobile);
  const [selectedContentTypes, setSelectedContentTypes] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');

  const contentTypes = [
    { id: 'articles', label: 'Articles', icon: 'FileText' },
    { id: 'videos', label: 'Videos', icon: 'Video' },
    { id: 'podcasts', label: 'Podcasts', icon: 'Mic' },
    { id: 'worksheets', label: 'Worksheets', icon: 'FileCheck' }
  ];

  const topics = [
    { id: 'anxiety', label: 'Anxiety Management' },
    { id: 'depression', label: 'Depression Support' },
    { id: 'relationships', label: 'Relationships' },
    { id: 'coping', label: 'Coping Strategies' },
    { id: 'stress', label: 'Stress Management' },
    { id: 'mindfulness', label: 'Mindfulness' }
  ];

  const difficultyOptions = [
    { value: '', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const durationOptions = [
    { value: '', label: 'Any Duration' },
    { value: '0-5', label: 'Under 5 minutes' },
    { value: '5-15', label: '5-15 minutes' },
    { value: '15-30', label: '15-30 minutes' },
    { value: '30+', label: 'Over 30 minutes' }
  ];

  const handleContentTypeChange = (typeId, checked) => {
    const updated = checked
      ? [...selectedContentTypes, typeId]
      : selectedContentTypes?.filter(id => id !== typeId);
    setSelectedContentTypes(updated);
    applyFilters({ contentTypes: updated });
  };

  const handleTopicChange = (topicId, checked) => {
    const updated = checked
      ? [...selectedTopics, topicId]
      : selectedTopics?.filter(id => id !== topicId);
    setSelectedTopics(updated);
    applyFilters({ topics: updated });
  };

  const applyFilters = (updates = {}) => {
    const filters = {
      contentTypes: updates?.contentTypes !== undefined ? updates?.contentTypes : selectedContentTypes,
      topics: updates?.topics !== undefined ? updates?.topics : selectedTopics,
      difficulty: updates?.difficulty !== undefined ? updates?.difficulty : selectedDifficulty,
      duration: updates?.duration !== undefined ? updates?.duration : selectedDuration
    };
    onFilterChange(filters);
  };

  const handleClearFilters = () => {
    setSelectedContentTypes([]);
    setSelectedTopics([]);
    setSelectedDifficulty('');
    setSelectedDuration('');
    onFilterChange({
      contentTypes: [],
      topics: [],
      difficulty: '',
      duration: ''
    });
  };

  const activeFilterCount = selectedContentTypes?.length + selectedTopics?.length + 
    (selectedDifficulty ? 1 : 0) + (selectedDuration ? 1 : 0);

  return (
    <div className={`glass-card ${isMobile ? 'mb-6' : ''}`}>
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => isMobile && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Icon name="Filter" size={20} className="text-primary" />
          <h3 className="font-heading font-semibold text-lg text-foreground">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-primary text-primary-foreground text-xs font-medium">
              {activeFilterCount}
            </span>
          )}
        </div>
        {isMobile && (
          <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={20} />
        )}
      </div>
      {isExpanded && (
        <div className="px-4 pb-4 space-y-6">
          <div>
            <h4 className="font-medium text-sm text-foreground mb-3">Content Type</h4>
            <div className="space-y-2">
              {contentTypes?.map(type => (
                <Checkbox
                  key={type?.id}
                  label={
                    <div className="flex items-center gap-2">
                      <Icon name={type?.icon} size={16} />
                      <span>{type?.label}</span>
                    </div>
                  }
                  checked={selectedContentTypes?.includes(type?.id)}
                  onChange={(e) => handleContentTypeChange(type?.id, e?.target?.checked)}
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm text-foreground mb-3">Topics</h4>
            <div className="space-y-2">
              {topics?.map(topic => (
                <Checkbox
                  key={topic?.id}
                  label={topic?.label}
                  checked={selectedTopics?.includes(topic?.id)}
                  onChange={(e) => handleTopicChange(topic?.id, e?.target?.checked)}
                />
              ))}
            </div>
          </div>

          <div>
            <Select
              label="Difficulty Level"
              options={difficultyOptions}
              value={selectedDifficulty}
              onChange={(value) => {
                setSelectedDifficulty(value);
                applyFilters({ difficulty: value });
              }}
            />
          </div>

          <div>
            <Select
              label="Duration"
              options={durationOptions}
              value={selectedDuration}
              onChange={(value) => {
                setSelectedDuration(value);
                applyFilters({ duration: value });
              }}
            />
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={handleClearFilters}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors duration-150"
            >
              <Icon name="X" size={16} />
              <span className="text-sm font-medium">Clear All Filters</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;