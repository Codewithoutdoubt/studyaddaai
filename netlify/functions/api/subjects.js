import { db } from '../../lib/db.js';
import { subjects } from '../../..//db/schema.js';

export const handler = async (event) => {
  const semesterId = Number(event.queryStringParameters?.semesterId);
  if (!semesterId) {
    return { statusCode: 400, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: 'semesterId is required' }) };
  }

  const rows = await db.select({
    id: subjects.id,
    semesterId: subjects.semesterId,
    name: subjects.name,
    code: subjects.code,
    slug: subjects.slug,
    description: subjects.description,
    coverImageKey: subjects.coverImageKey,
    displayOrder: subjects.displayOrder,
    isActive: subjects.isActive,
  }).from(subjects)
    .where((row) => row.semesterId === semesterId && row.isActive === true)
    .orderBy(subjects.displayOrder);

  return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify(rows) };
};

