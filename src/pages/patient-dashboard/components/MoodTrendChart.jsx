import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';

const MoodTrendChart = ({ data }) => {
  const moodToValue = {
    excellent: 5,
    good: 4,
    okay: 3,
    low: 2,
    poor: 1
  };

  const chartData = data?.map(entry => ({
    date: entry?.date,
    value: moodToValue?.[entry?.mood],
    mood: entry?.mood
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-1">{payload?.[0]?.payload?.date}</p>
          <p className="text-sm text-muted-foreground capitalize">Mood: {payload?.[0]?.payload?.mood}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-heading font-semibold text-foreground mb-1">Mood Trends</h2>
          <p className="text-sm text-muted-foreground">Last 7 days overview</p>
        </div>
        <Icon name="TrendingUp" size={24} className="text-primary" />
      </div>

      <div className="w-full h-64" aria-label="Weekly Mood Trend Line Chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="date" 
              stroke="var(--color-muted-foreground)"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              domain={[0, 6]}
              ticks={[1, 2, 3, 4, 5]}
              stroke="var(--color-muted-foreground)"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="var(--color-primary)" 
              strokeWidth={3}
              dot={{ fill: 'var(--color-primary)', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-2xl font-semibold text-success">4.2</p>
          <p className="text-xs text-muted-foreground">Average</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-primary">+12%</p>
          <p className="text-xs text-muted-foreground">Improvement</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-warning">3</p>
          <p className="text-xs text-muted-foreground">Low Days</p>
        </div>
      </div>
    </div>
  );
};

export default MoodTrendChart;