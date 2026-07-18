import { db } from '../../lib/db.js';
import { branches } from '../../..//db/schema.js';

export const handler = async () => {
  // Only active branches, newest first by display_order
  const rows = await db.select({
    id: branches.id,
    name: branches.name,
    code: branches.code,
    slug: branches.slug,
    icon: branches.icon,
    displayOrder: branches.displayOrder,
    description: branches.description,
  }).from(branches).where(branches.isActive === true).orderBy(branches.displayOrder);

  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(rows),
  };
};

