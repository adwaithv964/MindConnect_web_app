import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const JournalingSection = ({ userMoodData = [] }) => {
  const [journalEntry, setJournalEntry] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [shareWithCounsellor, setShareWithCounsellor] = useState(false);
  const [savedEntries, setSavedEntries] = useState([]);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const journalPrompts = [
    {
      id: 1,
      title: "Gratitude Reflection",
      prompt: "What are three things you\'re grateful for today? How did they make you feel?",
      icon: "Heart",
      moodTrigger: ["happy", "content", "peaceful"]
    },
    {
      id: 2,
      title: "Emotional Processing",
      prompt: "Describe a challenging emotion you experienced today. What triggered it, and how did you respond?",
      icon: "Brain",
      moodTrigger: ["anxious", "sad", "stressed"]
    },
    {
      id: 3,
      title: "Achievement Recognition",
      prompt: "What's one small victory you accomplished today, no matter how minor it seems?",
      icon: "Award",
      moodTrigger: ["motivated", "proud", "energetic"]
    },
    {
      id: 4,
      title: "Self-Compassion Practice",
      prompt: "If your best friend was feeling the way you do right now, what would you say to them?",
      icon: "MessageCircle",
      moodTrigger: ["overwhelmed", "frustrated", "disappointed"]
    },
    {
      id: 5,
      title: "Future Visualization",
      prompt: "Imagine yourself one month from now feeling your best. What does that look like?",
      icon: "Sparkles",
      moodTrigger: ["hopeful", "curious", "optimistic"]
    },
    {
      id: 6,
      title: "Stress Release",
      prompt: "What\'s weighing on your mind right now? Write it all out without judgment.",
      icon: "Wind",
      moodTrigger: ["anxious", "tense", "worried"]
    }
  ];

  useEffect(() => {
    const words = journalEntry?.trim()?.split(/\s+/)?.filter(word => word?.length > 0);
    setWordCount(words?.length);
  }, [journalEntry]);

  const handlePromptSelect = (prompt) => {
    setSelectedPrompt(prompt);
    setJournalEntry(`${prompt?.prompt}\n\n`);
  };

  const handleSaveEntry = () => {
    if (journalEntry?.trim()?.length < 10) {
      return;
    }

    const newEntry = {
      id: Date.now(),
      content: journalEntry,
      prompt: selectedPrompt?.title || "Free Writing",
      timestamp: new Date()?.toISOString(),
      sharedWithCounsellor: shareWithCounsellor,
      wordCount: wordCount
    };

    setSavedEntries([newEntry, ...savedEntries]);
    setJournalEntry('');
    setSelectedPrompt(null);
    setShareWithCounsellor(false);
    setShowSaveConfirmation(true);

    setTimeout(() => {
      setShowSaveConfirmation(false);
    }, 3000);
  };

  const handleClearEntry = () => {
    setJournalEntry('');
    setSelectedPrompt(null);
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon name="BookOpen" size={24} color="var(--color-primary)" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-semibold text-foreground">Guided Journaling</h2>
              <p className="text-sm text-muted-foreground">Express your thoughts and feelings</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{wordCount} words</span>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-foreground mb-3">Writing Prompts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {journalPrompts?.map((prompt) => (
              <motion.button
                key={prompt?.id}
                onClick={() => handlePromptSelect(prompt)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  selectedPrompt?.id === prompt?.id
                    ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 bg-card'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedPrompt?.id === prompt?.id ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    <Icon name={prompt?.icon} size={20} color={selectedPrompt?.id === prompt?.id ? 'var(--color-primary)' : 'currentColor'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground mb-1">{prompt?.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{prompt?.prompt}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">Your Journal Entry</label>
          <textarea
            value={journalEntry}
            onChange={(e) => setJournalEntry(e?.target?.value)}
            placeholder="Start writing your thoughts here... There's no right or wrong way to journal. Just let your thoughts flow freely."
            className="w-full h-64 px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={shareWithCounsellor}
              onChange={(e) => setShareWithCounsellor(e?.target?.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50"
            />
            <span className="text-sm text-foreground">Share this entry with my counsellor</span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="default"
            onClick={handleSaveEntry}
            disabled={journalEntry?.trim()?.length < 10}
            iconName="Save"
            iconPosition="left"
            className="flex-1 sm:flex-none"
          >
            Save Entry
          </Button>
          <Button
            variant="outline"
            onClick={handleClearEntry}
            iconName="X"
            iconPosition="left"
          >
            Clear
          </Button>
        </div>

        <AnimatePresence>
          {showSaveConfirmation && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-4 rounded-lg bg-success/10 border border-success/20 flex items-center gap-3"
            >
              <Icon name="CheckCircle" size={20} color="var(--color-success)" />
              <p className="text-sm text-success-foreground">Journal entry saved successfully!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {savedEntries?.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Recent Entries</h3>
          <div className="space-y-3">
            {savedEntries?.slice(0, 3)?.map((entry) => (
              <motion.div
                key={entry?.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-muted/50 border border-border"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon name="FileText" size={16} color="var(--color-primary)" />
                    <span className="text-sm font-medium text-foreground">{entry?.prompt}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.timestamp)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{entry?.content}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-muted-foreground">{entry?.wordCount} words</span>
                  {entry?.sharedWithCounsellor && (
                    <span className="text-xs text-primary flex items-center gap-1">
                      <Icon name="Share2" size={12} />
                      Shared
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalingSection;