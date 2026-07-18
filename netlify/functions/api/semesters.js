import { db } from '../../lib/db.js';
import { semesters } from '../../..//db/schema.js';

export const handler = async (event) => {
  const branchId = Number(event.queryStringParameters?.branchId);
  if (!branchId) {
    return { statusCode: 400, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: 'branchId is required' }) };
  }

  const rows = await db.select({
    id: semesters.id,
    branchId: semesters.branchId,
    semesterNumber: semesters.semesterNumber,
    name: semesters.name,
    slug: semesters.slug,
    description: semesters.description,
    isActive: semesters.isActive,
  }).from(semesters)
    .where((row) => row.branchId === branchId && row.isActive === true)
    .orderBy(semesters.semesterNumber);

  return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify(rows) };
};

