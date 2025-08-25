import { loadHistory } from '@/services/storage';
import { useMemo, useState } from 'react';

export default function HistoryPanel() {
  const [_, force] = useState(0);
  const items = useMemo(() => loadHistory(), [_,]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    alert('캡션이 복사되었습니다');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {items.map((it) => (
        <div key={it.id} className="border rounded p-3 space-y-2">
          <img src={it.imageDataUrl} alt="히스토리" className="w-full h-40 object-cover rounded" />
          <div className="text-xs text-gray-500">{new Date(it.createdAt).toLocaleString()}</div>
          <div className="text-sm whitespace-pre-wrap">{it.caption}</div>
          <button className="text-sm underline" onClick={() => handleCopy(it.caption)}>복사</button>
        </div>
      ))}
      {!items.length && <p className="text-sm text-gray-500">생성된 히스토리가 없습니다.</p>}
    </div>
  );
}
