import React from 'react';
import Icon from '../../../components/AppIcon';

const MoodHeatMap = () => {
  const generateHeatMapData = () => {
    const weeks = 12;
    const daysPerWeek = 7;
    const data = [];
    const today = new Date();

    for (let week = weeks - 1; week >= 0; week--) {
      const weekData = [];
      for (let day = 0; day < daysPerWeek; day++) {
        const date = new Date(today);
        date?.setDate(date?.getDate() - (week * 7 + (6 - day)));
        
        const moodValue = Math.floor(Math.random() * 5) + 1;
        weekData?.push({
          date: date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          mood: moodValue,
          dayOfWeek: date?.toLocaleDateString('en-US', { weekday: 'short' })
        });
      }
      data?.push(weekData);
    }

    return data;
  };

  const heatMapData = generateHeatMapData();

  const getMoodColor = (mood) => {
    const colors = {
      1: 'bg-blue-400',
      2: 'bg-cyan-400',
      3: 'bg-gray-400',
      4: 'bg-yellow-400',
      5: 'bg-orange-400'
    };
    return colors?.[mood] || 'bg-gray-200';
  };

  const getMoodLabel = (mood) => {
    const labels = {
      1: 'Very Sad',
      2: 'Sad',
      3: 'Neutral',
      4: 'Happy',
      5: 'Very Happy'
    };
    return labels?.[mood] || 'Unknown';
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-heading font-semibold text-foreground">
          Mood Calendar
        </h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="Calendar" size={16} />
          <span>Last 12 weeks</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="flex gap-1 mb-2">
            <div className="w-8" />
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']?.map((day) => (
              <div key={day} className="w-8 text-center text-xs text-muted-foreground font-medium">
                {day}
              </div>
            ))}
          </div>

          <div className="space-y-1">
            {heatMapData?.map((week, weekIndex) => (
              <div key={weekIndex} className="flex gap-1">
                <div className="w-8 flex items-center justify-center text-xs text-muted-foreground">
                  W{weekIndex + 1}
                </div>
                {week?.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`
                      w-8 h-8 rounded-md ${getMoodColor(day?.mood)}
                      transition-all duration-200 hover:scale-110 hover:shadow-lg
                      cursor-pointer
                    `}
                    title={`${day?.date}: ${getMoodLabel(day?.mood)}`}
                    aria-label={`${day?.date}: ${getMoodLabel(day?.mood)}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
        <span className="text-sm text-muted-foreground">Mood Scale:</span>
        <div className="flex items-center gap-2">
          {[
            { mood: 1, label: 'Very Sad' },
            { mood: 2, label: 'Sad' },
            { mood: 3, label: 'Neutral' },
            { mood: 4, label: 'Happy' },
            { mood: 5, label: 'Very Happy' }
          ]?.map((item) => (
            <div key={item?.mood} className="flex items-center gap-1">
              <div className={`w-4 h-4 rounded ${getMoodColor(item?.mood)}`} />
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {item?.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoodHeatMap;