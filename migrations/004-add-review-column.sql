-- Migration 004: Add review column to conversations
-- M2: Rich conversation analysis replaces simple review log

-- Add review column to store structured Review data
ALTER TABLE conversations
  ADD COLUMN review JSONB,
  ADD COLUMN reviewed_at TIMESTAMP;

-- Index for quick retrieval of learner's latest review
CREATE INDEX idx_conversations_learner_reviewed
  ON conversations(learner_id, ended_at DESC)
  WHERE review IS NOT NULL;

-- Index for review data queries (if we want to query review content)
CREATE INDEX idx_conversations_review_level
  ON conversations((review->>'level'))
  WHERE review IS NOT NULL;

COMMENT ON COLUMN conversations.review IS 'M2: Rich conversation analysis (level, patterns, vocabulary, suggestions)';
COMMENT ON COLUMN conversations.reviewed_at IS 'When review was generated';
