import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const TOPIC_CHIPS = [
    'Anxiety relief', 'Depression support', 'Mindfulness meditation',
    'Stress management', 'Sleep improvement', 'CBT techniques',
    'Grief & loss', 'Self-esteem', 'Panic attacks', 'Trauma healing'
];

const CONTENT_ICONS = {
    article: 'FileText',
    video: 'Video',
    podcast: 'Mic',
    worksheet: 'FileCheck'
};

const CONTENT_COLORS = {
    article: 'bg-blue-100 text-blue-700',
    video: 'bg-red-100 text-red-700',
    podcast: 'bg-purple-100 text-purple-700',
    worksheet: 'bg-green-100 text-green-700'
};

const AiResultCard = ({ resource }) => {
    const icon = CONTENT_ICONS[resource.contentType] || 'FileText';
    const badgeColor = CONTENT_COLORS[resource.contentType] || 'bg-gray-100 text-gray-700';
    const isYouTube = resource.source?.includes('youtube') || resource.url?.includes('youtube');

    return (
        <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group glass-card overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
        >
            {/* Thumbnail */}
            <div className="relative h-40 overflow-hidden bg-muted flex-shrink-0">
                {resource.thumbnail ? (
                    <img
                        src={resource.thumbnail}
                        alt={resource.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={e => { e.target.style.display = 'none'; }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                        <Icon name={icon} size={40} className="text-primary/40" />
                    </div>
                )}
                {/* Content type badge */}
                <div className={`absolute top-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${badgeColor}`}>
                    <Icon name={icon} size={12} />
                    <span className="capitalize">{resource.contentType}</span>
                </div>
                {/* External link indicator */}
                <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon name="ExternalLink" size={13} className="text-foreground" />
                </div>
                {isYouTube && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-red-600/90 flex items-center justify-center">
                            <Icon name="Play" size={20} className="text-white ml-1" />
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-2 flex-1">
                <h4 className="font-heading font-semibold text-sm text-foreground line-clamp-2 leading-snug">
                    {resource.title}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
                    {resource.description}
                </p>

                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs text-muted-foreground truncate max-w-[120px]">{resource.author}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {resource.duration && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Icon name="Clock" size={11} />
                                <span>{resource.duration}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-0.5 text-xs font-medium text-foreground">
                            <Icon name="Star" size={11} className="text-warning fill-warning" />
                            <span>{resource.rating?.toFixed(1)}</span>
                        </div>
                    </div>
                </div>

                {/* Source domain chip */}
                <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-4 h-4 rounded-sm flex items-center justify-center text-white text-[9px] font-bold uppercase flex-shrink-0"
                        style={{ background: `hsl(${(resource.source?.charCodeAt(0) || 65) * 7 % 360}, 60%, 45%)` }}>
                        {resource.source?.charAt(0) || '?'}
                    </div>
                    <span className="text-xs text-muted-foreground truncate">{resource.source}</span>
                </div>
            </div>
        </a>
    );
};

const AiDiscoveryPanel = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [lastQuery, setLastQuery] = useState('');
    const [fromCache, setFromCache] = useState(false);
    const [activeType, setActiveType] = useState('all');

    const handleSearch = async (searchQuery) => {
        const q = searchQuery || query;
        if (!q.trim()) return;

        setIsLoading(true);
        setError('');
        setResults([]);
        setLastQuery(q);
        setActiveType('all');

        try {
            const res = await fetch(`${API_BASE_URL}/api/resources/ai-discover`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: q })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'AI search failed');
            }

            const data = await res.json();
            setResults(data.results || []);
            setFromCache(data.fromCache || false);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChipClick = (chip) => {
        setQuery(chip);
        handleSearch(chip);
    };

    const filteredResults = activeType === 'all'
        ? results
        : results.filter(r => r.contentType === activeType);

    const typeCounts = {
        all: results.length,
        article: results.filter(r => r.contentType === 'article').length,
        video: results.filter(r => r.contentType === 'video').length,
        podcast: results.filter(r => r.contentType === 'podcast').length,
        worksheet: results.filter(r => r.contentType === 'worksheet').length,
    };

    return (
        <div className="mb-8">
            {/* Panel Header */}
            <div className="glass-card p-6 mb-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-primary">
                        <Icon name="Sparkles" size={22} className="text-white" />
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-background animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-heading font-semibold text-lg text-foreground flex items-center gap-2">
                            AI Resource Discovery
                            <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold">Powered by Gemini</span>
                        </h2>
                        <p className="text-sm text-muted-foreground">Enter any mental health topic — Gemini searches the web for the best resources</p>
                    </div>
                </div>

                {/* Search Input */}
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            placeholder="e.g. anxiety management, sleep improvement, depression coping..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => handleSearch()}
                        disabled={isLoading || !query.trim()}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-primary text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Searching...
                            </>
                        ) : (
                            <>
                                <Icon name="Sparkles" size={16} />
                                Discover
                            </>
                        )}
                    </button>
                </div>

                {/* Topic Chips */}
                <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-xs text-muted-foreground self-center">Try:</span>
                    {TOPIC_CHIPS.map(chip => (
                        <button
                            key={chip}
                            onClick={() => handleChipClick(chip)}
                            disabled={isLoading}
                            className="px-3 py-1.5 rounded-full border border-border text-xs font-medium text-foreground hover:bg-primary/5 hover:border-primary/30 transition-all disabled:opacity-50"
                        >
                            {chip}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="glass-card p-10 text-center">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-full border-4 border-violet-200 animate-ping" />
                        <div className="absolute inset-0 rounded-full border-4 border-t-violet-600 border-transparent animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Icon name="Sparkles" size={22} className="text-violet-600" />
                        </div>
                    </div>
                    <p className="font-medium text-foreground">Gemini is searching the web...</p>
                    <p className="text-sm text-muted-foreground mt-1">Finding top articles, videos, podcasts & worksheets for "{lastQuery}"</p>
                </div>
            )}

            {/* Error State */}
            {!isLoading && error && (
                <div className="glass-card p-6 border border-red-200 bg-red-50">
                    <div className="flex items-start gap-3">
                        <Icon name="AlertCircle" size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-red-800">AI Search Failed</p>
                            <p className="text-sm text-red-600 mt-1">{error}</p>
                            {error.includes('API key') && (
                                <code className="block mt-2 text-xs bg-red-100 text-red-700 px-3 py-2 rounded">
                                    Add GEMINI_API_KEY=your_key to server/.env and restart the server
                                </code>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Results */}
            {!isLoading && results.length > 0 && (
                <div className="glass-card p-6">
                    {/* Results Header */}
                    <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                            <Icon name="Sparkles" size={18} className="text-violet-500" />
                            <span className="font-heading font-semibold text-foreground">
                                {results.length} resources found for{' '}
                                <span className="text-violet-600">"{lastQuery}"</span>
                            </span>
                            {fromCache && (
                                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium flex items-center gap-1">
                                    <Icon name="Zap" size={10} /> Instant (cached)
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Type Filter Tabs */}
                    <div className="flex gap-2 mb-5 flex-wrap">
                        {[
                            { key: 'all', label: 'All', icon: 'LayoutGrid' },
                            { key: 'article', label: 'Articles', icon: 'FileText' },
                            { key: 'video', label: 'Videos', icon: 'Video' },
                            { key: 'podcast', label: 'Podcasts', icon: 'Mic' },
                            { key: 'worksheet', label: 'Worksheets', icon: 'FileCheck' },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveType(tab.key)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeType === tab.key
                                    ? 'bg-violet-600 text-white shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                <Icon name={tab.icon} size={14} />
                                {tab.label}
                                {typeCounts[tab.key] > 0 && (
                                    <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeType === tab.key ? 'bg-white/20 text-white' : 'bg-background text-muted-foreground'
                                        }`}>
                                        {typeCounts[tab.key]}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Resource Grid */}
                    {filteredResults.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredResults.map((resource, index) => (
                                <AiResultCard key={index} resource={resource} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <Icon name="Filter" size={32} className="mx-auto mb-2 opacity-40" />
                            <p>No {activeType} results found for this topic.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AiDiscoveryPanel;
