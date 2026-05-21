'use client';

import { useEffect } from 'react';
import { getPreviewUrl } from '@/services/api';
import type { Image } from '@/types';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImagePreview({
  image,
  onClose,
}: {
  image: Image | null;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (image) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={getPreviewUrl(image.id)}
          alt={image.original_filename}
          className="w-full h-auto rounded-lg"
        />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl"
        >
          ×
        </button>
        <div className="bg-white mt-4 p-3 rounded-lg">
          <p className="font-medium truncate" title={image.original_filename}>
            {image.original_filename}
          </p>
          <p className="text-sm text-gray-600">
            {image.width}x{image.height} · {image.format.toUpperCase()} ·{' '}
            {formatBytes(image.size)}
          </p>
        </div>
      </div>
    </div>
  );
}
