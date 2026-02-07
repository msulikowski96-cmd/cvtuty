# CareerAI

## Overview
CareerAI is a mobile-first (Expo/React Native) application that uses AI to help users with their job search. It features a Node.js/Express backend with OpenAI integration and a PostgreSQL database via Drizzle ORM.

## Key Features
- **CV Optimization** - Tailor a CV to a specific job description
- **CV Audit (ATS)** - Analyze CV compatibility with Applicant Tracking Systems
- **Cover Letter Generation** - Create personalized cover letters
- **Interview Simulator** - Generate practice interview questions with answers
- **Skills Gap Analysis** - Compare skills against job requirements

## Project Architecture
- **Frontend**: Expo (React Native) with expo-router for navigation
  - Runs on port 8081 (Metro bundler)
  - Screens in `app/` directory
  - Shared components in `components/`
  - Hooks in `hooks/`
  - Constants/theme in `constants/`
- **Backend**: Express.js server with TypeScript
  - Runs on port 5000
  - Server code in `server/`
  - Routes in `server/routes.ts`
  - Database setup in `server/db.ts`
  - OpenAI integration via Replit AI Integrations (no API key needed)
- **Database**: PostgreSQL with Drizzle ORM
  - Schema in `shared/schema.ts` and `shared/models/chat.ts`
  - Drizzle config in `drizzle.config.ts`
- **Shared**: Types and schemas in `shared/`

## Workflows
- **Start Backend**: `npm run server:dev` - Runs the Express server on port 5000
- **Start Frontend**: `npm run expo:dev` - Runs Expo Metro bundler

## Recent Changes
- 2026-02-07: Initial import and environment setup
  - Installed Node.js dependencies
  - Created PostgreSQL database and pushed schema
  - Configured OpenAI AI Integrations (no API key required, billed to credits)

## User Preferences
- (None recorded yet)
