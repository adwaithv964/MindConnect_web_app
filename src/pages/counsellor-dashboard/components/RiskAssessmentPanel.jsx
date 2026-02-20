import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const RiskAssessmentPanel = ({ riskPatients, onViewPatient, onContactPatient }) => {
  const getRiskConfig = (level) => {
    const configs = {
      critical: {
        color: 'bg-destructive/10 border-destructive/30',
        textColor: 'text-destructive',
        icon: 'AlertTriangle',
        label: 'CRITICAL',
        priority: 1
      },
      high: {
        color: 'bg-error/10 border-error/30',
        textColor: 'text-error',
        icon: 'AlertCircle',
        label: 'HIGH RISK',
        priority: 2
      },
      medium: {
        color: 'bg-warning/10 border-warning/30',
        textColor: 'text-warning',
        icon: 'AlertOctagon',
        label: 'MEDIUM RISK',
        priority: 3
      }
    };
    return configs?.[level] || configs?.medium;
  };

  const formatLastContact = (date) => {
    const contactDate = new Date(date);
    const now = new Date();
    const diffHours = Math.floor((now - contactDate) / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const sortedPatients = [...riskPatients]?.sort((a, b) => {
    const configA = getRiskConfig(a?.riskLevel);
    const configB = getRiskConfig(b?.riskLevel);
    return configA?.priority - configB?.priority;
  });

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center">
            <Icon name="Shield" size={20} className="text-error" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-lg text-foreground">Risk Assessment</h3>
            <p className="text-sm text-muted-foreground">{riskPatients?.length} patients requiring attention</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" iconName="Filter">
          Filter
        </Button>
      </div>
      <div className="space-y-3">
        {sortedPatients?.map((patient) => {
          const config = getRiskConfig(patient?.riskLevel);
          return (
            <div
              key={patient?.id}
              className={`p-4 rounded-lg border-2 ${config?.color} hover:shadow-md transition-all duration-200`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="relative w-12 h-12">
                      {patient?.avatar ? (
                        <img
                          src={patient.avatar}
                          alt={patient?.avatarAlt || patient?.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-border"
                          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                      ) : null}
                      <div
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg"
                        style={{ display: patient?.avatar ? 'none' : 'flex' }}
                      >
                        {(patient?.name || 'P')[0].toUpperCase()}
                      </div>
                    </div>
                    <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${config?.color} flex items-center justify-center`}>
                      <Icon name={config?.icon} size={12} className={config?.textColor} />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{patient?.name}</h4>
                    <p className="text-xs text-muted-foreground">ID: {patient?.id}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${config?.textColor}`}>
                  {config?.label}
                </span>
              </div>
              <div className="space-y-2 mb-3">
                {patient?.riskFactors?.map((factor, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Icon name="AlertCircle" size={14} className={`${config?.textColor} mt-0.5 flex-shrink-0`} />
                    <p className="text-xs text-foreground">{factor}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Icon name="Clock" size={12} />
                    <span>Last contact: {formatLastContact(patient?.lastContact)}</span>
                  </div>
                  {patient?.flaggedBy && (
                    <div className="flex items-center gap-1">
                      <Icon name="Flag" size={12} />
                      <span>Flagged by {patient?.flaggedBy}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  iconName="FileText"
                  iconPosition="left"
                  onClick={() => onViewPatient(patient?.id)}
                >
                  View Details
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  fullWidth
                  iconName="Phone"
                  iconPosition="left"
                  onClick={() => onContactPatient(patient?.id)}
                >
                  Contact Now
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={20} className="text-primary mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Crisis Protocol</p>
            <p className="text-xs text-muted-foreground">
              For critical cases, follow immediate intervention protocol and contact emergency services if necessary. Document all actions taken.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAssessmentPanel;