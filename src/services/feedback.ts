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

const productionApiOrigin = 'https://my-shift-iota.vercel.app';

export async function loadFeedbackChallenge(): Promise<FeedbackChallenge> {
  const response = await fetch(feedbackApiUrl(), { cache: 'no-store' });
  if (!response.ok) throw new Error('challenge');
  return (await response.json()) as FeedbackChallenge;
}

export async function sendFeedback(payload: FeedbackPayload): Promise<void> {
  const response = await fetch(feedbackApiUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(response.status === 429 ? 'rate-limit' : 'send');
}

function feedbackApiUrl(): string {
  if (
    typeof window !== 'undefined' &&
    ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)
  ) {
    return `${productionApiOrigin}/api/feedback`;
  }
  return '/api/feedback';
}
