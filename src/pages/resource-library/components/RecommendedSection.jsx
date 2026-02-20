import React from 'react';
import Icon from '../../../components/AppIcon';
import ResourceCard from './ResourceCard';

const RecommendedSection = ({ resources, onBookmark, onPreview, onShare }) => {
  if (!resources || resources?.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
          <Icon name="Sparkles" size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="font-heading font-semibold text-xl text-foreground">Recommended For You</h2>
          <p className="text-sm text-muted-foreground">Based on your mood tracking and interests</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources?.map((resource, index) => (
          <ResourceCard
            key={resource?._id || resource?.id || index}
            resource={resource}
            onBookmark={onBookmark}
            onPreview={onPreview}
            onShare={onShare}
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendedSection;