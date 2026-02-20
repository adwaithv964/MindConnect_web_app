import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CounsellorProfileModal = ({ counsellor, onClose }) => {
  if (!counsellor) return null;

  const { fullProfile } = counsellor;

  const verificationBadge = {
    verified: { label: 'NMC Verified', color: 'text-success bg-success/10 border-success/20' },
    pending: { label: 'Verification Pending', color: 'text-warning bg-warning/10 border-warning/20' },
    failed: { label: 'Verification Failed', color: 'text-error bg-error/10 border-error/20' },
    unverified: { label: 'Not Verified', color: 'text-muted-foreground bg-muted border-border' }
  };

  const status = fullProfile?.nmcVerificationStatus || 'unverified';
  const badge = verificationBadge[status] || verificationBadge.unverified;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-5 flex items-center justify-between">
          <h2 className="font-heading font-semibold text-xl text-foreground">Counsellor Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <Image
                src={counsellor.image}
                alt={counsellor.imageAlt}
                className="w-20 h-20 rounded-full object-cover border-2 border-primary/20"
              />
              {counsellor.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center border-2 border-white">
                  <Icon name="Check" size={10} color="white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-xl text-foreground">{counsellor.name}</h3>
              <p className="text-muted-foreground text-sm mb-2">{counsellor.credentials}</p>
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${badge.color}`}>
                <Icon name="ShieldCheck" size={12} />
                {badge.label}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: 'Users', label: 'Patients', value: `${counsellor.patientsServed}+` },
              { icon: 'Clock', label: 'Experience', value: `${counsellor.experience} yrs` },
              { icon: 'Star', label: 'Rating', value: counsellor.rating?.toFixed(1) }
            ].map(stat => (
              <div key={stat.label} className="text-center p-3 bg-muted/50 rounded-lg">
                <Icon name={stat.icon} size={18} color="var(--color-primary)" className="mx-auto mb-1" />
                <p className="text-sm font-semibold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Bio */}
          {fullProfile?.bio && (
            <div>
              <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Icon name="FileText" size={16} color="var(--color-primary)" />
                About
              </h4>
              <p className="text-sm text-foreground/80 leading-relaxed">{fullProfile.bio}</p>
            </div>
          )}

          {/* Specializations */}
          {fullProfile?.specializations?.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Icon name="Target" size={16} color="var(--color-primary)" />
                Specializations
              </h4>
              <div className="flex flex-wrap gap-2">
                {fullProfile.specializations.map((spec, i) => (
                  <span key={i} className="text-xs px-3 py-1 bg-secondary/10 text-secondary rounded-full border border-secondary/20">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {counsellor.languages?.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Icon name="Languages" size={16} color="var(--color-primary)" />
                Languages
              </h4>
              <div className="flex flex-wrap gap-2">
                {counsellor.languages.map((lang, i) => (
                  <span key={i} className="text-xs px-3 py-1 bg-muted text-foreground rounded-full">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Qualifications */}
          {fullProfile?.qualifications && (
            <div>
              <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Icon name="GraduationCap" size={16} color="var(--color-primary)" />
                Qualifications
              </h4>
              <p className="text-sm text-foreground/80">{fullProfile.qualifications}</p>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-border">
          <Button variant="default" fullWidth iconName="Calendar" iconPosition="left" onClick={onClose}>
            Book a Session
          </Button>
        </div>
      </div>
    </div>
  );
};

const CounsellorCard = ({ counsellor, onBookAppointment, onSelectCounsellor, isSelected }) => {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <>
      <div
        className={`glass-card p-5 hover:shadow-lg transition-all duration-300 cursor-pointer
          ${isSelected ? 'ring-2 ring-primary border-primary/30' : ''}`}
        onClick={() => onSelectCounsellor?.(counsellor)}
      >
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <Image
              src={counsellor?.image}
              alt={counsellor?.imageAlt}
              className="w-18 h-18 rounded-full object-cover border-2 border-primary/20"
              style={{ width: '72px', height: '72px' }}
            />
            <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${counsellor?.isAvailable ? 'bg-success' : 'bg-muted'}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <h3 className="font-heading font-semibold text-base text-foreground flex items-center gap-1.5">
                  {counsellor?.name}
                  {counsellor?.isVerified && (
                    <span title="NMC Verified">
                      <Icon name="CheckCircle2" size={16} color="#2563EB" />
                    </span>
                  )}
                </h3>
                <p className="text-xs text-muted-foreground">{counsellor?.credentials}</p>
              </div>
              <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full flex-shrink-0">
                <Icon name="Star" size={12} color="var(--color-primary)" />
                <span className="text-xs font-medium text-primary">{counsellor?.rating}</span>
              </div>
            </div>

            {/* Specializations */}
            <div className="flex flex-wrap gap-1 mb-2">
              {counsellor?.specializations?.slice(0, 3).map((spec, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-secondary/10 text-secondary rounded-full">
                  {spec}
                </span>
              ))}
            </div>

            <p className="text-xs text-foreground/70 mb-3 line-clamp-2">{counsellor?.bio}</p>

            <div className="flex flex-wrap gap-3 mb-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Icon name="Users" size={12} />
                <span>{counsellor?.patientsServed}+ patients</span>
              </div>
              <div className="flex items-center gap-1">
                <Icon name="Clock" size={12} />
                <span>{counsellor?.experience} years exp.</span>
              </div>
              <div className="flex items-center gap-1">
                <Icon name="Languages" size={12} />
                <span>{counsellor?.languages?.slice(0, 2).join(', ')}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2" onClick={e => e.stopPropagation()}>
              <Button
                variant="default"
                size="sm"
                iconName="Calendar"
                iconPosition="left"
                onClick={() => onBookAppointment(counsellor)}
                disabled={!counsellor?.isAvailable}
              >
                {counsellor?.isAvailable ? 'Book Session' : 'Unavailable'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconName="User"
                iconPosition="left"
                onClick={() => setShowProfile(true)}
              >
                View Profile
              </Button>
              {isSelected && (
                <span className="flex items-center gap-1 text-xs text-primary font-medium px-2 py-1 bg-primary/10 rounded-lg">
                  <Icon name="CheckCircle2" size={12} />
                  Selected
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {showProfile && (
        <CounsellorProfileModal counsellor={counsellor} onClose={() => setShowProfile(false)} />
      )}
    </>
  );
};

export default CounsellorCard;