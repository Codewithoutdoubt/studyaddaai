import { db } from '../../lib/db.js';
import { units } from '../../..//db/schema.js';

export const handler = async (event) => {
  const subjectId = Number(event.queryStringParameters?.subjectId);
  if (!subjectId) {
    return { statusCode: 400, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: 'subjectId is required' }) };
  }

  const rows = await db.select({
    id: units.id,
    subjectId: units.subjectId,
    unitNumber: units.unitNumber,
    title: units.title,
    slug: units.slug,
    overview: units.overview,
    displayOrder: units.displayOrder,
    isActive: units.isActive,
  }).from(units)
    .where((row) => row.subjectId === subjectId && row.isActive === true)
    .orderBy(units.unitNumber);

  return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify(rows) };
};

