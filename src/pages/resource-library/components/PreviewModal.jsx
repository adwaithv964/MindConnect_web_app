import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const PreviewModal = ({ resource, onClose, onStartResource }) => {
  if (!resource) return null;

  const getContentTypeIcon = (type) => {
    const icons = {
      article: 'FileText',
      video: 'Video',
      podcast: 'Mic',
      worksheet: 'FileCheck'
    };
    return icons?.[type] || 'FileText';
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass-card w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
          <h2 className="font-heading font-semibold text-xl text-foreground">Resource Preview</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted transition-colors duration-150"
            aria-label="Close preview"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="relative h-64 overflow-hidden rounded-lg bg-muted">
            <Image
              src={resource?.thumbnail}
              alt={resource?.thumbnailAlt}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm">
              <Icon name={getContentTypeIcon(resource?.contentType)} size={14} className="text-primary" />
              <span className="text-xs font-medium text-foreground capitalize">{resource?.contentType}</span>
            </div>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-2xl text-foreground mb-3">
              {resource?.title}
            </h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              {resource?.description}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Icon name="User" size={16} className="text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Author</p>
                <p className="text-sm font-medium text-foreground">{resource?.author}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Clock" size={16} className="text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-sm font-medium text-foreground">{resource?.duration}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Star" size={16} className="text-warning fill-warning" />
              <div>
                <p className="text-xs text-muted-foreground">Rating</p>
                <p className="text-sm font-medium text-foreground">{resource?.rating} / 5.0</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="BarChart" size={16} className="text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Level</p>
                <p className="text-sm font-medium text-foreground capitalize">{resource?.difficulty}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm text-foreground mb-3">Topics Covered</h4>
            <div className="flex flex-wrap gap-2">
              {resource?.topics?.map((topic, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary text-sm font-medium"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {resource?.preview && (
            <div className="p-4 rounded-lg bg-muted border border-border">
              <h4 className="font-medium text-sm text-foreground mb-2">Preview Content</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {resource?.preview}
              </p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button
              variant="default"
              fullWidth
              onClick={() => onStartResource(resource)}
              iconName="Play"
              iconPosition="left"
            >
              Start Resource
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;