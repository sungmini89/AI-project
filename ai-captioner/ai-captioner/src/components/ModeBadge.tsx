export default function ModeBadge({ mode }: { mode: string }) {
  const color = mode === 'Offline' ? 'bg-emerald-600'
    : mode === 'Free' ? 'bg-blue-600'
    : mode === 'Mock' ? 'bg-gray-600'
    : 'bg-purple-600';
  return (
    <span className={`${color} text-white text-xs px-2 py-1 rounded-full`}>모드: {mode}</span>
  );
}
