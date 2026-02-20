/**
 * Seed the Resource Library with the 9 default resources.
 * Run once: node server/scripts/seedResources.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '../.env') });

const ResourceSchema = new mongoose.Schema({
    title: String,
    description: String,
    contentType: String,
    thumbnail: String,
    thumbnailAlt: String,
    author: String,
    duration: String,
    rating: Number,
    difficulty: String,
    topics: [String],
    preview: String,
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const Resource = mongoose.model('Resource', ResourceSchema);

const resources = [
    {
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
        preview: "Anxiety is a natural human emotion that everyone experiences. However, when anxiety becomes overwhelming or persistent, it can significantly impact daily life. This comprehensive guide explores the neurological basis of anxiety, identifies common triggers, and provides practical, evidence-based techniques for managing anxious thoughts and feelings."
    },
    {
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
        preview: "Discover powerful breathing techniques that activate your parasympathetic nervous system, helping you achieve immediate stress relief. These exercises are designed to be practiced anywhere, anytime you need to calm your mind and body."
    },
    {
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
        preview: "This comprehensive workbook guides you through the core principles of Cognitive Behavioral Therapy (CBT). Learn to identify automatic negative thoughts, understand cognitive distortions, and practice evidence-based techniques to reframe your thinking patterns."
    },
    {
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
        preview: "Join Dr. James Thompson as he explores the science of psychological resilience. Learn how to develop mental toughness, maintain optimism during challenges, and use adversity as an opportunity for personal growth."
    },
    {
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
        preview: "Begin your mindfulness journey with gentle, accessible meditation practices. This video guides you through basic techniques to anchor your attention, observe thoughts without judgment, and cultivate inner peace."
    },
    {
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
        preview: "Discover the foundations of healthy communication that strengthen relationships. Learn to express your needs clearly, listen with empathy, and navigate conflicts constructively to build deeper connections."
    },
    {
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
        preview: "Quality sleep is fundamental to mental health. This guide provides practical, science-backed strategies to optimize your sleep environment, establish consistent routines, and overcome common barriers to restful sleep."
    },
    {
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
        preview: "Depression can feel overwhelming, but small, consistent actions make a difference. This video presents evidence-based behavioral activation techniques and self-care strategies to help you manage symptoms and reconnect with life."
    },
    {
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
        preview: "Master the art of emotional regulation with this comprehensive DBT-based workbook. Learn to identify emotional triggers, practice distress tolerance, and develop skills to navigate intense feelings with greater ease and confidence."
    }
];

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    const existing = await Resource.countDocuments();
    if (existing > 0) {
        console.log(`Resources already seeded (${existing} found). Skipping.`);
        await mongoose.disconnect();
        return;
    }

    await Resource.insertMany(resources);
    console.log(`✅ Seeded ${resources.length} resources successfully.`);
    await mongoose.disconnect();
}

seed().catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
});
