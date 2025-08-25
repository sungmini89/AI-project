import type { CaptionType } from '@/services/aiService';

export default function CaptionOptions({ value, onChange }:{ value: CaptionType; onChange:(v:CaptionType)=>void }) {
  return (
    <div className="flex gap-2">
      {(['seo','sns','accessible'] as CaptionType[]).map((k) => (
        <button
          key={k}
          onClick={() => onChange(k)}
          className={`px-3 py-2 rounded border ${value===k? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        >
          {k==='seo'?'SEO':k==='sns'?'SNS':'Accessible'}
        </button>
      ))}
    </div>
  );
}
