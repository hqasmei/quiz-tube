export const PROJECT_PLANNER_AI_ID =
  process.env.NEXT_PUBLIC_PROJECT_PLANNER_AI_ID;

const eventsEndpoint = process.env.NEXT_PUBLIC_IS_LOCAL
  ? 'http://localhost:3000/api/events'
  : 'https://projectplannerai.com/api/events';

export async function trackEvent(key: string) {
  return fetch(eventsEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: JSON.stringify({
      key: key,
      projectId: PROJECT_PLANNER_AI_ID,
    }),
  });
}