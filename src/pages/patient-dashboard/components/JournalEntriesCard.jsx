import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const JournalEntriesCard = ({ entries, onViewAll, onNewEntry }) => {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-heading font-semibold text-foreground">Recent Journal Entries</h2>
        <Icon name="BookOpen" size={20} className="text-primary" />
      </div>
      <div className="space-y-3 mb-4">
        {entries?.map((entry) => (
          <div 
            key={entry?.id} 
            className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
            onClick={() => onViewAll(entry?.id)}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-foreground">{entry?.title}</h3>
              <span className="text-xs text-muted-foreground">{entry?.date}</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{entry?.preview}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                entry?.mood === 'positive' ? 'bg-success/10 text-success' :
                entry?.mood === 'neutral'? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning'
              }`}>
                {entry?.mood}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" fullWidth onClick={onViewAll}>
          View All
        </Button>
        <Button variant="default" fullWidth iconName="Plus" onClick={onNewEntry}>
          New Entry
        </Button>
      </div>
    </div>
  );
};

export default JournalEntriesCard;