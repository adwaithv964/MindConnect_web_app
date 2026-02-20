import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PatientOverviewCard = ({ patient, onViewDetails, onStartChat }) => {
  const getRiskLevelColor = (level) => {
    const colors = {
      low: 'bg-success/10 text-success border-success/20',
      medium: 'bg-warning/10 text-warning border-warning/20',
      high: 'bg-error/10 text-error border-error/20',
      critical: 'bg-destructive/10 text-destructive border-destructive/20'
    };
    return colors?.[level] || colors?.low;
  };

  const getMoodIcon = (mood) => {
    const icons = {
      happy: 'Smile',
      neutral: 'Meh',
      sad: 'Frown',
      anxious: 'AlertCircle',
      stressed: 'Zap'
    };
    return icons?.[mood] || 'Circle';
  };

  const formatLastSession = (date) => {
    const sessionDate = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now - sessionDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return sessionDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="glass-card p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="relative w-16 h-16">
              {patient?.avatar ? (
                <img
                  src={patient.avatar}
                  alt={patient?.avatarAlt || patient?.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-border"
                  onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              <div
                className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-2xl border-2 border-border"
                style={{ display: patient?.avatar ? 'none' : 'flex' }}
              >
                {(patient?.name || 'P')[0].toUpperCase()}
              </div>
            </div>
            {patient?.isOnline && (
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-success rounded-full border-2 border-background"></span>
            )}
          </div>
          <div>
            <h3 className="font-heading font-semibold text-lg text-foreground">{patient?.name}</h3>
            <p className="text-sm text-muted-foreground">Patient ID: {patient?.id}</p>
            <p className="text-xs text-muted-foreground mt-1">Last session: {formatLastSession(patient?.lastSession)}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskLevelColor(patient?.riskLevel)}`}>
          {patient?.riskLevel?.toUpperCase()}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <Icon name={getMoodIcon(patient?.currentMood)} size={20} className="text-primary" />
          </div>
          <p className="text-xs text-muted-foreground">Current Mood</p>
          <p className="text-sm font-medium text-foreground capitalize">{patient?.currentMood}</p>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <Icon name="TrendingUp" size={20} className="text-secondary" />
          </div>
          <p className="text-xs text-muted-foreground">Progress</p>
          <p className="text-sm font-medium text-foreground">{patient?.progressScore}%</p>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <Icon name="Calendar" size={20} className="text-accent" />
          </div>
          <p className="text-xs text-muted-foreground">Sessions</p>
          <p className="text-sm font-medium text-foreground">{patient?.totalSessions}</p>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Treatment Goals Progress</span>
          <span className="text-xs font-medium text-foreground">{patient?.goalsCompleted}/{patient?.totalGoals}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary rounded-full h-2 transition-all duration-500"
            style={{ width: `${(patient?.goalsCompleted / patient?.totalGoals) * 100}%` }}
          ></div>
        </div>
      </div>
      {patient?.recentNotes && (
        <div className="mb-4 p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Recent Note:</p>
          <p className="text-sm text-foreground line-clamp-2">{patient?.recentNotes}</p>
        </div>
      )}
      <div className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          fullWidth
          iconName="FileText"
          iconPosition="left"
          onClick={() => onViewDetails(patient?.id)}
        >
          View Details
        </Button>
        <Button
          variant="outline"
          size="sm"
          fullWidth
          iconName="MessageCircle"
          iconPosition="left"
          onClick={() => onStartChat(patient?.id)}
        >
          Chat
        </Button>
      </div>
    </div>
  );
};

export default PatientOverviewCard;