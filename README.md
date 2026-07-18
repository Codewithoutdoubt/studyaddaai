# StudyHub

StudyHub is a structured study-management platform for engineering and polytechnic notes. Content follows the hierarchy Branch → Semester → Subject → Unit → Topic, with support planned for rich notes, previous-year questions, bookmarks, progress tracking, revision history, uploads, search, and administration.

## Current Phase

Phase 1 establishes the complete relational database foundation. Authentication, pages, APIs, and interface work remain intentionally unimplemented until the next phase is approved.

## Technology

- Netlify Database (managed PostgreSQL)
- Drizzle ORM and Drizzle Kit
- TypeScript database definitions
- Netlify deployment configuration

The original product brief requested MySQL on XAMPP. This repository uses Netlify Database because the active deployment environment requires persistent data to use Netlify platform primitives. The schema keeps conventional relational naming and constraints so a later MySQL port remains straightforward if the hosting target changes.

## Database Structure

The schema includes users and password resets; branches, semesters, subjects, units, and topics; topic images and media metadata; previous questions; bookmarks; study progress, sessions, and revision history; comments and related topics; user settings; and an administrative audit log.

Uploaded binaries are represented by storage keys only. A later upload phase should store images, PDFs, and videos in Netlify Blobs rather than in the relational database.

## Local Setup

1. Install Node.js 22 or newer.
2. Run `npm install`.
3. Link the directory to the intended Netlify site with the Netlify CLI.
4. Run `npm run db:generate` after changing `db/schema.ts`.
5. Use `netlify dev --port 8889` only when a later application phase adds runnable pages or functions.

No database credentials belong in the repository. Netlify configures the database connection automatically.
