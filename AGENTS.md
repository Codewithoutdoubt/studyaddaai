# StudyHub Agent Guide

## Architecture

StudyHub is being delivered in approved phases. Phase 1 contains only the database foundation. Do not implement authentication, frontend pages, APIs, or admin features without explicit approval for the relevant phase.

## Key Directories

- `db/`: Drizzle schema and Netlify Database client.
- `netlify/database/migrations/`: generated, deployable PostgreSQL migrations.
- `netlify/functions/`: reserved for server-side endpoints in later phases.
- `assets/`: reserved for separated CSS, JavaScript, and image assets.
- `uploads/`: local placeholder only; deployed binary storage must use Netlify Blobs.
- `.netlify/results.md`: current task summary for the deployment workflow.

## Conventions

- Use snake_case for database table and column names.
- Use camelCase for TypeScript property names.
- Define every schema change in `db/schema.ts`, then generate a migration with `npm run db:generate`.
- Never edit generated Drizzle snapshots by hand.
- Preserve foreign keys, cascade behavior, unique constraints, and lookup indexes.
- Store passwords and reset tokens only as secure hashes.
- Store uploaded file metadata in the database and binary contents in Netlify Blobs.
- Keep each development phase focused; do not jump ahead.

## Non-Obvious Decisions

The product brief names PHP, MySQL, and XAMPP, while this repository runs as a Netlify project with mandatory Netlify persistence. The deployable source of truth is therefore PostgreSQL through `@netlify/database`. Keep the domain model portable and avoid PostgreSQL-specific application assumptions unless required by Netlify Database.
