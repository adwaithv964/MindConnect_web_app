const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const UserResourceProgress = require('../models/UserResourceProgress');
const AiDiscoveryCache = require('../models/AiDiscoveryCache');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ────────────────────────────────────────────────────────────
// POST /api/resources/ai-discover  — Gemini AI web search
// ────────────────────────────────────────────────────────────
router.post('/ai-discover', async (req, res) => {
    const { query } = req.body;
    if (!query || !query.trim()) {
        return res.status(400).json({ message: 'Search query is required' });
    }

    const normalizedQuery = query.trim().toLowerCase();

    // 1. Check cache first
    try {
        const cached = await AiDiscoveryCache.findOne({ query: normalizedQuery });
        if (cached) {
            console.log(`[AI Discovery] Cache hit for: "${normalizedQuery}"`);
            return res.json({ results: cached.results, fromCache: true });
        }
    } catch (cacheErr) {
        console.warn('[AI Discovery] Cache read error:', cacheErr.message);
    }

    // 2. Call Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        return res.status(503).json({ message: 'Gemini API key not configured. Add GEMINI_API_KEY to server/.env' });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        // Enable Google Search grounding so Gemini uses real live web data
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash'
        });

        const encodedQuery = encodeURIComponent(query);

        const prompt = `You are a mental health content curator. The user wants resources about: "${query}".

Return exactly 12 resources as a JSON array. Use this EXACT distribution:

**3 ARTICLES** — from Psychology Today, VeryWellMind, NIMH, Mayo Clinic, WebMD, Healthline, or Mind.org.uk.
  Use real, stable article URLs from these domains only. Example format: https://www.verywellmind.com/[real-slug]

**3 VIDEOS** — from YouTube. 
  IMPORTANT: Use YouTube SEARCH URLs, not specific video URLs, to guarantee they always work.
  Format EXACTLY: https://www.youtube.com/results?search_query=[url-encoded-search-term]
  Example: https://www.youtube.com/results?search_query=anxiety+relief+guided+meditation
  Set thumbnail to empty string "" for all videos.

**3 PODCASTS** — Use Spotify search URLs so they always work.
  Format EXACTLY: https://open.spotify.com/search/[url-encoded-topic]
  Example: https://open.spotify.com/search/anxiety%20management%20podcast
  Set thumbnail to empty string "" for all podcasts.

**3 WORKSHEETS** — from TherapistAid.com or PsychologyTools.com.
  These sites have stable URLs. Example: https://www.therapistaid.com/therapy-worksheets/anxiety/none

Return ONLY a valid JSON array. Do NOT wrap in markdown code fences. No explanations, no preamble, just the raw JSON array:
[
  {
    "title": "Descriptive resource title",
    "description": "Two sentences describing what this resource covers and what the user will learn.",
    "url": "https://guaranteed-working-url.com",
    "contentType": "article" | "video" | "podcast" | "worksheet",
    "author": "Author, channel name, or platform",
    "duration": "12 min read",
    "rating": 4.7,
    "source": "verywellmind.com",
    "thumbnail": ""
  }
]

Topic: "${query}"`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Parse JSON — handle markdown code fences that some models wrap response in
        let resources = [];
        try {
            // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
            const stripped = text
                .replace(/^```(?:json)?\s*/i, '')
                .replace(/\s*```\s*$/i, '')
                .trim();

            // Try direct parse first (cleanest path)
            try {
                resources = JSON.parse(stripped);
            } catch {
                // Fallback: extract array via regex
                const jsonMatch = stripped.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    resources = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('Could not find JSON array in response');
                }
            }
        } catch (parseErr) {
            console.error('[AI Discovery] JSON parse error:', parseErr.message);
            console.error('[AI Discovery] Raw response:', text.slice(0, 500));
            throw new Error(`Failed to parse Gemini response: ${parseErr.message}`);
        }

        // Safety net: rewrite any specific YouTube/Spotify URLs to search pages
        const safeUrl = (r) => {
            let url = r.url || '';
            try {
                const u = new URL(url);
                // YouTube: specific video → search page
                if (u.hostname.includes('youtube.com') && u.pathname === '/watch') {
                    const searchTerm = encodeURIComponent(r.title || query);
                    return `https://www.youtube.com/results?search_query=${searchTerm}`;
                }
                // Spotify: specific track/episode → search page
                if (u.hostname.includes('spotify.com') && !u.pathname.startsWith('/search')) {
                    return `https://open.spotify.com/search/${encodeURIComponent(r.title || query)}`;
                }
                // Apple Podcasts: specific episode → search page
                if (u.hostname.includes('podcasts.apple.com') && u.pathname.includes('/episodes/')) {
                    return `https://podcasts.apple.com/search?term=${encodeURIComponent(query)}`;
                }
            } catch (_) { /* bad URL, keep as-is */ }
            return url;
        };

        // Validate and sanitize
        resources = resources
            .filter(r => r.title && r.url && r.contentType)
            .map(r => {
                const url = safeUrl(r);
                let source = r.source;
                if (!source) {
                    try { source = new URL(url).hostname.replace('www.', ''); } catch (_) { source = ''; }
                }
                return {
                    title: r.title || '',
                    description: r.description || '',
                    url,
                    contentType: ['article', 'video', 'podcast', 'worksheet'].includes(r.contentType)
                        ? r.contentType : 'article',
                    author: r.author || '',
                    duration: r.duration || '',
                    rating: typeof r.rating === 'number' ? Math.min(5, Math.max(0, r.rating)) : 4.5,
                    source,
                    thumbnail: r.thumbnail || '',
                    isAiDiscovered: true
                };
            });

        // 3. Cache the results
        try {
            await AiDiscoveryCache.findOneAndUpdate(
                { query: normalizedQuery },
                { results: resources, createdAt: new Date() },
                { upsert: true, new: true }
            );
        } catch (cacheWriteErr) {
            console.warn('[AI Discovery] Cache write error:', cacheWriteErr.message);
        }

        res.json({ results: resources, fromCache: false });

    } catch (err) {
        console.error('[AI Discovery] Gemini error:', err.message);
        res.status(500).json({ message: 'AI discovery failed. Please try again.', error: err.message });
    }
});

// DELETE /api/resources/ai-cache — wipe all cached AI results (admin/dev use)
router.delete('/ai-cache', async (req, res) => {
    try {
        const result = await AiDiscoveryCache.deleteMany({});
        res.json({ message: `Cleared ${result.deletedCount} cached AI discovery results.` });
    } catch (err) {
        res.status(500).json({ message: 'Cache clear failed', error: err.message });
    }
});

// GET /api/resources?userId=xxx  — all resources with per-user status merged
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        const resources = await Resource.find({ isActive: true }).sort({ createdAt: -1 });

        if (!userId) return res.json(resources);

        // Merge bookmark/completed status for this user
        const progresses = await UserResourceProgress.find({ userId });
        const progressMap = {};
        progresses.forEach(p => {
            progressMap[p.resourceId.toString()] = p;
        });

        const enriched = resources.map(r => {
            const prog = progressMap[r._id.toString()];
            return {
                ...r.toObject(),
                isBookmarked: prog?.isBookmarked || false,
                isCompleted: prog?.isCompleted || false
            };
        });

        res.json(enriched);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/resources/progress/:userId — completed count, total, certificates
router.get('/progress/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const totalCount = await Resource.countDocuments({ isActive: true });
        const completedRecords = await UserResourceProgress.find({ userId, isCompleted: true }).populate('resourceId');

        const completedCount = completedRecords.length;

        // Compute certificates: topics where user has completed >= 3 resources
        const topicCounts = {};
        completedRecords.forEach(record => {
            const topics = record.resourceId?.topics || [];
            topics.forEach(topic => {
                topicCounts[topic] = (topicCounts[topic] || 0) + 1;
            });
        });

        const certificates = Object.entries(topicCounts)
            .filter(([, count]) => count >= 3)
            .map(([topic]) => topic);

        res.json({ completedCount, totalCount, certificates });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/resources/bookmarks/:userId — bookmarked resources
router.get('/bookmarks/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const bookmarked = await UserResourceProgress.find({ userId, isBookmarked: true }).populate('resourceId');
        const resources = bookmarked
            .filter(p => p.resourceId && p.resourceId.isActive)
            .map(p => ({ ...p.resourceId.toObject(), isBookmarked: true, isCompleted: p.isCompleted }));
        res.json(resources);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/resources/:id/bookmark — toggle bookmark
router.post('/:id/bookmark', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ message: 'userId is required' });

        let progress = await UserResourceProgress.findOne({ userId, resourceId: req.params.id });

        if (progress) {
            progress.isBookmarked = !progress.isBookmarked;
            await progress.save();
        } else {
            progress = await UserResourceProgress.create({
                userId,
                resourceId: req.params.id,
                isBookmarked: true,
                isCompleted: false
            });
        }

        res.json({ isBookmarked: progress.isBookmarked });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/resources/:id/complete — mark resource as completed
router.post('/:id/complete', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ message: 'userId is required' });

        const progress = await UserResourceProgress.findOneAndUpdate(
            { userId, resourceId: req.params.id },
            { $set: { isCompleted: true, completedAt: new Date() } },
            { upsert: true, new: true }
        );

        res.json({ isCompleted: progress.isCompleted });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
