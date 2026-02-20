import React, { useState, useEffect, useCallback } from 'react';
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
import AiDiscoveryPanel from './components/AiDiscoveryPanel';
import Icon from '../../components/AppIcon';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const ResourceLibrary = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    contentTypes: [],
    topics: [],
    difficulty: '',
    duration: ''
  });
  const [allResources, setAllResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [shareResource, setShareResource] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState({ completedCount: 0, totalCount: 0, certificates: [] });
  const [userId, setUserId] = useState(null);

  const searchSuggestions = [
    "Managing anxiety during stressful times",
    "Mindfulness meditation techniques",
    "Coping with depression",
    "Building healthy relationships",
    "Stress management strategies",
    "Sleep hygiene tips",
    "Cognitive behavioral therapy basics",
    "Emotional regulation skills"
  ];

  // Load userId from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const uid = storedUser?._id || storedUser?.id;
    setUserId(uid);
  }, []);

  // Fetch resources from API
  const fetchResources = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = userId
        ? `${API_BASE_URL}/api/resources?userId=${userId}`
        : `${API_BASE_URL}/api/resources`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch resources');
      const data = await res.json();
      setAllResources(data);
      setFilteredResources(data);
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Fetch user progress
  const fetchProgress = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/resources/progress/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch progress');
      const data = await res.json();
      setProgress(data);
    } catch (err) {
      console.error('Error fetching progress:', err);
    }
  }, [userId]);

  useEffect(() => {
    if (userId !== null) {
      fetchResources();
      fetchProgress();
    }
  }, [userId, fetchResources, fetchProgress]);

  // Resize handler
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter resources client-side whenever query or filters change
  useEffect(() => {
    let filtered = [...allResources];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.title?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.topics?.some(t => t.toLowerCase().includes(q))
      );
    }

    if (filters.contentTypes?.length > 0) {
      filtered = filtered.filter(r => filters.contentTypes.includes(r.contentType));
    }

    if (filters.topics?.length > 0) {
      filtered = filtered.filter(r =>
        r.topics?.some(topic =>
          filters.topics.some(ft => topic.toLowerCase().includes(ft.toLowerCase()))
        )
      );
    }

    if (filters.difficulty) {
      filtered = filtered.filter(r => r.difficulty === filters.difficulty);
    }

    if (filters.duration) {
      const [min, max] = filters.duration.split('-').map(v => parseInt(v) || Infinity);
      filtered = filtered.filter(r => {
        const dur = parseInt(r.duration);
        return dur >= min && (max === Infinity || dur <= max);
      });
    }

    setFilteredResources(filtered);
  }, [searchQuery, filters, allResources]);

  // Recommended: bookmarked + high-rated
  const recommendedResources = allResources
    .filter(r => r.isBookmarked || r.rating >= 4.8)
    .slice(0, 3);

  const handleSearch = (query) => setSearchQuery(query);
  const handleFilterChange = (newFilters) => setFilters(newFilters);

  const handleBookmark = async (resourceId, isBookmarked) => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/resources/${resourceId}/bookmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (!res.ok) throw new Error('Bookmark failed');
      const data = await res.json();

      // Update local state
      const updateList = (list) =>
        list.map(r =>
          r._id === resourceId ? { ...r, isBookmarked: data.isBookmarked } : r
        );
      setAllResources(prev => updateList(prev));
      setFilteredResources(prev => updateList(prev));
    } catch (err) {
      console.error('Error bookmarking resource:', err);
    }
  };

  const handlePreview = (resource) => setSelectedResource(resource);
  const handleShare = (resource) => setShareResource(resource);

  const handleStartResource = async (resource) => {
    if (!userId) {
      setSelectedResource(null);
      return;
    }
    try {
      await fetch(`${API_BASE_URL}/api/resources/${resource._id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      // Update local state
      const updateList = (list) =>
        list.map(r => r._id === resource._id ? { ...r, isCompleted: true } : r);
      setAllResources(prev => updateList(prev));
      setFilteredResources(prev => updateList(prev));

      // Refresh progress
      await fetchProgress();
    } catch (err) {
      console.error('Error marking resource complete:', err);
    }
    setSelectedResource(null);
  };

  const handleShareSubmit = (shareData) => {
    console.log('Sharing resource:', shareData);
    setShareResource(null);
  };

  const handleEmergency = () => console.log('Emergency SOS activated');

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

          {/* AI Discovery Panel */}
          <AiDiscoveryPanel />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <ProgressTracker
                completedCount={progress.completedCount}
                totalCount={progress.totalCount}
                certificates={progress.certificates}
              />
              <FilterPanel onFilterChange={handleFilterChange} isMobile={isMobile} />
            </div>

            <div className="lg:col-span-3">
              {recommendedResources.length > 0 && (
                <RecommendedSection
                  resources={recommendedResources}
                  onBookmark={handleBookmark}
                  onPreview={handlePreview}
                  onShare={handleShare}
                />
              )}

              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading font-semibold text-xl text-foreground">
                    All Resources
                    {filteredResources.length > 0 && (
                      <span className="ml-2 text-muted-foreground text-base font-normal">
                        ({filteredResources.length} {filteredResources.length === 1 ? 'result' : 'results'})
                      </span>
                    )}
                  </h2>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
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
                    ))}
                  </div>
                ) : filteredResources.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map(resource => (
                      <ResourceCard
                        key={resource._id}
                        resource={resource}
                        onBookmark={handleBookmark}
                        onPreview={handlePreview}
                        onShare={handleShare}
                      />
                    ))}
                  </div>
                ) : (
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
                )}
              </div>
            </div>
          </div>
        </main>

        <SOSFloatingButton onEmergency={handleEmergency} />

        {selectedResource && (
          <PreviewModal
            resource={selectedResource}
            onClose={() => setSelectedResource(null)}
            onStartResource={handleStartResource}
          />
        )}

        {shareResource && (
          <ShareModal
            resource={shareResource}
            onClose={() => setShareResource(null)}
            onShare={handleShareSubmit}
          />
        )}
      </div>
    </SidebarProvider>
  );
};

export default ResourceLibrary;