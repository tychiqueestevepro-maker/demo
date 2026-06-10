-- Add rich structured AI output storage while keeping operational stage columns queryable.
ALTER TABLE "CampaignPlaybook"
ADD COLUMN "campaignSummary" TEXT,
ADD COLUMN "campaignLogic" JSONB,
ADD COLUMN "recommendedStatuses" JSONB,
ADD COLUMN "rules" JSONB,
ADD COLUMN "risks" JSONB,
ADD COLUMN "setupSuggestions" JSONB,
ADD COLUMN "rawAiOutput" JSONB,
ADD COLUMN "escalationLogic" TEXT,
ADD COLUMN "stopCondition" TEXT,
ADD COLUMN "successCondition" TEXT;

ALTER TABLE "PlaybookStage"
ADD COLUMN "goalOfStage" TEXT,
ADD COLUMN "recommendedChannel" TEXT,
ADD COLUMN "whyThisMessage" TEXT,
ADD COLUMN "nextStatus" TEXT,
ADD COLUMN "aiMetadata" JSONB;
