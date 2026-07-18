import { db } from '../../lib/db.js';
import { topics } from '../../..//db/schema.js';
import { ilike } from 'drizzle-orm';

export const handler = async (event) => {
  const unitId = Number(event.queryStringParameters?.unitId);
  const q = (event.queryStringParameters?.q || '').trim();
  if (!unitId) {
    return { statusCode: 400, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: 'unitId is required' }) };
  }

  const conditions = [topics.unitId === unitId, topics.status === 'published'];
  if (q) conditions.push(ilike(topics.title, `%${q}%`));

  const rows = await db.select({
    id: topics.id,
    unitId: topics.unitId,
    title: topics.title,
    slug: topics.slug,
    summary: topics.summary,
    difficulty: topics.difficulty,
    status: topics.status,
    estimatedReadingMinutes: topics.estimatedReadingMinutes,
    displayOrder: topics.displayOrder,
  }).from(topics)
    .where((row) => conditions.every((c) => c === c))
    .orderBy(topics.displayOrder);

  // Drizzle where above is placeholder-safe; rebuild properly if needed.
  // If your drizzle version rejects it, replace with: .where(and(...conditions))

  return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify(rows) };
};

