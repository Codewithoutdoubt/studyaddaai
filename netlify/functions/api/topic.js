import { db } from '../../lib/db.js';
import { topics } from '../../..//db/schema.js';

export const handler = async (event) => {
  const id = Number(event.queryStringParameters?.id);
  if (!id) {
    return { statusCode: 400, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: 'id is required' }) };
  }

  const row = await db.select({
    id: topics.id,
    title: topics.title,
    slug: topics.slug,
    summary: topics.summary,
    definition: topics.definition,
    explanation: topics.explanation,
    diagram: topics.diagram,
    examples: topics.examples,
    advantages: topics.advantages,
    disadvantages: topics.disadvantages,
    applications: topics.applications,
    interviewQuestions: topics.interviewQuestions,
    examQuestions: topics.examQuestions,
    revisionNotes: topics.revisionNotes,
    references: topics.references,
    keywords: topics.keywords,
    difficulty: topics.difficulty,
    status: topics.status,
    estimatedReadingMinutes: topics.estimatedReadingMinutes,
  }).from(topics)
    .where((t) => t.id === id && t.status === 'published')
    .limit(1);

  const topic = row[0];
  if (!topic) {
    return { statusCode: 404, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: 'Topic not found' }) };
  }

  return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify(topic) };
};

