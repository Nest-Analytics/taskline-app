-- Add per-user project list (category catalogue). Stored as JSONB so we can
-- keep user-defined ordering without adding a relation table for a flat list.
ALTER TABLE "User"
ADD COLUMN "projects" JSONB NOT NULL
DEFAULT '["General","Marketing","Website Redesign","Sales","Product","Q4 Planning","Engineering"]'::jsonb;
