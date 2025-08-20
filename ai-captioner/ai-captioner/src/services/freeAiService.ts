import { incrementFreeUsage, getFreeUsage } from './storage';

export async function callFreeApi(imageBase64: string, prompt: string) {
  const base = import.meta.env.VITE_FREE_API_BASE_URL as string;
  const key = import.meta.env.VITE_FREE_API_KEY as string | undefined;

  const res = await fetch(`${base}/caption`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(key ? { 'Authorization': `Bearer ${key}` } : {})
    },
    body: JSON.stringify({ image: imageBase64, prompt })
  });
  if (!res.ok) throw new Error(`Free API 실패: ${res.status}`);
  const data = await res.json();
  incrementFreeUsage();
  return data.caption as string;
}

export function isFreeLimitExceeded(): boolean {
  const dailyLimit = Number(import.meta.env.VITE_FREE_DAILY_LIMIT || 50);
  const monthlyLimit = Number(import.meta.env.VITE_FREE_MONTHLY_LIMIT || 500);
  const usage = getFreeUsage();
  const now = new Date();
  const dKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const mKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const dUsed = usage.daily[dKey] || 0;
  const mUsed = usage.monthly[mKey] || 0;
  return dUsed >= dailyLimit || mUsed >= monthlyLimit;
}
