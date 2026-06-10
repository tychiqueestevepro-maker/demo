# FollowPilot MVP Documentation

FollowPilot is a campaign coordination application. It helps a user create a campaign, define the goal, add targets, generate an AI playbook, track follow-ups, keep important data by campaign and target, and get AI summaries and next actions.

The MVP uses Supabase for hosted Postgres and authentication. Prisma remains the application ORM on top of Supabase Postgres.

The MVP is manual-first:

- It does not send messages automatically.
- It does not scrape.
- It does not connect LinkedIn, Gmail, Slack, or CRM systems.
- It prepares, organizes, summarizes, and guides.
- The user stays in control of every external action.

Core structure:

```text
Campaign -> Targets -> Playbook -> Follow-ups -> Data Directory -> Summaries -> Next Actions
```

## 1. Product Overview

### Problem

Users often run campaigns or processes involving multiple people, but context is scattered across spreadsheets, email, CRM, Slack, LinkedIn, docs, and personal notes. They lose context, forget follow-ups, do not know who should do what next, and lack a clear view of today's priority actions.

### Solution

FollowPilot turns a campaign goal into an operational playbook, then tracks each target with its context, data sources, follow-ups, AI summaries, and recommended next action.

### Target Audience

The MVP is intentionally horizontal. It can support outbound sales, recruiting, HR operations, client operations, vendor coordination, finance/admin follow-ups, and custom processes that require structured human follow-up.

### MVP

The MVP provides campaign creation, a guided wizard, AI-generated playbooks, target management, manual message copy/send flow, follow-up queues, data directory, activity timelines, templates, summaries, and a dashboard focused on what the user should do today.

### Exclusions

The MVP excludes automatic email sending, LinkedIn connection, scraping, Gmail sync, CRM integrations, Slack integrations, advanced team collaboration, payment collection, and advanced document storage.

### Value Proposition

FollowPilot gives users one campaign cockpit where goals become structured actions, follow-ups become visible, target context stays attached, and AI helps summarize and recommend what to do next without taking control away from the user.

## 2. Glossary

| Term | Definition |
| --- | --- |
| Campaign | A coordinated workflow with a clear goal, type, audience, playbook, targets, follow-ups, and context. |
| Target | A person, company, employee, candidate, client, vendor, account, or entity that moves through a campaign. |
| Playbook | The AI-generated campaign strategy: stages, messages, rules, statuses, escalation logic, stop condition, and success condition. |
| Stage | One step in a playbook, such as initial outreach, reminder, final message, escalation, or response handling. |
| Follow-up | A due or upcoming manual action for a target, usually connected to a playbook stage. |
| Data Source | A user-provided link or note that gives campaign or target context. |
| Update | A note, email summary, decision, blocker, document note, link, or status change added by the user. |
| Campaign Summary | AI summary of campaign progress, blockers, risks, hot targets, follow-ups due, and next priorities. |
| Target Summary | AI summary of one target's context, current situation, blocker, risk, recommended next action, and suggested message. |
| Escalation | A conditional action when normal follow-up is not enough, such as manager copy or operational escalation. |
| Status | The current state of a campaign, target, or follow-up. |
| Next Action | The most useful manual action the user should take next. |

## 3. MVP Scope

### Included

- Auth-ready user scoping
- Create campaign
- Campaign wizard
- AI playbook generation
- Add targets
- Import targets from CSV text
- Campaign detail page
- Target detail page
- Follow-up queue
- Campaign-level data directory
- Target-level data directory
- AI campaign summaries
- AI target summaries
- Manual copy/send flow
- Activity timeline
- Templates page
- Settings page

### Excluded

- Automatic email sending
- LinkedIn connection
- Scraping
- Gmail sync
- CRM integrations
- Slack integrations
- Advanced team collaboration
- Payment collection
- Advanced document storage

## 4. User Personas

| Persona | Job To Be Done | Pain | Expected Campaign Type | Value |
| --- | --- | --- | --- | --- |
| Solo founder doing outreach | Book calls, validate demand, follow up with prospects. | Context and follow-ups live in a spreadsheet and inbox. | Prospecting | Clear outbound playbook and daily follow-up queue. |
| Recruiter managing candidates | Move candidates from outreach to screen or decision. | Candidate context and replies are scattered. | Recruiting | Respectful sequence and candidate-level summary. |
| HR coordinator requesting employee actions | Collect signatures, forms, confirmations, or training completion. | Deadlines are missed and reminders are manual. | HR Request | Structured reminders and escalation rules. |
| Consultant following client requests | Collect documents, answers, approvals, or missing inputs. | Client context is split across docs, email, and notes. | Client Documents | Precise missing-item follow-up by target. |
| Operator coordinating vendors | Get vendor confirmation, delivery, quote, or issue resolution. | Vendor blocking points are hard to track. | Vendor Follow-up | Operational next action and source directory. |
| Finance/admin following invoices or documents | Confirm payment, resolve disputes, collect billing info. | Follow-ups need to become firmer without being sloppy. | Invoice Follow-up | Progressive tone and clear payment status tracking. |

## 5. Core User Flow

```text
1. User signs up
   |
2. User creates campaign
   |
3. User configures goal and context
   |
4. AI generates campaign playbook
   |
5. User reviews and edits playbook
   |
6. User adds targets
   |
7. App creates follow-up queue
   |
8. User copies messages and sends externally
   |
9. User marks actions as sent/replied/completed/stopped
   |
10. User adds updates and data sources
   |
11. AI updates summaries and recommended next actions
```

Implementation note: the current backend has service and route structure for the flow. The UI currently uses mock data and can be wired to the API later.

## 6. Campaign Types

| Type | Objective | Default Stages | Default Statuses | Default Rules | Tone | Escalation Logic | Success Condition | Stop Condition |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Prospecting | Get a reply, book a call, validate a problem, present an offer, or obtain a demo. | Initial problem-based message, soft follow-up, direct value/question follow-up, optional final close. | Not contacted, Initial sent, Waiting, Follow-up due, Replied, Interested, Not now, Stopped. | Keep pressure low to medium; stop on reply or stop request. | Human, short, non-aggressive. | Usually none unless account is warm or strategic. | Target replies, books call, or confirms next step. | No reply after final message or target opts out. |
| Recruiting | Get candidate interest, availability, or reactivation. | Initial role note, short follow-up, light final message, response templates. | Not contacted, Waiting, Replied, Interested, Not now, Not interested, Stopped. | Never push too hard; respect candidate autonomy. | Warm, respectful, concise. | No escalation to candidate; internal handoff only. | Candidate shares interest or availability. | Candidate declines, is unavailable, or no reply after final light touch. |
| HR Request | Get signature, document, form, training, validation, or mandatory information. | Initial request, reminder before deadline, urgent reminder, optional manager escalation. | Not contacted, Initial sent, Waiting, Follow-up due, Escalation due, Completed. | Use deadline and obligation to decide pressure. | Clear, polite, structured. | Manager copy when deadline or obligation is missed. | Required action completed. | Request completed, stopped by admin, or archived. |
| Client Documents | Collect missing documents or information to unblock work. | Initial checklist, missing-items reminder, deadline reminder, blocking notice. | Waiting, Follow-up due, Blocked, Completed. | Follow up only on remaining missing items. | Precise, professional. | Sponsor copy if missing documents block delivery. | All required items received. | All items complete or project cancelled. |
| Invoice Follow-up | Obtain payment, payment confirmation, dispute clarification, or AP owner. | Polite reminder, due-date reminder, firm reminder, optional final notice. | Waiting, Follow-up due, Replied, Blocked, Completed. | Tone becomes progressively firmer; avoid threats unless configured. | Polite, clear, progressively firm. | Escalate internally if payment is blocked or disputed. | Paid, payment date confirmed, or dispute owner identified. | Paid, cancelled, dispute moved elsewhere, or final notice complete. |
| Vendor Follow-up | Get quote, delivery date, intervention date, confirmation, document, payment, or resolution. | Confirmation ask, operational reminder, direct unblock message, alternative path. | Waiting, Follow-up due, Blocked, Completed. | If vendor blocks a process, ask directly and propose alternative. | Operational, direct, professional. | Escalate if vendor blocks critical work. | Vendor confirms or resolves the requested action. | Vendor completes action, alternative chosen, or sequence stopped. |
| Custom | Any repeatable goal involving people and follow-up. | Generated dynamically from requested outcome, target relationship, urgency, risk, deadline, and rules. | Determined by AI and user configuration. | Analyze requested action, actor, risk, pressure, and stop condition. | Based on context. | Only when justified by risk and relationship. | User-defined goal achieved. | User-defined stop rule or no useful next action. |

## 7. Pages

### Dashboard

Purpose: show what matters today.

Components:

- Active campaigns
- Follow-ups due today
- Blocked targets
- Recent activity
- AI daily summary
- Campaigns needing review

### Campaigns

Purpose: list campaigns and their status.

Components:

- Campaign table
- Filters
- Campaign cards
- Create campaign CTA

### Create Campaign

Purpose: guided wizard for campaign setup.

Steps:

1. Campaign purpose
2. Context
3. Follow-up rules
4. Targets
5. AI playbook preview

### Campaign Detail

Purpose: main campaign cockpit.

Sections:

- AI campaign summary
- Progress
- Target list
- Follow-ups
- Playbook
- Data sources
- Activity

### Target Detail

Purpose: see context and next action for one person/entity.

Sections:

- Profile
- AI target summary
- Current step
- Recommended action
- Message to copy
- Data sources
- Updates
- Timeline

### Follow-ups

Purpose: global queue of due actions.

Components:

- Due today
- Overdue
- Upcoming
- Priority
- Copy message
- Mark sent
- Snooze

### Data Directory

Purpose: show where important campaign and target data lives.

Levels:

- Campaign-level data
- Target-level data
- Missing sources
- Recently used sources

### Templates

Purpose: manage saved messages and generated playbook templates.

### Settings

Purpose: configure defaults, statuses, AI preferences, notification preferences, and profile settings.

## 8. Data Model

### User

| Field | Purpose |
| --- | --- |
| id | User primary key. |
| email | Unique login identity. |
| name | Display name. |
| avatarUrl | Optional avatar. |
| createdAt / updatedAt | Audit timestamps. |

Relationships: owns campaigns, targets, playbooks, stages, follow-ups, data sources, updates, activity logs, templates, and subscription.

Lifecycle: created during auth/signup; all app records are scoped to this user.

### Campaign

Purpose: top-level campaign object and ownership boundary.

Fields: userId, name, type, goal, description, targetAudience, channel, tone, urgency, status, priority, deadline, aiSummary, aiHealth, launchedAt, archivedAt.

Relationships: belongs to User; has targets, playbooks, stages, follow-ups, data sources, updates, and activity logs.

Lifecycle: Draft -> Active/Waiting/Blocked -> Completed/Archived.

### CampaignTarget

Purpose: one person/entity inside a campaign.

Fields: campaignId, userId, name, company, role, email, phone, profileUrl, customChannelUrl, notes, status, priority, currentStageId, lastActionAt, nextActionAt, followUpCount, aiSummary, aiRecommendedAction, aiRisk.

Relationships: belongs to User and Campaign; optionally references current PlaybookStage; has follow-ups, data sources, updates, and activity logs.

Lifecycle: added/imported -> contacted/followed up -> replied/completed/stopped/archived.

### CampaignPlaybook

Purpose: AI-generated operational strategy for a campaign.

Fields: campaignId, userId, name, description, campaignSummary, campaignLogic, recommendedStatuses, rules, risks, setupSuggestions, rawAiOutput, escalationLogic, stopCondition, successCondition, generatedByAi.

Relationships: belongs to User and Campaign; has PlaybookStages.

Lifecycle: generated as preview or persisted to a campaign; reviewed before launch.

### PlaybookStage

Purpose: one operational step in a playbook.

Fields: playbookId, campaignId, userId, order, name, type, goalOfStage, delayDays, condition, messageSubject, messageBody, recommendedChannel, whyThisMessage, nextStatus, aiMetadata, tone, isFinal, requiresEscalation.

Relationships: belongs to playbook, campaign, and user; can be the current stage for targets; can create follow-ups.

Lifecycle: generated with playbook; used to create and advance follow-ups.

### FollowUp

Purpose: a manual action that should happen at or after a due date.

Fields: campaignId, targetId, userId, stageId, status, dueAt, sentAt, copiedAt, completedAt, messageSubject, messageBody, reason, priority.

Relationships: belongs to User, Campaign, CampaignTarget, and optionally PlaybookStage.

Lifecycle: Pending/Due -> Copied -> Sent/Replied/Snoozed/Completed/Cancelled.

### DataSource

Purpose: user-provided context link or note.

Fields: userId, campaignId, targetId, title, type, url, description, importance, owner, lastCheckedAt.

Relationships: belongs to User; optionally belongs to Campaign and/or CampaignTarget.

Lifecycle: added, classified, checked, updated, deleted.

### Update

Purpose: user-provided note or event that changes context.

Fields: userId, campaignId, targetId, type, content, source, aiExtractedSummary.

Relationships: belongs to User and Campaign; optionally belongs to CampaignTarget.

Lifecycle: added by user; AI extracts summary/actions; campaign/target summaries can refresh.

### ActivityLog

Purpose: immutable-ish audit trail of important user/system events.

Fields: userId, campaignId, targetId, type, message, metadata, createdAt.

Relationships: belongs to User and Campaign; optionally belongs to CampaignTarget.

Lifecycle: written by services when major actions occur.

### Template

Purpose: saved message template by campaign type and stage type.

Fields: userId, campaignType, stageType, name, subject, body, tone, isDefault.

Relationships: belongs to User.

Lifecycle: created as default or custom template; reused in campaign generation/editing.

### Subscription

Purpose: billing readiness for future plans.

Fields: userId, plan, status, stripeCustomerId, stripeSubscriptionId, currentPeriodEnd.

Relationships: one subscription per User.

Lifecycle: created with user; Stripe integration later.

## 9. Status System

### Campaign Statuses

| Status | Meaning |
| --- | --- |
| Draft | Campaign is being configured. |
| Active | Campaign is live and has active follow-up work. |
| Waiting | Campaign is waiting on replies or external action. |
| Blocked | Campaign cannot progress without missing information or action. |
| Completed | Campaign goal is achieved or closed successfully. |
| Archived | Campaign is hidden from active workflows. |

### Target Statuses

| Status | Meaning |
| --- | --- |
| Not contacted | No message/action has been sent externally. |
| Initial sent | User marked initial message as sent. |
| Waiting | Waiting for target response or action. |
| Follow-up due | Next manual follow-up is due. |
| Follow-up sent | User marked a follow-up as sent. |
| Replied | Target replied. |
| Interested | Target showed positive interest. |
| Not now | Target delayed or asked to revisit later. |
| Not interested | Target declined. |
| Overdue | Target action is past due. |
| Escalation due | Escalation should be considered. |
| Escalated | Escalation happened or was marked. |
| Completed | Target goal is complete. |
| Stopped | Sequence stopped. |
| Archived | Target hidden from active workflow. |

### Follow-up Statuses

| Status | Meaning |
| --- | --- |
| Pending | Follow-up exists but is not due yet. |
| Due | Follow-up should be handled now. |
| Copied | User copied the prepared message. |
| Sent | User sent externally and marked sent. |
| Replied | Target replied. |
| Snoozed | Follow-up postponed. |
| Completed | Follow-up no longer needs action. |
| Cancelled | Follow-up cancelled by stop/completion/archive. |

## 10. AI System

### Responsibilities

- Generate campaign playbook
- Generate messages
- Summarize campaign
- Summarize target
- Extract actions from updates
- Classify data sources
- Recommend next action

### AI Must Not

- Invent facts
- Claim messages were sent
- Scrape
- Make external actions
- Override user control
- Suggest unauthorized LinkedIn/Gmail/Slack automation

### Structured Outputs

AI routes use OpenAI Responses API with strict Zod schemas. Runtime AI generation fails explicitly if `OPENAI_API_KEY` is missing.

```text
Request -> Zod input validation -> OpenAI provider -> Zod structured output -> service persistence/response
```

### Playbook Output

The playbook includes campaignSummary, campaignLogic, recommendedStatuses, stages, rules, escalationLogic, stopCondition, successCondition, risks, and setupSuggestions.

Operational columns remain queryable:

- PlaybookStage.order
- PlaybookStage.type
- PlaybookStage.delayDays
- PlaybookStage.condition
- PlaybookStage.messageSubject
- PlaybookStage.messageBody

Rich AI metadata is stored as JSON on CampaignPlaybook and PlaybookStage.

## 11. Manual Sending Flow

```text
1. App prepares message
2. User clicks copy
3. User sends externally in email/LinkedIn/Slack/other channel
4. User marks sent in FollowPilot
5. App logs MESSAGE_MARKED_SENT
6. App updates target/follow-up status
7. App schedules or reveals next follow-up
8. User marks replied/completed/stopped when outcome is known
```

Implementation rules:

- Copying a message never sends it.
- Marking sent records user-confirmed external action.
- The app should not imply delivery or open tracking.
- Follow-up creation is derived from playbook stages.

## 12. Data Directory Logic

### Campaign-level Sources

A campaign-level source applies to the whole campaign. Examples: campaign brief, offer doc, invoice policy, job description, client folder, vendor contract, spreadsheet, or shared note.

### Target-level Sources

A target-level source applies to one target/person/entity. Examples: profile link, email thread, target-specific invoice, target note, CRM record URL, custom link.

### Source Fields

| Field | Purpose |
| --- | --- |
| title | Human-readable source name. |
| type | Source category. |
| url | User-provided URL string. |
| description | Why the source matters. |
| importance | LOW, MEDIUM, HIGH, or URGENT. |
| owner | Person responsible for source context. |
| linked campaign | Campaign association. |
| linked target | Optional target association. |
| last checked | Last user-confirmed check time. |

AI classification can suggest source type, scope, importance, label, and reason. It must not fetch or verify the URL.

## 13. Security and Privacy

Rules:

- Every persisted record is scoped by `userId`.
- API routes call `requireUser()`.
- Services verify ownership before reads/writes.
- MVP has no public sharing.
- Inputs are validated with Zod.
- URLs are stored as strings.
- No scraping.
- No external email sending.
- No sensitive-data assumptions.
- Deletion/export should be supported later.

Auth note: API auth uses Supabase Auth access tokens. Clients should send `Authorization: Bearer <supabase-access-token>`. In local development only, `DEV_USER_ID` or the first seeded user can be used as a fallback when no bearer token is present.

## 14. API Documentation

All API routes require auth through `requireUser()`. In normal use, `requireUser()` validates the Supabase JWT with Supabase Auth, syncs the user into the local Prisma `User` table, and returns the Supabase user id as `userId`. Request bodies are validated with Zod. Responses use `{ data: ... }` on success and `{ error: ... }` on failure.

### Campaigns

| Method | Route | Purpose | Request Body | Response | Validation |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/campaigns` | List user campaigns. | None | Campaign list with counts. | Auth/user scope. |
| POST | `/api/campaigns` | Create campaign. | name, type, goal, context fields, status, priority, deadline. | Created Campaign. | `campaignCreateSchema`. |
| GET | `/api/campaigns/:id` | Get campaign cockpit data. | None | Campaign with targets, playbooks, follow-ups, sources, updates, activity. | Ownership by userId. |
| PATCH | `/api/campaigns/:id` | Update campaign. | Partial campaign fields. | Updated Campaign. | `campaignPatchSchema`. |
| DELETE | `/api/campaigns/:id` | Delete campaign. | None | 204. | Ownership by userId. |
| POST | `/api/campaigns/:id/launch` | Launch campaign and create initial follow-ups from latest playbook. | None | Updated Campaign. | Campaign must belong to user and have playbook. |
| POST | `/api/campaigns/:id/archive` | Archive campaign. | None | Updated Campaign. | Ownership by userId. |
| POST | `/api/campaigns/:id/complete` | Mark campaign completed. | None | Updated Campaign. | Ownership by userId. |
| POST | `/api/campaigns/generate-playbook` | Preview or persist AI playbook. | campaignId optional, type, goal, context, targetAudience, urgency, tone, channel, rules. | AI playbook JSON or persisted CampaignPlaybook. | `generatePlaybookSchema`; OpenAI key required. |

### Targets

| Method | Route | Purpose | Request Body | Response | Validation |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/campaigns/:id/targets` | List targets for campaign. | None | Target list. | Campaign ownership. |
| POST | `/api/campaigns/:id/targets` | Add one or many targets. | Target object or array. | Created targets. | `targetCreateSchema`. |
| POST | `/api/campaigns/:id/targets/import` | Import targets from CSV text. | `{ csv }` | Created targets. | `targetImportSchema`. |
| GET | `/api/targets/:targetId` | Get target detail. | None | Target with campaign, stage, follow-ups, sources, updates, activity. | Target ownership. |
| PATCH | `/api/targets/:targetId` | Update target. | Partial target fields. | Updated target. | `targetPatchSchema`. |
| DELETE | `/api/targets/:targetId` | Delete target. | None | 204. | Target ownership. |

### Target Actions

| Method | Route | Purpose | Request Body | Response | Validation |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/targets/:targetId/copy-message` | Mark next/prepared message copied. | followUpId optional, stageId optional. | Updated FollowUp or stage message. | `copyMessageSchema`; target ownership. |
| POST | `/api/targets/:targetId/mark-sent` | Mark manual external send. | followUpId optional. | Updated FollowUp. | `markSentSchema`; target ownership. |
| POST | `/api/targets/:targetId/mark-replied` | Mark target replied. | None | Updated target. | Target ownership. |
| POST | `/api/targets/:targetId/mark-completed` | Mark target completed. | None | Updated target. | Target ownership. |
| POST | `/api/targets/:targetId/snooze` | Snooze target/follow-ups. | `{ dueAt }` | Updated target. | `snoozeSchema`. |
| POST | `/api/targets/:targetId/stop` | Stop target sequence. | None | Updated target. | Target ownership. |
| POST | `/api/targets/:targetId/escalate` | Mark escalation due. | None | Updated target. | Target ownership. |

### Follow-ups

| Method | Route | Purpose | Request Body | Response | Validation |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/follow-ups` | List all user follow-ups. | None | Follow-up list with campaign/target/stage. | Auth/user scope. |
| GET | `/api/follow-ups/today` | List due follow-ups for today. | None | Follow-up list. | Auth/user scope. |
| PATCH | `/api/follow-ups/:id` | Update follow-up. | Partial status/dates/message/reason/priority. | Updated FollowUp. | `followUpPatchSchema`; ownership. |
| POST | `/api/follow-ups/:id/snooze` | Snooze follow-up. | `{ dueAt }` | Updated FollowUp. | `snoozeSchema`; ownership. |
| POST | `/api/follow-ups/:id/mark-sent` | Mark manual send. | None | Updated FollowUp. | Ownership. |
| POST | `/api/follow-ups/:id/mark-copied` | Mark message copied. | None | Updated FollowUp. | Ownership. |

### Data Sources

| Method | Route | Purpose | Request Body | Response | Validation |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/data-sources` | List user data sources. | None | DataSource list. | Auth/user scope. |
| POST | `/api/data-sources` | Add source. | campaignId optional, targetId optional, title, type, url, description, importance, owner, lastCheckedAt. | Created DataSource. | `dataSourceCreateSchema`; scope ownership. |
| PATCH | `/api/data-sources/:id` | Update source. | Partial source fields. | Updated DataSource. | `dataSourcePatchSchema`; ownership. |
| DELETE | `/api/data-sources/:id` | Delete source. | None | 204. | Ownership. |
| GET | `/api/campaigns/:id/data-sources` | List campaign sources. | None | DataSource list. | Campaign ownership. |
| GET | `/api/targets/:targetId/data-sources` | List target sources. | None | DataSource list. | Target ownership. |

### Updates

| Method | Route | Purpose | Request Body | Response | Validation |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/campaigns/:id/updates` | List campaign updates. | None | Update list. | Campaign ownership. |
| POST | `/api/campaigns/:id/updates` | Add campaign update and refresh summary placeholder. | targetId optional, type, content, source, aiExtractedSummary. | Created Update. | `updateCreateSchema`. |
| GET | `/api/targets/:targetId/updates` | List target updates. | None | Update list. | Target ownership. |
| POST | `/api/targets/:targetId/updates` | Add target update. | type, content, source, aiExtractedSummary. | Created Update. | `updateCreateSchema` without targetId. |

### AI

| Method | Route | Purpose | Request Body | Response | Validation |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/ai/generate-playbook` | Generate structured playbook preview. | type, goal, context, targetAudience, urgency, tone, channel, rules. | Campaign playbook output JSON. | `generatePlaybookSchema`; OpenAI key required. |
| POST | `/api/ai/campaign-summary` | Generate campaign summary. | goal, progress, targets, followUps, blockers, updates, dataSources. | Campaign summary output JSON. | Route schema and AI output schema. |
| POST | `/api/ai/target-summary` | Generate target summary. | campaignContext, targetData, notes, updates, dataSources, previousMessages, currentStatus, name. | Target summary output JSON. | Route schema and AI output schema. |
| POST | `/api/ai/classify-data-source` | Classify a user-provided source. | title, url, note, campaignContext, targetContext. | Source classification JSON. | Route schema and AI output schema. |
| POST | `/api/ai/extract-actions-from-update` | Extract summary/actions from update. | content, campaignContext, targetContext. | Extraction JSON. | Route schema and AI output schema. |
| POST | `/api/ai/regenerate-message` | Rewrite a prepared message. | currentMessage, tone. | `{ message }`. | Route schema and AI output schema. |

### Dashboard

| Method | Route | Purpose | Request Body | Response | Validation |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/dashboard` | Show active campaigns, due follow-ups, blocked targets, recent updates, campaigns needing review, and AI briefing placeholder. | None | Dashboard aggregate. | Auth/user scope. |

### Templates

The Prisma model and UI page exist. Template API routes are not implemented yet. Expected future routes:

- `GET /api/templates`
- `POST /api/templates`
- `PATCH /api/templates/:id`
- `DELETE /api/templates/:id`

## 15. Future Roadmap

### V1

- Email reminders
- CSV import/export
- Better AI summaries
- Campaign analytics
- Team seats

### V2

- Gmail integration
- Outlook integration
- Slack integration
- CRM import
- Calendar reminders
- Notifications
- Permissions

### V3

- Optional automatic sending
- Advanced reporting
- Chrome extension
- Integrations marketplace
- Multi-workspace

## 16. Acceptance Criteria

The MVP is complete when:

- User can create campaign.
- AI generates playbook.
- User can add targets.
- User can view campaign detail.
- User can view target detail.
- User can copy messages.
- User can mark actions as sent/replied/done.
- Follow-up queue works.
- Data sources can be added at campaign and target level.
- AI summaries display.
- Dashboard shows today's actions.

## 17. Developer Setup

### Install Dependencies

```bash
npm install
```

### Environment Variables

Copy the example file:

```bash
copy .env.example .env
```

Required:

| Variable | Purpose |
| --- | --- |
| DATABASE_URL | Supabase Postgres connection string for Prisma. Use the Supavisor session pooler string from the Supabase dashboard. |
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL. |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anon key used to validate Auth JWTs server-side. |
| OPENAI_API_KEY | OpenAI API key for AI routes. |
| OPENAI_MODEL | OpenAI model, defaults to `gpt-5.5` in `.env.example`. |
| DEV_USER_ID | Optional local fallback user id when no Supabase bearer token is present. |

Example Supabase database URL shape:

```text
postgresql://prisma.[PROJECT-REF]:[PRISMA-PASSWORD]@[DB-REGION].pooler.supabase.com:5432/postgres
```

Recommended Supabase setup:

```sql
create user "prisma" with password 'custom_password' bypassrls createdb;
grant "prisma" to "postgres";
grant usage on schema public to prisma;
grant create on schema public to prisma;
grant all on all tables in schema public to prisma;
grant all on all routines in schema public to prisma;
grant all on all sequences in schema public to prisma;
alter default privileges for role postgres in schema public grant all on tables to prisma;
alter default privileges for role postgres in schema public grant all on routines to prisma;
alter default privileges for role postgres in schema public grant all on sequences to prisma;
```

### Database Setup

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

If the Supabase connection string is missing or invalid, migrations will fail. Confirm the project ref, database password, pooler host, and port in the Supabase dashboard.

### Run Development Server

```bash
npm run dev
```

Default app URL:

```text
http://localhost:3000
```

### Verification

```bash
npm run lint
npm run test
npx tsc --noEmit
npm run build
```

### Suggested Manual Test Flow

```text
1. Create or seed a user.
2. Open dashboard.
3. Create a campaign.
4. Generate playbook with OpenAI key configured.
5. Add targets manually or through CSV text.
6. Launch campaign.
7. Open follow-up queue.
8. Copy message.
9. Mark sent.
10. Mark target replied/completed/stopped.
11. Add data source.
12. Generate campaign and target summaries.
```

### API Auth Example

```bash
curl http://localhost:3000/api/campaigns \
  -H "Authorization: Bearer <supabase-access-token>"
```

## Implementation Notes

- Frontend mock data currently lives in `lib/mock-data.ts`.
- Backend services live in `lib/services`.
- API routes live in `app/api`.
- Prisma models live in `prisma/schema.prisma`.
- AI output contracts live in `lib/ai-schemas.ts`.
- OpenAI adapter lives in `lib/services/ai-provider.ts`.
- Supabase server client lives in `lib/supabase/server.ts`.
- API auth and Supabase user sync live in `lib/auth.ts`.
- The current MVP backend is multi-user ready through `userId` scoping, while the product can still behave as a solo-user MVP.
