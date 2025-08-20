import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { fileToDataUrl } from '@/utils/image';

export default function DropzoneUploader({ onSelect }:{ onSelect: (dataUrl: string, file: File) => void }) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;
    const dataUrl = await fileToDataUrl(f);
    setPreview(dataUrl);
    onSelect(dataUrl, f);
  }, [onSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    multiple: false,
    onDrop,
  });

  return (
    <div className="space-y-3">
      <div {...getRootProps()} className={`border-2 border-dashed rounded p-6 text-center cursor-pointer ${isDragActive? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>이미지를 여기로 놓으세요…</p>
        ) : (
          <p>이미지를 드래그&드롭 하거나 클릭하여 업로드</p>
        )}
      </div>
      {preview && (
        <div className="flex justify-center">
          <img src={preview} alt="업로드 미리보기" className="max-h-72 rounded shadow" />
        </div>
      )}
    </div>
  );
}
