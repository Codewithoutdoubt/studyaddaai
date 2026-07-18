export const handler = async () => ({
  statusCode: 200,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ ok: true, name: 'studyhub', version: '0.1.0' }),
});

