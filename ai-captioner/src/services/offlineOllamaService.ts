export async function callOllama(imageBase64: string, prompt: string): Promise<string> {
  const base = (import.meta.env.VITE_OLLAMA_BASE_URL as string) || 'http://localhost:11434';
  const model = (import.meta.env.VITE_OLLAMA_MODEL as string) || 'llava:latest';

  const res = await fetch(`${base}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      images: [imageBase64],
      stream: false
    })
  });
  if (!res.ok) throw new Error(`Ollama 실패: ${res.status}`);
  const data = await res.json();
  return (data.response || '').trim();
}
