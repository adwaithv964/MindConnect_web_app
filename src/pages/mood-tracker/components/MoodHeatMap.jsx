import React, { useMemo } from 'react';
import Icon from '../../../components/AppIcon';

const MOOD_COLORS = {
  1: 'bg-blue-400',
  2: 'bg-cyan-400',
  3: 'bg-gray-400',
  4: 'bg-yellow-400',
  5: 'bg-orange-400'
};
const MOOD_LABELS = { 1: 'Very Sad', 2: 'Sad', 3: 'Neutral', 4: 'Happy', 5: 'Very Happy' };
const MOOD_EMOJIS = { 1: '😢', 2: '😔', 3: '😐', 4: '🙂', 5: '😊' };

const WEEKS = 12;

const MoodHeatMap = ({ moodHistory }) => {
  // Build per-day lookup: avg mood + entry count
  const dayData = useMemo(() => {
    const map = {};
    (moodHistory || []).forEach(entry => {
      const d = new Date(entry.timestamp);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = { total: 0, count: 0, entries: [] };
      map[key].total += entry.moodId;
      map[key].count++;
      map[key].entries.push(entry);
    });
    // Compute average mood per day
    Object.keys(map).forEach(k => {
      map[k].avgMood = Math.round(map[k].total / map[k].count);
    });
    return map;
  }, [moodHistory]);

  const heatMapData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const grid = [];
    for (let week = WEEKS - 1; week >= 0; week--) {
      const weekRow = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (week * 7 + (6 - day)));
        const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        const data = dayData[key];
        weekRow.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          avgMood: data?.avgMood || null,
          count: data?.count || 0,
          isFuture: date > today
        });
      }
      grid.push(weekRow);
    }
    return grid;
  }, [dayData]);

  const buildTooltip = (day) => {
    if (day.isFuture) return day.date;
    if (!day.avgMood) return `${day.date}: No entries`;
    return `${day.date}: ${MOOD_LABELS[day.avgMood]} ${MOOD_EMOJIS[day.avgMood]} — ${day.count} log${day.count !== 1 ? 's' : ''}`;
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-heading font-semibold text-foreground">Mood Calendar</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Darker = more entries logged that day. Badge shows count.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="Calendar" size={16} />
          <span>Last 12 weeks</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="flex gap-1 mb-2">
            <div className="w-8" />
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="w-8 text-center text-xs text-muted-foreground font-medium">{d}</div>
            ))}
          </div>

          <div className="space-y-1">
            {heatMapData.map((week, wi) => (
              <div key={wi} className="flex gap-1">
                <div className="w-8 flex items-center justify-center text-xs text-muted-foreground">W{wi + 1}</div>
                {week.map((day, di) => (
                  <div
                    key={di}
                    className={`relative w-8 h-8 rounded-md transition-all duration-200 hover:scale-110 hover:shadow-lg cursor-pointer overflow-visible
                      ${day.isFuture ? 'bg-muted/30 cursor-default' : day.avgMood ? MOOD_COLORS[day.avgMood] : 'bg-muted/50'}
                    `}
                    style={{ opacity: day.avgMood && day.count > 1 ? Math.min(1, 0.6 + day.count * 0.15) : undefined }}
                    title={buildTooltip(day)}
                    aria-label={buildTooltip(day)}
                  >
                    {/* Count badge for multi-entry days */}
                    {day.count > 1 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-foreground text-background text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-sm">
                        {day.count > 9 ? '9+' : day.count}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-border flex-wrap gap-2">
        <span className="text-sm text-muted-foreground">Mood Scale:</span>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-muted/50" />
            <span className="text-xs text-muted-foreground hidden sm:inline">No entry</span>
          </div>
          {[1, 2, 3, 4, 5].map(m => (
            <div key={m} className="flex items-center gap-1">
              <div className={`w-4 h-4 rounded ${MOOD_COLORS[m]}`} />
              <span className="text-xs text-muted-foreground hidden sm:inline">{MOOD_LABELS[m]}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground w-full mt-1">
          <span className="font-semibold">Badge number</span> = multiple logs in one day
        </p>
      </div>
    </div>
  );
};

export default MoodHeatMap;