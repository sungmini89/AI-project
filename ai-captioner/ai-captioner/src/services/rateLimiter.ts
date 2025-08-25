import { getRateTimestamps, setRateTimestamps, pushRateTimestamp } from './storage';

export function canProceedRateLimited(key: string, perMinute: number): boolean {
  const now = Date.now();
  const windowMs = 60_000;
  let arr = getRateTimestamps(key).filter((t) => now - t < windowMs);
  if (arr.length >= perMinute) {
    setRateTimestamps(key, arr);
    return false;
  }
  arr.push(now);
  setRateTimestamps(key, arr);
  return true;
}

export function recordOnly(key: string) {
  pushRateTimestamp(key, Date.now());
}
