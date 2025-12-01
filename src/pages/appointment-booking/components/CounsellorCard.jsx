import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CounsellorCard = ({ counsellor, onBookAppointment }) => {
  return (
    <div className="glass-card p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <Image
            src={counsellor?.image}
            alt={counsellor?.imageAlt}
            className="w-20 h-20 rounded-full object-cover border-2 border-primary/20"
          />
          <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
            counsellor?.isAvailable ? 'bg-success' : 'bg-muted'
          }`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-heading font-semibold text-lg text-foreground">
                {counsellor?.name}
              </h3>
              <p className="text-sm text-muted-foreground">{counsellor?.credentials}</p>
            </div>
            <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-lg">
              <Icon name="Star" size={16} color="var(--color-primary)" />
              <span className="text-sm font-medium text-primary">{counsellor?.rating}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {counsellor?.specializations?.map((spec, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded-full"
              >
                {spec}
              </span>
            ))}
          </div>

          <p className="text-sm text-foreground/80 mb-4 line-clamp-2">
            {counsellor?.bio}
          </p>

          <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Icon name="Users" size={16} />
              <span>{counsellor?.patientsServed}+ patients</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="Clock" size={16} />
              <span>{counsellor?.experience} years exp.</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="Languages" size={16} />
              <span>{counsellor?.languages?.join(', ')}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
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
            <Button variant="outline" size="sm" iconName="User" iconPosition="left">
              View Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounsellorCard;