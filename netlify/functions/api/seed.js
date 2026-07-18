import { db } from '../lib/db.js';
import { branches, semesters, subjects, units, topics } from '../../../db/schema.js';

export const handler = async (event) => {
  const token = event.headers?.['x-content-write-token'] || '';
  if (!process.env.CONTENT_WRITE_TOKEN) {
    return { statusCode: 500, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: 'CONTENT_WRITE_TOKEN not set' }) };
  }
  if (token !== process.env.CONTENT_WRITE_TOKEN) {
    return { statusCode: 401, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  // Simple seed data (minimal, replace as needed)
  // NOTE: uses explicit ids only when you know the DB state; here we rely on serial ids.
  // Because FK ids are required, we must insert in order and then query for inserted ids.
  const t = Date.now();
  const branchRows = [
    {
      name: 'Engineering',
      code: 'ENG',
      slug: `engineering-${t}`,
      description: 'Engineering branch',
      icon: '⚙️',
      displayOrder: 0,
      isActive: true,
    },
  ];

  const insertedBranches = await db.insert(branches).values(branchRows).returning({ id: branches.id });
  const branchId = insertedBranches[0]?.id;

  const semesterRows = [
    {
      branchId,
      semesterNumber: 1,
      name: 'Semester 1',
      slug: `s1-${t}`,
      description: 'Foundation subjects',
      isActive: true,
    },
  ];
  const insertedSemesters = await db.insert(semesters).values(semesterRows).returning({ id: semesters.id });
  const semesterId = insertedSemesters[0]?.id;

  const subjectRows = [
    {
      semesterId,
      name: 'Programming Basics',
      code: 'CS101',
      slug: `cs101-${t}`,
      description: 'Intro programming concepts',
      coverImageKey: null,
      displayOrder: 0,
      isActive: true,
    },
  ];
  const insertedSubjects = await db.insert(subjects).values(subjectRows).returning({ id: subjects.id });
  const subjectId = insertedSubjects[0]?.id;

  const unitRows = [
    {
      subjectId,
      unitNumber: 1,
      title: 'Introduction',
      slug: `unit1-${t}`,
      overview: 'What is programming?',
      displayOrder: 0,
      isActive: true,
    },
  ];
  const insertedUnits = await db.insert(units).values(unitRows).returning({ id: units.id });
  const unitId = insertedUnits[0]?.id;

  const topicRows = [
    {
      unitId,
      authorId: null,
      title: 'What is Programming?',
      slug: `what-is-programming-${t}`,
      summary: 'Programming is how we instruct computers to perform tasks.',
      definition: 'Programming is the process of designing and implementing executable instructions.',
      explanation: 'At its core, programming translates problem-solving logic into code.',
      diagram: '',
      examples: 'Example: a program that prints "Hello World".',
      advantages: 'Automation, repeatability, scalability.',
      disadvantages: 'Requires learning, debugging time.',
      applications: 'Software development, automation, data processing.',
      interviewQuestions: 'Explain programming. What is a program?',
      examQuestions: 'Define programming. Give one application.',
      revisionNotes: 'Remember: programming = instructions for computers.',
      references: 'Computer Science textbooks.',
      keywords: ['programming', 'code', 'algorithms'],
      difficulty: 'easy',
      status: 'published',
      estimatedReadingMinutes: 3,
      displayOrder: 0,
      publishedAt: null,
    },
  ];

  await db.insert(topics).values(topicRows);

  return {
    statusCode: 201,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ok: true, branchId, semesterId, subjectId, unitId }),
  };
};

