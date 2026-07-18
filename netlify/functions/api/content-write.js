import { db } from '../lib/db.js';
import { branches, semesters, subjects, units, topics } from '../../../db/schema.js';

function requireToken(event){
  const token = event.headers?.['x-content-write-token'] || '';
  if (!process.env.CONTENT_WRITE_TOKEN) {
    throw new Error('CONTENT_WRITE_TOKEN is not set');
  }
  if (token !== process.env.CONTENT_WRITE_TOKEN) {
    return false;
  }
  return true;
}

export const handler = async (event) => {
  try {
    if (!requireToken(event)) {
      return { statusCode: 401, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const body = JSON.parse(event.body || '{}');
    // Expected payload: { branches:[...], semesters:[...], subjects:[...], units:[...], topics:[...] }
    // Each child should include FK ids.
    const {
      branches: brs = [],
      semesters: ses = [],
      subjects: subs = [],
      units: uns = [],
      topics: tops = [],
    } = body;

    if (brs.length) await db.insert(branches).values(brs);
    if (ses.length) await db.insert(semesters).values(ses);
    if (subs.length) await db.insert(subjects).values(subs);
    if (uns.length) await db.insert(units).values(uns);
    if (tops.length) await db.insert(topics).values(tops);

    return { statusCode: 201, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: String(e.message || e) }) };
  }
};

