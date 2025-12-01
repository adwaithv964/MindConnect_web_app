import React from 'react';
import Icon from '../../../components/AppIcon';

const MoodSelector = ({ selectedMood, onMoodSelect, moodIntensity, onIntensityChange }) => {
  const moods = [
    { 
      id: 1, 
      emoji: '😢', 
      label: 'Very Sad', 
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-400'
    },
    { 
      id: 2, 
      emoji: '😔', 
      label: 'Sad', 
      color: 'from-blue-300 to-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
      borderColor: 'border-cyan-400'
    },
    { 
      id: 3, 
      emoji: '😐', 
      label: 'Neutral', 
      color: 'from-gray-300 to-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-800/20',
      borderColor: 'border-gray-400'
    },
    { 
      id: 4, 
      emoji: '🙂', 
      label: 'Happy', 
      color: 'from-yellow-300 to-orange-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-400'
    },
    { 
      id: 5, 
      emoji: '😊', 
      label: 'Very Happy', 
      color: 'from-orange-400 to-yellow-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-400'
    }
  ];

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-heading font-semibold text-foreground mb-6">
        How are you feeling today?
      </h2>
      <div className="grid grid-cols-5 gap-3 mb-8">
        {moods?.map((mood) => (
          <button
            key={mood?.id}
            onClick={() => onMoodSelect(mood)}
            className={`
              relative flex flex-col items-center justify-center p-4 rounded-xl
              transition-all duration-300 ease-in-out
              ${selectedMood?.id === mood?.id 
                ? `${mood?.bgColor} border-2 ${mood?.borderColor} scale-105 shadow-lg` 
                : 'bg-card hover:bg-muted border-2 border-transparent hover:scale-102'
              }
            `}
            aria-label={`Select ${mood?.label} mood`}
          >
            <span className="text-4xl mb-2">{mood?.emoji}</span>
            <span className="text-xs font-medium text-foreground text-center">
              {mood?.label}
            </span>
            {selectedMood?.id === mood?.id && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Icon name="Check" size={14} color="#FFFFFF" />
              </div>
            )}
          </button>
        ))}
      </div>
      {selectedMood && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Mood Intensity: {moodIntensity}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={moodIntensity}
              onChange={(e) => onIntensityChange(parseInt(e?.target?.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              aria-label="Adjust mood intensity"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>

          <div className={`h-3 rounded-full bg-gradient-to-r ${selectedMood?.color} opacity-${Math.floor(moodIntensity / 10)}`} />
        </div>
      )}
    </div>
  );
};

export default MoodSelector;