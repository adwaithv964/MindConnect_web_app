import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import Icon from '../../../components/AppIcon';

const MOOD_LABELS = ['', 'Very Sad 😢', 'Sad 😔', 'Neutral 😐', 'Happy 🙂', 'Very Happy 😊'];
const MOOD_EMOJIS = ['', '😢', '😔', '😐', '🙂', '😊'];

// Format timestamp for X-axis label
const formatXLabel = (timestamp, timeRange) => {
  const d = new Date(timestamp);
  if (timeRange === 'week') {
    // Show date + time for granular view
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getTimeOfDay = (timestamp) => {
  const hour = new Date(timestamp).getHours();
  if (hour >= 5 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 17) return 'Afternoon';
  if (hour >= 17 && hour < 21) return 'Evening';
  return 'Night';
};

const MoodTrendChart = ({ moodHistory, stats, loading }) => {
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState('week');

  const chartData = useMemo(() => {
    if (!moodHistory || moodHistory.length === 0) return [];

    const ranges = { week: 7, month: 30, quarter: 90 };
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - ranges[timeRange]);
    cutoff.setHours(0, 0, 0, 0);

    const filtered = moodHistory
      .filter(e => new Date(e.timestamp) >= cutoff)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (timeRange === 'week') {
      // Plot every individual entry with its exact time
      return filtered.map(entry => ({
        label: formatXLabel(entry.timestamp, 'week'),
        mood: entry.moodId,
        intensity: entry.intensity,
        emoji: entry.moodEmoji || MOOD_EMOJIS[entry.moodId],
        timeOfDay: getTimeOfDay(entry.timestamp),
        raw: entry.timestamp
      }));
    }

    // For month/quarter: aggregate by calendar date (average mood per day)
    const byDate = {};
    filtered.forEach(entry => {
      const d = new Date(entry.timestamp);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!byDate[key]) byDate[key] = { total: 0, count: 0, intensityTotal: 0 };
      byDate[key].total += entry.moodId;
      byDate[key].intensityTotal += entry.intensity;
      byDate[key].count++;
    });

    return Object.entries(byDate).map(([label, { total, count, intensityTotal }]) => ({
      label,
      mood: parseFloat((total / count).toFixed(2)),
      intensity: Math.round(intensityTotal / count),
      emoji: MOOD_EMOJIS[Math.round(total / count)],
      timeOfDay: null,
      raw: label
    }));
  }, [moodHistory, timeRange]);

  const hasData = chartData.length > 0;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length && payload[0].value !== null) {
      const d = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-xl p-3 shadow-lg max-w-[180px]">
          <p className="text-xs font-semibold text-foreground mb-1">{d.label}</p>
          {d.timeOfDay && (
            <p className="text-xs text-muted-foreground mb-1">🕐 {d.timeOfDay}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Mood: <span className="font-bold text-primary">{MOOD_LABELS[Math.round(payload[0].value)]}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Intensity: <span className="font-semibold text-secondary">{d.intensity}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (!payload.mood) return null;
    return (
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize={16}>{payload.emoji}</text>
    );
  };

  return (
    <div className="glass-card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-heading font-semibold text-foreground">Mood Trends</h3>
          {timeRange === 'week' && hasData && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Showing {chartData.length} entries — each point is an individual log
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button onClick={() => setChartType('line')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${chartType === 'line' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`} aria-label="Line chart"><Icon name="LineChart" size={16} /></button>
            <button onClick={() => setChartType('bar')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${chartType === 'bar' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`} aria-label="Bar chart"><Icon name="BarChart3" size={16} /></button>
          </div>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {['week', 'month', 'quarter'].map(range => (
              <button key={range} onClick={() => setTimeRange(range)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${timeRange === range ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>{range}</button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="w-full h-80 flex items-center justify-center">
          <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
        </div>
      ) : !hasData ? (
        <div className="w-full h-80 flex flex-col items-center justify-center text-muted-foreground gap-3">
          <Icon name="BarChart2" size={48} className="opacity-30" />
          <p className="text-sm">No entries in this range. Start logging your mood!</p>
        </div>
      ) : (
        <div className="w-full h-80" aria-label="Mood trend visualization">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData} margin={{ top: 24, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="label"
                  stroke="var(--color-muted-foreground)"
                  style={{ fontSize: '11px' }}
                  interval={timeRange === 'week' && chartData.length > 7 ? Math.floor(chartData.length / 5) : 0}
                  tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }}
                />
                <YAxis
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  stroke="var(--color-muted-foreground)"
                  style={{ fontSize: '12px' }}
                  tickFormatter={v => MOOD_EMOJIS[v] || v}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {/* Reference lines for time-of-day context */}
                {timeRange === 'week' && <ReferenceLine y={3} stroke="var(--color-border)" strokeDasharray="4 4" label={{ value: 'Neutral', position: 'right', fontSize: 10, fill: 'var(--color-muted-foreground)' }} />}
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  dot={<CustomDot />}
                  activeDot={{ r: 6, fill: 'var(--color-primary)' }}
                  name="Mood Level"
                  connectNulls={false}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 24, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="label" stroke="var(--color-muted-foreground)" style={{ fontSize: '11px' }} interval={timeRange === 'week' && chartData.length > 7 ? Math.floor(chartData.length / 5) : 0} />
                <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} tickFormatter={v => MOOD_EMOJIS[v] || v} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="mood" fill="var(--color-secondary)" radius={[6, 6, 0, 0]} name="Mood Level" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {/* Time-of-day legend for week view */}
      {timeRange === 'week' && hasData && (
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border">
          {[
            { label: 'Morning', icon: '🌅', range: '5am–12pm' },
            { label: 'Afternoon', icon: '☀️', range: '12pm–5pm' },
            { label: 'Evening', icon: '🌆', range: '5pm–9pm' },
            { label: 'Night', icon: '🌙', range: '9pm–5am' }
          ].map(t => (
            <div key={t.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>{t.icon}</span>
              <span className="font-medium text-foreground">{t.label}</span>
              <span>{t.range}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{stats?.averageMood ?? '—'}</p>
          <p className="text-xs text-muted-foreground mt-1">Average Mood</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-secondary">{stats ? `${stats.positiveDaysPercent}%` : '—'}</p>
          <p className="text-xs text-muted-foreground mt-1">Positive Days</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-accent">{stats?.streak ?? '—'}</p>
          <p className="text-xs text-muted-foreground mt-1">Day Streak 🔥</p>
        </div>
      </div>
    </div>
  );
};

export default MoodTrendChart;