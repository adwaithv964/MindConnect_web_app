import React, { useMemo } from 'react';
import Icon from '../../../components/AppIcon';

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const FACTOR_LABELS = {
  work: 'Work/Study', relationships: 'Relationships', health: 'Physical Health',
  sleep: 'Sleep Quality', exercise: 'Exercise', social: 'Social Life',
  weather: 'Weather', finances: 'Finances'
};

const TIME_SLOTS = [
  { id: 'Morning', label: 'Morning', icon: '🌅', hours: [5, 12] },
  { id: 'Afternoon', label: 'Afternoon', icon: '☀️', hours: [12, 17] },
  { id: 'Evening', label: 'Evening', icon: '🌆', hours: [17, 21] },
  { id: 'Night', label: 'Night', icon: '🌙', hours: [21, 29] } // 29 wraps through midnight
];

const getSlot = (timestamp) => {
  const h = new Date(timestamp).getHours();
  if (h >= 5 && h < 12) return 'Morning';
  if (h >= 12 && h < 17) return 'Afternoon';
  if (h >= 17 && h < 21) return 'Evening';
  return 'Night';
};

const MOOD_LABELS = ['', 'Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];
const MOOD_EMOJIS = ['', '😢', '😔', '😐', '🙂', '😊'];

const MoodInsights = ({ moodHistory, stats, loading, onDelete }) => {
  // --- Time-of-day analytics ---
  const timeOfDayStats = useMemo(() => {
    if (!moodHistory || moodHistory.length === 0) return [];
    const slotData = {};
    TIME_SLOTS.forEach(s => { slotData[s.id] = { total: 0, count: 0 }; });

    moodHistory.forEach(entry => {
      const slot = getSlot(entry.timestamp);
      if (slotData[slot]) {
        slotData[slot].total += entry.moodId;
        slotData[slot].count++;
      }
    });

    return TIME_SLOTS.map(s => {
      const d = slotData[s.id];
      const avg = d.count > 0 ? parseFloat((d.total / d.count).toFixed(1)) : null;
      return { ...s, avg, count: d.count, moodLabel: avg ? MOOD_LABELS[Math.round(avg)] : null, emoji: avg ? MOOD_EMOJIS[Math.round(avg)] : null };
    }).filter(s => s.count > 0);
  }, [moodHistory]);

  const bestTimeSlot = useMemo(() => {
    if (timeOfDayStats.length === 0) return null;
    return timeOfDayStats.reduce((a, b) => (b.avg > a.avg ? b : a));
  }, [timeOfDayStats]);

  const worstTimeSlot = useMemo(() => {
    if (timeOfDayStats.length < 2) return null;
    return timeOfDayStats.reduce((a, b) => (b.avg < a.avg ? b : a));
  }, [timeOfDayStats]);

  // --- Dynamic insights ---
  const insights = useMemo(() => {
    if (!moodHistory || moodHistory.length === 0) return [];
    const items = [];

    if (stats?.trend === 'improving') {
      items.push({ id: 'trend-up', icon: 'TrendingUp', iconColor: 'text-success', bgColor: 'bg-success/10', title: 'Positive Trend Detected', description: 'Your mood improved compared to last week. Keep it up!' });
    } else if (stats?.trend === 'declining') {
      items.push({ id: 'trend-down', icon: 'TrendingDown', iconColor: 'text-error', bgColor: 'bg-error/10', title: 'Mood Dip Noticed', description: 'Your mood has been lower than last week. Consider reaching out to your counsellor.' });
    }

    if (bestTimeSlot && worstTimeSlot && bestTimeSlot.id !== worstTimeSlot.id) {
      items.push({ id: 'time-best', icon: 'Sun', iconColor: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', title: `${bestTimeSlot.icon} You shine in the ${bestTimeSlot.label}`, description: `Your average mood is highest in the ${bestTimeSlot.label} (${bestTimeSlot.avg}/5). ${worstTimeSlot.icon} ${worstTimeSlot.label} tends to be harder — plan self-care then!` });
    }

    if (stats?.streak >= 7) {
      items.push({ id: 'streak', icon: 'Award', iconColor: 'text-accent', bgColor: 'bg-accent/10', title: `🔥 ${stats.streak}-Day Streak!`, description: `You've logged your mood ${stats.streak} consecutive days. That's awesome consistency!` });
    } else if (stats?.streak >= 3) {
      items.push({ id: 'streak', icon: 'Flame', iconColor: 'text-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-900/20', title: `${stats.streak}-Day Streak`, description: `You're building a habit! Keep logging daily.` });
    }

    if (stats?.weekdayAverages && Object.keys(stats.weekdayAverages).length >= 3) {
      const entries = Object.entries(stats.weekdayAverages);
      const best = entries.reduce((a, b) => b[1] > a[1] ? b : a);
      const worst = entries.reduce((a, b) => b[1] < a[1] ? b : a);
      if (best[0] !== worst[0]) {
        items.push({ id: 'best-day', icon: 'CalendarCheck', iconColor: 'text-primary', bgColor: 'bg-primary/10', title: `Best Day: ${WEEKDAY_NAMES[parseInt(best[0])]}`, description: `Avg mood ${best[1].toFixed(1)}/5 on ${WEEKDAY_NAMES[parseInt(best[0])]}. ${WEEKDAY_NAMES[parseInt(worst[0])]} is your toughest — consider scheduling something uplifting!` });
      }
    }

    if (stats?.topFactors?.length > 0) {
      const top = stats.topFactors[0];
      items.push({ id: 'top-factor', icon: 'Activity', iconColor: 'text-primary', bgColor: 'bg-primary/10', title: `Top Factor: ${FACTOR_LABELS[top.factor] || top.factor}`, description: `You've tagged "${FACTOR_LABELS[top.factor] || top.factor}" ${top.count} time(s) — it's a key influence on your mood.` });
    }

    if (items.length === 0) {
      items.push({ id: 'start', icon: 'Sparkles', iconColor: 'text-primary', bgColor: 'bg-primary/10', title: 'Keep Logging!', description: 'Log your mood for a few more days to unlock personalised insights.' });
    }

    return items;
  }, [moodHistory, stats, bestTimeSlot, worstTimeSlot]);

  const topFactors = useMemo(() => {
    if (!stats?.topFactors) return [];
    const max = stats.topFactors[0]?.count || 1;
    return stats.topFactors.map(({ factor, count }) => ({ factor: FACTOR_LABELS[factor] || factor, impact: Math.round((count / max) * 100), count }));
  }, [stats]);

  const recentEntries = useMemo(() => (moodHistory || []).slice(0, 5), [moodHistory]);

  return (
    <div className="space-y-6">
      {/* Insights */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-heading font-semibold text-foreground">Mood Insights</h3>
          {stats && (
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${stats.trend === 'improving' ? 'bg-success/10 text-success' : stats.trend === 'declining' ? 'bg-error/10 text-error' : 'bg-muted text-muted-foreground'}`}>
              {stats.trend === 'improving' ? '📈 Improving' : stats.trend === 'declining' ? '📉 Declining' : '➡️ Stable'}
            </span>
          )}
        </div>
        {loading ? (
          <div className="flex justify-center py-8"><Icon name="Loader2" size={28} className="animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="space-y-3">
            {insights.map(insight => (
              <div key={insight.id} className="flex gap-3 p-3 rounded-lg bg-card hover:bg-muted transition-colors">
                <div className={`flex-shrink-0 w-9 h-9 rounded-lg ${insight.bgColor} flex items-center justify-center`}>
                  <Icon name={insight.icon} size={18} className={insight.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground mb-0.5">{insight.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Time-of-Day Mood Pattern */}
      {timeOfDayStats.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Mood by Time of Day</h3>
          <div className="space-y-3">
            {TIME_SLOTS.map(slot => {
              const data = timeOfDayStats.find(s => s.id === slot.id);
              if (!data) return null;
              const barWidth = `${Math.round((data.avg / 5) * 100)}%`;
              return (
                <div key={slot.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{slot.icon}</span>
                      <span className="text-sm font-medium text-foreground">{slot.label}</span>
                      <span className="text-xs text-muted-foreground">({data.count} log{data.count !== 1 ? 's' : ''})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-base">{data.emoji}</span>
                      <span className="text-sm font-bold text-primary">{data.avg}/5</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-700" style={{ width: barWidth }} />
                  </div>
                  <p className="text-xs text-muted-foreground">{data.moodLabel}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Factors */}
      {topFactors.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Top Factors</h3>
          <div className="space-y-3">
            {topFactors.map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{item.factor}</span>
                  <span className="text-xs text-muted-foreground">{item.count} log{item.count !== 1 ? 's' : ''}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500" style={{ width: `${item.impact}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Entries */}
      {recentEntries.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Recent Entries</h3>
          <div className="space-y-2">
            {recentEntries.map(entry => (
              <div key={entry._id} className="flex items-center justify-between p-3 rounded-lg bg-card hover:bg-muted transition-colors group">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{entry.moodEmoji || '😐'}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{entry.moodLabel || 'Neutral'}</p>
                      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{getSlot(entry.timestamp)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                    {entry.notes && <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[140px]">"{entry.notes}"</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">{entry.intensity}%</span>
                  {onDelete && (
                    <button onClick={() => onDelete(entry._id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-error p-1 rounded" aria-label="Delete entry">
                      <Icon name="Trash2" size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodInsights;