import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ResourceRecommendationsCard = ({ resources, onViewLibrary }) => {
  const getTypeIcon = (type) => {
    const icons = {
      article: 'FileText',
      video: 'Video',
      audio: 'Headphones',
      guide: 'BookOpen'
    };
    return icons?.[type] || 'FileText';
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-heading font-semibold text-foreground">Recommended Resources</h2>
        <Icon name="BookOpen" size={20} className="text-primary" />
      </div>
      <div className="space-y-3 mb-4">
        {resources?.map((resource) => (
          <div 
            key={resource?.id} 
            className="flex items-start gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
          >
            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <Image 
                src={resource?.thumbnail} 
                alt={resource?.thumbnailAlt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Icon name={getTypeIcon(resource?.type)} size={20} color="#FFFFFF" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-foreground mb-1">{resource?.title}</h3>
              <p className="text-xs text-muted-foreground mb-2">{resource?.description}</p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                  {resource?.category}
                </span>
                <span className="text-xs text-muted-foreground">{resource?.duration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Button variant="default" fullWidth iconName="Library" onClick={onViewLibrary}>
        Browse Library
      </Button>
    </div>
  );
};

export default ResourceRecommendationsCard;