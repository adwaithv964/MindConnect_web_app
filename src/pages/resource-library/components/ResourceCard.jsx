import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ResourceCard = ({ resource, onBookmark, onPreview, onShare }) => {
    const [isBookmarked, setIsBookmarked] = useState(resource?.isBookmarked || false);

    const handleBookmark = () => {
        setIsBookmarked(!isBookmarked);
        onBookmark(resource?.id, !isBookmarked);
    };

    const getContentTypeIcon = (type) => {
        const icons = {
            article: 'FileText',
            video: 'Video',
            podcast: 'Mic',
            worksheet: 'FileCheck'
        };
        return icons?.[type] || 'FileText';
    };

    const getDifficultyColor = (level) => {
        const colors = {
            beginner: 'text-success',
            intermediate: 'text-warning',
            advanced: 'text-error'
        };
        return colors?.[level] || 'text-muted-foreground';
    };

    return (
        <div className="glass-card overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="relative h-48 overflow-hidden bg-muted">
                <Image
                    src={resource?.thumbnail}
                    alt={resource?.thumbnailAlt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm">
                    <Icon name={getContentTypeIcon(resource?.contentType)} size={14} className="text-primary" />
                    <span className="text-xs font-medium text-foreground capitalize">{resource?.contentType}</span>
                </div>
                <button
                    onClick={handleBookmark}
                    className="absolute top-3 right-3 flex items-center justify-center w-9 h-9 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background transition-colors duration-150"
                    aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                >
                    <Icon
                        name={isBookmarked ? 'Bookmark' : 'Bookmark'}
                        size={18}
                        className={isBookmarked ? 'text-primary fill-primary' : 'text-foreground'}
                    />
                </button>
            </div>
            <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading font-semibold text-base text-foreground line-clamp-2 flex-1">
                        {resource?.title}
                    </h3>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                    {resource?.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Icon name="User" size={14} />
                        <span>{resource?.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Icon name="Clock" size={14} />
                        <span>{resource?.duration}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {resource?.topics?.slice(0, 2)?.map((topic, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 rounded-md bg-secondary/10 text-secondary text-xs font-medium"
                        >
                            {topic}
                        </span>
                    ))}
                    {resource?.topics?.length > 2 && (
                        <span className="text-xs text-muted-foreground">+{resource?.topics?.length - 2} more</span>
                    )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            <Icon name="Star" size={14} className="text-warning fill-warning" />
                            <span className="text-sm font-medium text-foreground">{resource?.rating}</span>
                        </div>
                        <span className={`text-xs font-medium ${getDifficultyColor(resource?.difficulty)} capitalize`}>
                            {resource?.difficulty}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onPreview(resource)}
                            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors duration-150"
                            aria-label="Preview resource"
                        >
                            <Icon name="Eye" size={16} />
                        </button>
                        <button
                            onClick={() => onShare(resource)}
                            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors duration-150"
                            aria-label="Share resource"
                        >
                            <Icon name="Share2" size={16} />
                        </button>
                    </div>
                </div>

                <Button
                    variant="default"
                    fullWidth
                    onClick={() => onPreview(resource)}
                    iconName="ArrowRight"
                    iconPosition="right"
                >
                    View Resource
                </Button>
            </div>
        </div>
    );
};

export default ResourceCard;