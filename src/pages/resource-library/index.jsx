import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '../../components/ui/RoleBasedSidebar';
import RoleBasedSidebar from '../../components/ui/RoleBasedSidebar';
import SOSFloatingButton from '../../components/ui/SOSFloatingButton';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import SearchBar from './components/SearchBar';
import FilterPanel from './components/FilterPanel';
import ResourceCard from './components/ResourceCard';
import RecommendedSection from './components/RecommendedSection';
import ProgressTracker from './components/ProgressTracker';
import PreviewModal from './components/PreviewModal';
import ShareModal from './components/ShareModal';
import Icon from '../../components/AppIcon';

const ResourceLibrary = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    contentTypes: [],
    topics: [],
    difficulty: '',
    duration: ''
  });
  const [selectedResource, setSelectedResource] = useState(null);
  const [shareResource, setShareResource] = useState(null);
  const [filteredResources, setFilteredResources] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchSuggestions = [
  "Managing anxiety during stressful times",
  "Mindfulness meditation techniques",
  "Coping with depression",
  "Building healthy relationships",
  "Stress management strategies",
  "Sleep hygiene tips",
  "Cognitive behavioral therapy basics",
  "Emotional regulation skills"];


  const mockResources = [
  {
    id: 1,
    title: "Understanding Anxiety: A Comprehensive Guide",
    description: "Learn about the science behind anxiety, common triggers, and evidence-based coping strategies to manage anxious thoughts and feelings effectively.",
    contentType: "article",
    thumbnail: "https://images.unsplash.com/photo-1728537218582-a7e754839591",
    thumbnailAlt: "Peaceful woman with closed eyes practicing mindfulness meditation in bright natural light setting",
    author: "Dr. Sarah Mitchell",
    duration: "12 min read",
    rating: 4.8,
    difficulty: "beginner",
    topics: ["Anxiety Management", "Coping Strategies"],
    isBookmarked: false,
    preview: "Anxiety is a natural human emotion that everyone experiences. However, when anxiety becomes overwhelming or persistent, it can significantly impact daily life. This comprehensive guide explores the neurological basis of anxiety, identifies common triggers, and provides practical, evidence-based techniques for managing anxious thoughts and feelings."
  },
  {
    id: 2,
    title: "5-Minute Breathing Exercises for Stress Relief",
    description: "Quick and effective breathing techniques you can practice anywhere to reduce stress, calm your nervous system, and improve mental clarity.",
    contentType: "video",
    thumbnail: "https://images.unsplash.com/photo-1590671455857-61b7c56a57f2",
    thumbnailAlt: "Young woman in white shirt practicing deep breathing exercise outdoors in serene natural environment",
    author: "Michael Chen, LMFT",
    duration: "5 min",
    rating: 4.9,
    difficulty: "beginner",
    topics: ["Stress Management", "Mindfulness"],
    isBookmarked: true,
    preview: "Discover powerful breathing techniques that activate your parasympathetic nervous system, helping you achieve immediate stress relief. These exercises are designed to be practiced anywhere, anytime you need to calm your mind and body."
  },
  {
    id: 3,
    title: "Cognitive Behavioral Therapy Workbook",
    description: "Interactive worksheets and exercises to identify negative thought patterns, challenge cognitive distortions, and develop healthier thinking habits.",
    contentType: "worksheet",
    thumbnail: "https://images.unsplash.com/photo-1612969307974-ee4e57d2d5a7",
    thumbnailAlt: "Open workbook with pen on wooden desk showing cognitive behavioral therapy exercises and thought tracking sheets",
    author: "Dr. Emily Rodriguez",
    duration: "30 min",
    rating: 4.7,
    difficulty: "intermediate",
    topics: ["Coping Strategies", "Depression Support"],
    isBookmarked: false,
    preview: "This comprehensive workbook guides you through the core principles of Cognitive Behavioral Therapy (CBT). Learn to identify automatic negative thoughts, understand cognitive distortions, and practice evidence-based techniques to reframe your thinking patterns."
  },
  {
    id: 4,
    title: "Building Resilience in Challenging Times",
    description: "Explore the psychology of resilience and learn practical strategies to bounce back from adversity, maintain hope, and grow through difficult experiences.",
    contentType: "podcast",
    thumbnail: "https://images.unsplash.com/photo-1701491332798-35f53bc3e9c0",
    thumbnailAlt: "Professional podcast recording setup with microphone and headphones in warm studio lighting environment",
    author: "Dr. James Thompson",
    duration: "45 min",
    rating: 4.6,
    difficulty: "intermediate",
    topics: ["Coping Strategies", "Stress Management"],
    isBookmarked: false,
    preview: "Join Dr. James Thompson as he explores the science of psychological resilience. Learn how to develop mental toughness, maintain optimism during challenges, and use adversity as an opportunity for personal growth."
  },
  {
    id: 5,
    title: "Mindfulness Meditation for Beginners",
    description: "Step-by-step guided meditation practices to cultivate present-moment awareness, reduce rumination, and develop a more peaceful relationship with your thoughts.",
    contentType: "video",
    thumbnail: "https://images.unsplash.com/photo-1734638901126-bd34c411a029",
    thumbnailAlt: "Woman sitting in lotus position meditating peacefully in minimalist room with soft natural lighting",
    author: "Lisa Anderson, Mindfulness Coach",
    duration: "20 min",
    rating: 4.9,
    difficulty: "beginner",
    topics: ["Mindfulness", "Anxiety Management"],
    isBookmarked: true,
    preview: "Begin your mindfulness journey with gentle, accessible meditation practices. This video guides you through basic techniques to anchor your attention, observe thoughts without judgment, and cultivate inner peace."
  },
  {
    id: 6,
    title: "Healthy Communication in Relationships",
    description: "Learn effective communication skills, active listening techniques, and conflict resolution strategies to build stronger, more fulfilling relationships.",
    contentType: "article",
    thumbnail: "https://images.unsplash.com/photo-1634113091397-447674d8030c",
    thumbnailAlt: "Two people having meaningful conversation at cafe table with warm lighting and engaged body language",
    author: "Dr. Rachel Green",
    duration: "15 min read",
    rating: 4.7,
    difficulty: "intermediate",
    topics: ["Relationships", "Coping Strategies"],
    isBookmarked: false,
    preview: "Discover the foundations of healthy communication that strengthen relationships. Learn to express your needs clearly, listen with empathy, and navigate conflicts constructively to build deeper connections."
  },
  {
    id: 7,
    title: "Sleep Hygiene: Your Guide to Better Rest",
    description: "Evidence-based strategies to improve sleep quality, establish healthy bedtime routines, and address common sleep disturbances affecting mental health.",
    contentType: "article",
    thumbnail: "https://images.unsplash.com/photo-1633128350449-2b778802ddc6",
    thumbnailAlt: "Peaceful bedroom with neatly made bed, soft pillows, and calming blue lighting creating restful atmosphere",
    author: "Dr. Mark Stevens",
    duration: "10 min read",
    rating: 4.8,
    difficulty: "beginner",
    topics: ["Stress Management", "Coping Strategies"],
    isBookmarked: false,
    preview: "Quality sleep is fundamental to mental health. This guide provides practical, science-backed strategies to optimize your sleep environment, establish consistent routines, and overcome common barriers to restful sleep."
  },
  {
    id: 8,
    title: "Managing Depression: Daily Strategies That Work",
    description: "Practical, actionable techniques to manage depressive symptoms, increase motivation, and gradually rebuild engagement with activities that bring meaning and joy.",
    contentType: "video",
    thumbnail: "https://images.unsplash.com/photo-1644412448740-40e5b6ded2dc",
    thumbnailAlt: "Person sitting by window with journal and coffee cup in contemplative mood with soft morning light",
    author: "Dr. Jennifer Martinez",
    duration: "18 min",
    rating: 4.6,
    difficulty: "intermediate",
    topics: ["Depression Support", "Coping Strategies"],
    isBookmarked: true,
    preview: "Depression can feel overwhelming, but small, consistent actions make a difference. This video presents evidence-based behavioral activation techniques and self-care strategies to help you manage symptoms and reconnect with life."
  },
  {
    id: 9,
    title: "Emotional Regulation Skills Workbook",
    description: "Comprehensive exercises to identify, understand, and manage intense emotions using dialectical behavior therapy (DBT) techniques and mindfulness practices.",
    contentType: "worksheet",
    thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_1a3186030-1764572789777.png",
    thumbnailAlt: "Organized desk with emotion tracking worksheet, colored pens, and mindfulness journal in bright workspace",
    author: "Dr. Amanda Foster",
    duration: "40 min",
    rating: 4.9,
    difficulty: "advanced",
    topics: ["Coping Strategies", "Anxiety Management"],
    isBookmarked: false,
    preview: "Master the art of emotional regulation with this comprehensive DBT-based workbook. Learn to identify emotional triggers, practice distress tolerance, and develop skills to navigate intense feelings with greater ease and confidence."
  }];


  const recommendedResources = mockResources?.filter((r) => r?.isBookmarked || r?.rating >= 4.8)?.slice(0, 3);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    filterResources();
  }, [searchQuery, filters]);

  const filterResources = () => {
    setIsLoading(true);

    setTimeout(() => {
      let filtered = [...mockResources];

      if (searchQuery) {
        filtered = filtered?.filter((resource) =>
        resource?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        resource?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        resource?.topics?.some((topic) => topic?.toLowerCase()?.includes(searchQuery?.toLowerCase()))
        );
      }

      if (filters?.contentTypes?.length > 0) {
        filtered = filtered?.filter((resource) =>
        filters?.contentTypes?.includes(resource?.contentType)
        );
      }

      if (filters?.topics?.length > 0) {
        filtered = filtered?.filter((resource) =>
        resource?.topics?.some((topic) =>
        filters?.topics?.some((filterTopic) =>
        topic?.toLowerCase()?.includes(filterTopic?.toLowerCase())
        )
        )
        );
      }

      if (filters?.difficulty) {
        filtered = filtered?.filter((resource) =>
        resource?.difficulty === filters?.difficulty
        );
      }

      if (filters?.duration) {
        const [min, max] = filters?.duration?.split('-')?.map((v) => parseInt(v) || Infinity);
        filtered = filtered?.filter((resource) => {
          const duration = parseInt(resource?.duration);
          return duration >= min && (max === Infinity || duration <= max);
        });
      }

      setFilteredResources(filtered);
      setIsLoading(false);
    }, 300);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleBookmark = (resourceId, isBookmarked) => {
    console.log(`Resource ${resourceId} bookmarked: ${isBookmarked}`);
  };

  const handlePreview = (resource) => {
    setSelectedResource(resource);
  };

  const handleShare = (resource) => {
    setShareResource(resource);
  };

  const handleStartResource = (resource) => {
    console.log('Starting resource:', resource?.id);
    setSelectedResource(null);
  };

  const handleShareSubmit = (shareData) => {
    console.log('Sharing resource:', shareData);
  };

  const handleEmergency = () => {
    console.log('Emergency SOS activated');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <RoleBasedSidebar userRole="patient" />
        
        <main className="main-content">
          <BreadcrumbTrail />

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <Icon name="BookOpen" size={24} className="text-primary" />
              </div>
              <div>
                <h1 className="font-heading font-semibold text-3xl text-foreground">Resource Library</h1>
                <p className="text-muted-foreground">Explore educational content and support materials</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <SearchBar onSearch={handleSearch} suggestions={searchSuggestions} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <ProgressTracker
                completedCount={12}
                totalCount={50}
                certificates={['Anxiety Management', 'Mindfulness Basics']} />

              <FilterPanel onFilterChange={handleFilterChange} isMobile={isMobile} />
            </div>

            <div className="lg:col-span-3">
              {recommendedResources?.length > 0 &&
              <RecommendedSection
                resources={recommendedResources}
                onBookmark={handleBookmark}
                onPreview={handlePreview}
                onShare={handleShare} />

              }

              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading font-semibold text-xl text-foreground">
                    All Resources
                    {filteredResources?.length > 0 &&
                    <span className="ml-2 text-muted-foreground text-base font-normal">
                        ({filteredResources?.length} {filteredResources?.length === 1 ? 'result' : 'results'})
                      </span>
                    }
                  </h2>
                </div>

                {isLoading ?
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6]?.map((i) =>
                  <div key={i} className="glass-card overflow-hidden">
                        <div className="skeleton h-48 w-full" />
                        <div className="p-4 space-y-3">
                          <div className="skeleton h-6 w-3/4" />
                          <div className="skeleton h-4 w-full" />
                          <div className="skeleton h-4 w-5/6" />
                          <div className="flex gap-2">
                            <div className="skeleton h-8 w-20" />
                            <div className="skeleton h-8 w-20" />
                          </div>
                        </div>
                      </div>
                  )}
                  </div> :
                filteredResources?.length > 0 ?
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources?.map((resource) =>
                  <ResourceCard
                    key={resource?.id}
                    resource={resource}
                    onBookmark={handleBookmark}
                    onPreview={handlePreview}
                    onShare={handleShare} />

                  )}
                  </div> :

                <div className="glass-card p-12 text-center">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-muted">
                      <Icon name="Search" size={32} className="text-muted-foreground" />
                    </div>
                    <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                      No resources found
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Try adjusting your search or filters to find what you're looking for
                    </p>
                  </div>
                }
              </div>
            </div>
          </div>
        </main>

        <SOSFloatingButton onEmergency={handleEmergency} />

        {selectedResource &&
        <PreviewModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
          onStartResource={handleStartResource} />

        }

        {shareResource &&
        <ShareModal
          resource={shareResource}
          onClose={() => setShareResource(null)}
          onShare={handleShareSubmit} />

        }
      </div>
    </SidebarProvider>);

};

export default ResourceLibrary;