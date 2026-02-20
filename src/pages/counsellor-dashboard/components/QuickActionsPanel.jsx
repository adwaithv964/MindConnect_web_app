import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActionsPanel = ({ onAction, recentActions = [] }) => {
  const quickActions = [
    {
      id: 'new-session',
      label: 'Schedule Session',
      icon: 'CalendarPlus',
      color: 'bg-primary/10 hover:bg-primary/20 text-primary',
      description: 'Book new appointment'
    },
    {
      id: 'patient-notes',
      label: 'Session Notes',
      icon: 'FileText',
      color: 'bg-secondary/10 hover:bg-secondary/20 text-secondary',
      description: 'Add clinical notes'
    },
    {
      id: 'treatment-plan',
      label: 'Treatment Plan',
      icon: 'ClipboardList',
      color: 'bg-accent/10 hover:bg-accent/20 text-accent',
      description: 'Update care plan'
    },
    {
      id: 'prescriptions',
      label: 'Prescriptions',
      icon: 'Pill',
      color: 'bg-warning/10 hover:bg-warning/20 text-warning',
      description: 'Manage medications'
    },
    {
      id: 'reports',
      label: 'Generate Report',
      icon: 'BarChart3',
      color: 'bg-success/10 hover:bg-success/20 text-success',
      description: 'Patient progress report'
    },
    {
      id: 'referrals',
      label: 'Referrals',
      icon: 'UserPlus',
      color: 'bg-error/10 hover:bg-error/20 text-error',
      description: 'Specialist referral'
    }
  ];

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    const hrs = Math.floor(diff / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  // Fallback placeholder actions when no real data available
  const placeholderActions = [
    { label: 'Session notes added for a patient', time: '2h ago' },
    { label: 'Treatment plan updated', time: '5h ago' }
  ];

  const actionsToShow = recentActions.length > 0 ? recentActions : placeholderActions;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon name="Zap" size={20} className="text-primary" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-lg text-foreground">Quick Actions</h3>
          <p className="text-sm text-muted-foreground">Common tasks & workflows</p>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {quickActions?.map((action) => (
          <button
            key={action?.id}
            onClick={() => onAction(action?.id)}
            className={`p-4 rounded-lg ${action?.color} transition-all duration-200 text-left group`}
          >
            <Icon name={action?.icon} size={24} className="mb-3 group-hover:scale-110 transition-transform duration-200" />
            <p className="font-medium text-sm mb-1">{action?.label}</p>
            <p className="text-xs opacity-80">{action?.description}</p>
          </button>
        ))}
      </div>
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Clock" size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Recent Actions</span>
          </div>
          <Button variant="ghost" size="sm" iconName="History">
            View All
          </Button>
        </div>
        <div className="mt-3 space-y-2">
          {actionsToShow.slice(0, 4).map((action, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 bg-muted/30 rounded">
              <span className="text-xs text-foreground truncate mr-2">{action.label}</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {action.time || formatTimeAgo(action.createdAt)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActionsPanel;
