export type CaptionRecord = {
  id: string;
  imageDataUrl: string;
  type: 'seo' | 'sns' | 'accessible';
  caption: string;
  createdAt: number;
};

const LS_HISTORY = 'caption_history_v1';
const LS_RATE = 'rate_limits_v1';
const LS_FREE_USAGE = 'free_usage_v1';

export function loadHistory(): CaptionRecord[] {
  try { return JSON.parse(localStorage.getItem(LS_HISTORY) || '[]'); } catch { return []; }
}
export function saveHistory(records: CaptionRecord[]) {
  localStorage.setItem(LS_HISTORY, JSON.stringify(records));
}
export function addHistory(record: CaptionRecord) {
  const arr = loadHistory();
  arr.unshift(record);
  saveHistory(arr.slice(0, 200));
}

export function pushRateTimestamp(key: string, ts: number) {
  const data = JSON.parse(localStorage.getItem(LS_RATE) || '{}');
  data[key] = data[key] || [];
  data[key].push(ts);
  localStorage.setItem(LS_RATE, JSON.stringify(data));
}
export function getRateTimestamps(key: string): number[] {
  const data = JSON.parse(localStorage.getItem(LS_RATE) || '{}');
  return data[key] || [];
}
export function setRateTimestamps(key: string, arr: number[]) {
  const data = JSON.parse(localStorage.getItem(LS_RATE) || '{}');
  data[key] = arr;
  localStorage.setItem(LS_RATE, JSON.stringify(data));
}

export function incrementFreeUsage() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const key = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const monthKey = `${y}-${String(m).padStart(2,'0')}`;
  const data = JSON.parse(localStorage.getItem(LS_FREE_USAGE) || '{}');
  data.daily = data.daily || {};
  data.monthly = data.monthly || {};
  data.daily[key] = (data.daily[key] || 0) + 1;
  data.monthly[monthKey] = (data.monthly[monthKey] || 0) + 1;
  localStorage.setItem(LS_FREE_USAGE, JSON.stringify(data));
}
export function getFreeUsage() {
  const data = JSON.parse(localStorage.getItem(LS_FREE_USAGE) || '{}');
  return {
    daily: data.daily || {},
    monthly: data.monthly || {}
  } as { daily: Record<string, number>; monthly: Record<string, number> };
}
