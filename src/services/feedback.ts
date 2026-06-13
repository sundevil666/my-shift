export interface FeedbackChallenge {
  question: string;
  token: string;
}

export interface FeedbackPayload {
  name: string;
  email: string;
  message: string;
  answer: string;
  challengeToken: string;
  website: string;
}

export async function loadFeedbackChallenge(): Promise<FeedbackChallenge> {
  const response = await fetch('/api/feedback', { cache: 'no-store' });
  if (!response.ok) throw new Error('challenge');
  return (await response.json()) as FeedbackChallenge;
}

export async function sendFeedback(payload: FeedbackPayload): Promise<void> {
  const response = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(response.status === 429 ? 'rate-limit' : 'send');
}
